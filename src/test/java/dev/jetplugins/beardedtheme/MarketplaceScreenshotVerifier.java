package dev.jetplugins.beardedtheme;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/** Verifies the output produced by the live IntelliJ screenshot session. */
public final class MarketplaceScreenshotVerifier {

    private static final int WIDTH = 1200;
    private static final int HEIGHT = 760;
    private static final String SETTINGS_SCREENSHOT = "plugin-settings.png";

    private MarketplaceScreenshotVerifier() {}

    public static void main(String[] args) throws Exception {
        if (args.length != 3) {
            throw new IllegalArgumentException("Expected: <output-directory> <theme-registry> <theme-selection>");
        }

        Path outputDirectory = Path.of(args[0]);
        Path registryPath = Path.of(args[1]);
        String selection = args[2];
        Path errorMarker = outputDirectory.resolve("capture-error.txt");
        Path completeMarker = outputDirectory.resolve("capture-complete.txt");

        if (Files.exists(errorMarker)) {
            throw new AssertionError("The IntelliJ capture session failed: " + Files.readString(errorMarker));
        }
        if (!Files.exists(completeMarker)) {
            throw new AssertionError("IntelliJ exited without writing the live-capture completion marker");
        }

        List<ThemeDescriptor> themes;
        try (Reader reader = Files.newBufferedReader(registryPath, StandardCharsets.UTF_8)) {
            themes = new Gson().fromJson(reader, new TypeToken<ArrayList<ThemeDescriptor>>() {}.getType());
        }
        Set<String> requested = Arrays.stream(selection.split(","))
            .map(String::trim)
            .filter(value -> !value.isEmpty())
            .collect(Collectors.toCollection(LinkedHashSet::new));
        List<ThemeDescriptor> expectedThemes = requested.contains("all")
            ? themes
            : themes.stream().filter(theme -> requested.contains(theme.slug)).toList();
        if (expectedThemes.isEmpty()) {
            throw new AssertionError("No registered themes matched: " + selection);
        }

        Set<String> expectedFiles = expectedThemes.stream()
            .map(theme -> theme.slug + ".png")
            .collect(Collectors.toCollection(LinkedHashSet::new));
        expectedFiles.add(SETTINGS_SCREENSHOT);
        Set<String> actualFiles;
        try (Stream<Path> files = Files.list(outputDirectory)) {
            actualFiles = files
                .filter(path -> path.getFileName().toString().endsWith(".png"))
                .map(path -> path.getFileName().toString())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        }
        if (!actualFiles.equals(expectedFiles)) {
            throw new AssertionError("Screenshot set mismatch. Expected " + expectedFiles + ", got " + actualFiles);
        }

        Set<String> imageHashes = new HashSet<>();
        for (ThemeDescriptor theme : expectedThemes) {
            Path screenshot = outputDirectory.resolve(theme.slug + ".png");
            verifyImage(screenshot);

            String hash = HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(screenshot))
            );
            imageHashes.add(hash);
        }
        verifyImage(outputDirectory.resolve(SETTINGS_SCREENSHOT), 75);

        int minimumUniqueImages = (int) Math.ceil(expectedThemes.size() * 0.9);
        if (expectedThemes.size() >= 10 && imageHashes.size() < minimumUniqueImages) {
            throw new AssertionError("Only " + imageHashes.size() + " of " + expectedThemes.size()
                + " screenshots are visually unique; the IDE may not have finished switching themes");
        }

        String completion = Files.readString(completeMarker, StandardCharsets.UTF_8);
        if (!completion.startsWith("Captured " + expectedThemes.size() + " screenshots from the live IntelliJ IDE")) {
            throw new AssertionError("Unexpected completion marker: " + completion);
        }
        if (!completion.contains("Project tool window width: 300px (25%).")) {
            throw new AssertionError("The live capture did not verify the 25% Project view width");
        }

        System.out.println("Verified " + expectedThemes.size()
            + " theme screenshots and the real plugin settings page at 1200x760 ("
            + imageHashes.size() + " theme images visually unique).");
    }

    private static void verifyImage(Path screenshot) throws Exception {
        verifyImage(screenshot, 100);
    }

    private static void verifyImage(Path screenshot, int minimumSampledColors) throws Exception {
        if (Files.size(screenshot) < 30_000) {
            throw new AssertionError("Screenshot is suspiciously small: " + screenshot);
        }

        BufferedImage image = ImageIO.read(screenshot.toFile());
        if (image == null) {
            throw new AssertionError("Screenshot is not a decodable PNG: " + screenshot);
        }
        if (image.getWidth() != WIDTH || image.getHeight() != HEIGHT) {
            throw new AssertionError("Expected 1200x760, got " + image.getWidth() + "x" + image.getHeight()
                + " for " + screenshot);
        }

        Set<Integer> sampledColors = new HashSet<>();
        for (int y = 0; y < HEIGHT; y += 12) {
            for (int x = 0; x < WIDTH; x += 12) {
                sampledColors.add(image.getRGB(x, y));
            }
        }
        if (sampledColors.size() < minimumSampledColors) {
            throw new AssertionError("Screenshot appears blank or synthetic: " + screenshot
                + " (only " + sampledColors.size() + " sampled colors)");
        }
    }

    private static final class ThemeDescriptor {
        private String slug;
        private String name;
    }
}
