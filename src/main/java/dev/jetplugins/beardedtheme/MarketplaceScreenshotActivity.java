package dev.jetplugins.beardedtheme;

import com.intellij.ide.projectView.ProjectView;
import com.intellij.ide.ui.LafManager;
import com.intellij.ide.ui.UISettings;
import com.intellij.ide.ui.laf.UIThemeLookAndFeelInfo;
import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.editor.Editor;
import com.intellij.openapi.editor.ScrollType;
import com.intellij.openapi.fileEditor.FileEditor;
import com.intellij.openapi.fileEditor.FileEditorManager;
import com.intellij.openapi.fileEditor.TextEditor;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.options.ShowSettingsUtil;
import com.intellij.openapi.startup.ProjectActivity;
import com.intellij.openapi.vfs.LocalFileSystem;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.openapi.wm.IdeFrame;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowId;
import com.intellij.openapi.wm.ToolWindowManager;
import com.intellij.openapi.wm.WindowManager;
import com.intellij.openapi.wm.ex.ToolWindowEx;
import kotlin.Unit;
import kotlin.coroutines.Continuation;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import javax.imageio.ImageIO;
import javax.swing.AbstractButton;
import javax.swing.JComponent;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.RootPaneContainer;
import javax.swing.Timer;
import java.awt.Color;
import java.awt.Component;
import java.awt.Container;
import java.awt.Graphics2D;
import java.awt.Insets;
import java.awt.RenderingHints;
import java.awt.Window;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Captures Marketplace images from the live IntelliJ window when the dedicated
 * Gradle screenshot task starts the sandbox IDE. It is dormant in normal IDE sessions.
 */
public final class MarketplaceScreenshotActivity implements ProjectActivity {

    public static final String OUTPUT_PROPERTY = "beardedTheme.screenshotOutputDirectory";
    public static final String SAMPLE_FILE_PROPERTY = "beardedTheme.screenshotSampleFile";
    public static final String THEMES_PROPERTY = "beardedTheme.screenshotThemes";

    private static final Logger LOG = Logger.getInstance(MarketplaceScreenshotActivity.class);
    private static final AtomicBoolean STARTED = new AtomicBoolean();
    private static final int WIDTH = 1200;
    private static final int HEIGHT = 760;
    private static final int THEME_SETTLE_DELAY_MS = 1_000;
    private static final int VIDEO_FRAME_DELAY_MS = 100;
    private static final int VIDEO_FRAME_COUNT = 120;
    private static final String SETTINGS_SCREENSHOT = "plugin-settings.png";
    private static final String VIDEO_FRAMES_DIRECTORY = "_video-frames";
    private static final Pattern OBJECT_PATTERN = Pattern.compile("\\{([^{}]+)}");
    private static final Pattern SLUG_PATTERN = Pattern.compile("\\\"slug\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");
    private static final Pattern NAME_PATTERN = Pattern.compile("\\\"name\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"");

    @Nullable
    @Override
    public Object execute(@NotNull Project project, @NotNull Continuation<? super Unit> continuation) {
        String outputDirectory = System.getProperty(OUTPUT_PROPERTY);
        if (outputDirectory == null || outputDirectory.isBlank() || !STARTED.compareAndSet(false, true)) {
            return Unit.INSTANCE;
        }

        ApplicationManager.getApplication().invokeLater(() -> {
            Timer startupTimer = new Timer(8_000, event -> {
                ((Timer) event.getSource()).stop();
                startCapture(project, Path.of(outputDirectory));
            });
            startupTimer.setRepeats(false);
            startupTimer.start();
        });
        return Unit.INSTANCE;
    }

    private static void startCapture(Project project, Path outputDirectory) {
        try {
            Files.createDirectories(outputDirectory);
            configureUi();
            VirtualFile sampleFile = openSampleCode(project);
            showProjectTree(project, sampleFile);

            List<ThemeDescriptor> themes = selectedThemes(readThemeRegistry());
            if (themes.isEmpty()) {
                throw new IllegalStateException("No registered themes matched " + System.getProperty(THEMES_PROPERTY));
            }

            IdeFrame ideFrame = WindowManager.getInstance().getIdeFrame(project);
            JFrame frame = WindowManager.getInstance().getFrame(project);
            if (ideFrame == null || frame == null) {
                throw new IllegalStateException("The IntelliJ project window is not available");
            }

            sizeWindow(frame, ideFrame.getComponent());
            constrainProjectViewWidth(project);
            frame.toFront();
            new CaptureSession(project, outputDirectory, themes, ideFrame, frame).scheduleNext(1_500);
        } catch (Exception exception) {
            fail(outputDirectory, exception);
        }
    }

    private static void configureUi() {
        UISettings settings = UISettings.getInstance();
        settings.setCompactMode(false);
        settings.setHideToolStripes(false);
        settings.setShowMainToolbar(true);
        settings.setShowNewMainToolbar(true);
        settings.setShowStatusBar(true);
        settings.setShowFileIconInTabs(true);
        settings.setShowTreeIndentGuides(true);
        settings.setDifferentToolwindowBackground(true);
        settings.fireUISettingsChanged();
    }

    private static VirtualFile openSampleCode(Project project) {
        String samplePath = System.getProperty(SAMPLE_FILE_PROPERTY);
        if (samplePath == null || samplePath.isBlank()) {
            throw new IllegalStateException("Missing screenshot sample-file property");
        }

        VirtualFile sampleFile = LocalFileSystem.getInstance().refreshAndFindFileByNioFile(Path.of(samplePath));
        if (sampleFile == null) {
            throw new IllegalStateException("Sample code was not found: " + samplePath);
        }

        FileEditorManager fileEditorManager = FileEditorManager.getInstance(project);
        FileEditor[] fileEditors = fileEditorManager.openFile(sampleFile, true);
        for (FileEditor fileEditor : fileEditors) {
            if (fileEditor instanceof TextEditor textEditor) {
                Editor editor = textEditor.getEditor();
                fileEditorManager.runWhenLoaded(editor, () -> {
                    editor.getCaretModel().moveToOffset(0);
                    editor.getScrollingModel().scrollToCaret(ScrollType.MAKE_VISIBLE);
                    editor.getScrollingModel().scrollHorizontally(0);
                    editor.getScrollingModel().scrollVertically(0);
                });
            }
        }
        return sampleFile;
    }

    private static void showProjectTree(Project project, VirtualFile sampleFile) {
        ToolWindow projectWindow = ToolWindowManager.getInstance(project).getToolWindow(ToolWindowId.PROJECT_VIEW);
        if (projectWindow != null) {
            projectWindow.show(() -> ProjectView.getInstance(project).select(sampleFile, sampleFile, true));
        }
    }

    private static int constrainProjectViewWidth(Project project) {
        ToolWindow projectWindow = ToolWindowManager.getInstance(project).getToolWindow(ToolWindowId.PROJECT_VIEW);
        if (!(projectWindow instanceof ToolWindowEx projectWindowEx)) {
            throw new IllegalStateException("The Project tool window cannot be resized for Marketplace capture");
        }

        int targetWidth = WIDTH / 4;
        int currentWidth = projectWindow.getComponent().getWidth();
        if (currentWidth <= 0) {
            throw new IllegalStateException("The visible Project tool window has no measurable width");
        }
        projectWindowEx.stretchWidth(targetWidth - currentWidth);
        projectWindow.getComponent().revalidate();
        return projectWindow.getComponent().getWidth();
    }

    private static void sizeWindow(JFrame frame, JComponent component) {
        frame.setExtendedState(JFrame.NORMAL);
        Insets insets = frame.getInsets();
        frame.setSize(WIDTH + insets.left + insets.right, HEIGHT + insets.top + insets.bottom);
        frame.setLocationRelativeTo(null);
        frame.validate();

        int widthDifference = frame.getWidth() - component.getWidth();
        int heightDifference = frame.getHeight() - component.getHeight();
        frame.setSize(WIDTH + widthDifference, HEIGHT + heightDifference);
        frame.validate();
    }

    private static List<ThemeDescriptor> readThemeRegistry() throws IOException {
        try (InputStream stream = MarketplaceScreenshotActivity.class.getResourceAsStream("/themes/theme-list.json")) {
            if (stream == null) {
                throw new IOException("Bundled theme registry was not found");
            }
            String json = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            List<ThemeDescriptor> themes = new ArrayList<>();
            Matcher objects = OBJECT_PATTERN.matcher(json);
            while (objects.find()) {
                Matcher slug = SLUG_PATTERN.matcher(objects.group(1));
                Matcher name = NAME_PATTERN.matcher(objects.group(1));
                if (slug.find() && name.find()) {
                    themes.add(new ThemeDescriptor(slug.group(1), name.group(1)));
                }
            }
            return themes;
        }
    }

    private static List<ThemeDescriptor> selectedThemes(List<ThemeDescriptor> registered) {
        String requestedProperty = System.getProperty(THEMES_PROPERTY, "all");
        Set<String> requested = new LinkedHashSet<>();
        Arrays.stream(requestedProperty.split(",")).map(String::trim).forEach(requested::add);
        if (requested.contains("all")) {
            return registered;
        }
        return registered.stream().filter(theme -> requested.contains(theme.slug())).toList();
    }

    private static Map<String, UIThemeLookAndFeelInfo> installedThemesByName() {
        Map<String, UIThemeLookAndFeelInfo> installed = new LinkedHashMap<>();
        Iterator<UIThemeLookAndFeelInfo> themes = LafManager.getInstance().getInstalledThemes().iterator();
        while (themes.hasNext()) {
            UIThemeLookAndFeelInfo theme = themes.next();
            installed.put(theme.getName(), theme);
        }
        return installed;
    }

    private static void captureLiveComponent(JComponent component, Path output) throws IOException {
        int sourceWidth = component.getWidth();
        int sourceHeight = component.getHeight();
        if (sourceWidth <= 0 || sourceHeight <= 0) {
            throw new IllegalStateException("The live IntelliJ component has invalid dimensions: "
                + sourceWidth + "x" + sourceHeight);
        }

        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        graphics.setColor(component.getBackground() == null ? Color.BLACK : component.getBackground());
        graphics.fillRect(0, 0, WIDTH, HEIGHT);
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        graphics.scale(WIDTH / (double) sourceWidth, HEIGHT / (double) sourceHeight);
        component.printAll(graphics);
        graphics.dispose();

        if (!ImageIO.write(image, "png", output.toFile())) {
            throw new IOException("No PNG writer is available");
        }
    }

    private static void fail(Path outputDirectory, Exception exception) {
        LOG.error("Marketplace screenshot capture failed", exception);
        try {
            Files.createDirectories(outputDirectory);
            Files.writeString(outputDirectory.resolve("capture-error.txt"), exception.toString(), StandardCharsets.UTF_8);
        } catch (IOException markerFailure) {
            LOG.error("Could not write screenshot failure marker", markerFailure);
        }
        exitApplication();
    }

    private static void exitApplication() {
        var application = ApplicationManager.getApplication();
        application.invokeLaterOnWriteThread(() -> application.exit(true, true, false));
    }

    private record ThemeDescriptor(String slug, String name) {}

    private static final class CaptureSession {
        private final Project project;
        private final Path outputDirectory;
        private final List<ThemeDescriptor> themes;
        private final IdeFrame ideFrame;
        private final JFrame frame;
        private final Map<String, UIThemeLookAndFeelInfo> installedThemes = installedThemesByName();
        private int index;
        private Timer timer;

        private CaptureSession(
            Project project,
            Path outputDirectory,
            List<ThemeDescriptor> themes,
            IdeFrame ideFrame,
            JFrame frame
        ) {
            this.project = project;
            this.outputDirectory = outputDirectory;
            this.themes = themes;
            this.ideFrame = ideFrame;
            this.frame = frame;
        }

        private void scheduleNext(int delayMs) {
            timer = new Timer(delayMs, event -> {
                timer.stop();
                applyNextTheme();
            });
            timer.setRepeats(false);
            timer.start();
        }

        private void applyNextTheme() {
            if (index == themes.size()) {
                complete();
                return;
            }

            try {
                ThemeDescriptor theme = themes.get(index);
                UIThemeLookAndFeelInfo lookAndFeel = installedThemes.get(theme.name());
                if (lookAndFeel == null) {
                    throw new IllegalStateException("Theme is not installed in the sandbox IDE: " + theme.name());
                }

                LafManager manager = LafManager.getInstance();
                manager.setCurrentUIThemeLookAndFeel(lookAndFeel);
                manager.updateUI();
                manager.repaintUI();
                ideFrame.setFrameTitle(theme.name() + " — Bearded Theme Marketplace Demo");
                frame.validate();

                timer = new Timer(THEME_SETTLE_DELAY_MS, event -> {
                    timer.stop();
                    captureCurrentTheme(theme, lookAndFeel);
                });
                timer.setRepeats(false);
                timer.start();
            } catch (Exception exception) {
                fail(outputDirectory, exception);
            }
        }

        private void captureCurrentTheme(ThemeDescriptor theme, UIThemeLookAndFeelInfo expectedLookAndFeel) {
            try {
                UIThemeLookAndFeelInfo activeLookAndFeel = LafManager.getInstance().getCurrentUIThemeLookAndFeel();
                if (activeLookAndFeel == null || !activeLookAndFeel.getId().equals(expectedLookAndFeel.getId())) {
                    throw new IllegalStateException("IntelliJ did not activate " + theme.name()
                        + " before its screenshot was requested");
                }
                if (ideFrame.getBalloonLayout() != null) {
                    ideFrame.getBalloonLayout().closeAll();
                }
                int projectViewWidth = constrainProjectViewWidth(project);
                if (Math.abs(projectViewWidth - WIDTH / 4) > 8) {
                    throw new IllegalStateException("Expected the Project tool window to be 25% wide ("
                        + (WIDTH / 4) + "px), got " + projectViewWidth + "px");
                }
                ideFrame.getComponent().revalidate();
                Path screenshot = outputDirectory.resolve(theme.slug() + ".png");
                captureLiveComponent(ideFrame.getComponent(), screenshot);
                LOG.info("Captured live IntelliJ screenshot " + (index + 1) + "/" + themes.size()
                    + ": " + screenshot.getFileName());
                index++;
                scheduleNext(150);
            } catch (Exception exception) {
                fail(outputDirectory, exception);
            }
        }

        private void complete() {
            LOG.info("Completed live IntelliJ theme screenshot capture; starting the Marketplace demo recording");
            new DemoVideoSession(project, outputDirectory, themes, ideFrame, frame, this::writeCompletionMarker)
                .start();
        }

        private void writeCompletionMarker() {
            try {
                StringBuilder marker = new StringBuilder("Captured ")
                    .append(themes.size())
                    .append(" screenshots from the live IntelliJ IDE:\n");
                themes.forEach(theme -> marker.append(theme.slug()).append(" = ").append(theme.name()).append('\n'));
                marker.append("Captured the real Bearded Theme settings page as ")
                    .append(SETTINGS_SCREENSHOT)
                    .append(".\nCaptured ")
                    .append(VIDEO_FRAME_COUNT)
                    .append(" live IntelliJ frames for the 12-second Marketplace demo video.\n");
                marker.append("Project tool window width: ").append(WIDTH / 4).append("px (25%).\n");
                Files.writeString(outputDirectory.resolve("capture-complete.txt"), marker, StandardCharsets.UTF_8);
                LOG.info("Completed live IntelliJ Marketplace media capture");
            } catch (IOException exception) {
                fail(outputDirectory, exception);
                return;
            }
            exitApplication();
        }
    }

    private static final class DemoVideoSession {
        private static final String MOONSTONE = "Bearded Theme Islands Moonstone";
        private static final String LIGHT = "Bearded Theme Light";
        private static final String RUBY = "Bearded Theme Black & Ruby";
        private static final String SETTINGS_TEXT = "Enable Bearded file icons";

        private final Project project;
        private final Path outputDirectory;
        private final IdeFrame ideFrame;
        private final JFrame frame;
        private final Runnable completion;
        private final Map<String, UIThemeLookAndFeelInfo> installedThemes = installedThemesByName();
        private final Path framesDirectory;
        private int frameIndex;
        private Timer timer;
        private Window settingsWindow;
        private boolean settingsRequested;
        private boolean settingsScreenshotCaptured;

        private DemoVideoSession(
            Project project,
            Path outputDirectory,
            List<ThemeDescriptor> themes,
            IdeFrame ideFrame,
            JFrame frame,
            Runnable completion
        ) {
            this.project = project;
            this.outputDirectory = outputDirectory;
            this.ideFrame = ideFrame;
            this.frame = frame;
            this.completion = completion;
            this.framesDirectory = outputDirectory.resolve(VIDEO_FRAMES_DIRECTORY);

            Set<String> availableThemeNames = new LinkedHashSet<>();
            themes.forEach(theme -> availableThemeNames.add(theme.name()));
            if (!availableThemeNames.contains(MOONSTONE)) {
                LOG.info("The requested screenshot subset omitted Moonstone; it will still be used in the demo video");
            }
        }

        private void start() {
            try {
                Files.createDirectories(framesDirectory);
                applyTheme(MOONSTONE);
                timer = new Timer(VIDEO_FRAME_DELAY_MS, event -> captureNextFrame());
                timer.setInitialDelay(750);
                timer.start();
            } catch (Exception exception) {
                fail(outputDirectory, exception);
            }
        }

        private void captureNextFrame() {
            try {
                if (frameIndex == 30) {
                    applyTheme(LIGHT);
                } else if (frameIndex == 60) {
                    applyTheme(RUBY);
                }

                settingsWindow = findPluginSettingsWindow();
                JComponent captureSource = settingsWindow == null
                    ? ideFrame.getComponent()
                    : componentFor(settingsWindow);
                captureLiveComponent(captureSource, framesDirectory.resolve("frame-%04d.png".formatted(frameIndex)));

                if (settingsWindow != null && !settingsScreenshotCaptured) {
                    captureLiveComponent(captureSource, outputDirectory.resolve(SETTINGS_SCREENSHOT));
                    settingsScreenshotCaptured = true;
                    LOG.info("Captured the live Bearded Theme settings page");
                }

                frameIndex++;
                if (frameIndex == 81 && !settingsRequested) {
                    settingsRequested = true;
                    ApplicationManager.getApplication().invokeLater(this::showPluginSettings);
                }

                if (frameIndex == VIDEO_FRAME_COUNT) {
                    finish();
                }
            } catch (Exception exception) {
                if (timer != null) {
                    timer.stop();
                }
                closeSettingsWindow();
                fail(outputDirectory, exception);
            }
        }

        private void applyTheme(String themeName) {
            UIThemeLookAndFeelInfo lookAndFeel = installedThemes.get(themeName);
            if (lookAndFeel == null) {
                throw new IllegalStateException("Demo-video theme is not installed: " + themeName);
            }
            LafManager manager = LafManager.getInstance();
            manager.setCurrentUIThemeLookAndFeel(lookAndFeel);
            manager.updateUI();
            manager.repaintUI();
            ideFrame.setFrameTitle(themeName + " — Bearded Theme Marketplace Demo");
            frame.validate();
        }

        private void showPluginSettings() {
            try {
                ShowSettingsUtil.getInstance().showSettingsDialog(project, BeardedThemeConfigurable.class);
            } catch (Exception exception) {
                fail(outputDirectory, exception);
            }
        }

        private Window findPluginSettingsWindow() {
            if (settingsWindow != null && settingsWindow.isVisible()) {
                return settingsWindow;
            }
            for (Window candidate : Window.getWindows()) {
                if (candidate != frame && candidate.isVisible() && containsText(candidate, SETTINGS_TEXT)) {
                    candidate.setSize(WIDTH, HEIGHT);
                    candidate.setLocationRelativeTo(frame);
                    candidate.validate();
                    return candidate;
                }
            }
            return null;
        }

        private void finish() {
            timer.stop();
            if (!settingsScreenshotCaptured) {
                throw new IllegalStateException(
                    "The real Bearded Theme settings page did not appear during the demo recording"
                );
            }
            closeSettingsWindow();
            LOG.info("Captured " + VIDEO_FRAME_COUNT + " live IntelliJ demo-video frames");
            completion.run();
        }

        private void closeSettingsWindow() {
            if (settingsWindow != null) {
                settingsWindow.dispose();
                settingsWindow = null;
            }
        }

        private static JComponent componentFor(Window window) {
            if (window instanceof RootPaneContainer rootPaneContainer) {
                return rootPaneContainer.getRootPane();
            }
            throw new IllegalStateException("The IntelliJ settings window has no capturable root pane");
        }

        private static boolean containsText(Container container, String expectedText) {
            for (Component component : container.getComponents()) {
                if (component instanceof AbstractButton button && expectedText.equals(button.getText())) {
                    return true;
                }
                if (component instanceof JLabel label && expectedText.equals(label.getText())) {
                    return true;
                }
                if (component instanceof Container child && containsText(child, expectedText)) {
                    return true;
                }
            }
            return false;
        }
    }
}
