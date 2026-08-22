package dev.jetplugins.beardedtheme;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Validates all generated Bearded Theme files for structural correctness. */
@RunWith(Parameterized.class)
public class ThemeValidationTest {

    private static final Path THEMES_DIR = Paths.get("src/main/resources/themes");

    private final String slug;
    private final String name;
    private final boolean dark;

    public ThemeValidationTest(String slug, String name, boolean dark) {
        this.slug = slug;
        this.name = name;
        this.dark = dark;
    }

    @Parameterized.Parameters(name = "{1}")
    public static Collection<Object[]> themes() throws Exception {
        String json = Files.readString(THEMES_DIR.resolve("theme-list.json"), StandardCharsets.UTF_8);
        JsonArray array = JsonParser.parseString(json).getAsJsonArray();
        List<Object[]> params = new ArrayList<>();
        for (JsonElement element : array) {
            JsonObject theme = element.getAsJsonObject();
            params.add(new Object[]{
                theme.get("slug").getAsString(),
                theme.get("name").getAsString(),
                theme.get("dark").getAsBoolean()
            });
        }
        return params;
    }

    @Test
    public void themeJsonIsValid() throws Exception {
        Path themeFile = THEMES_DIR.resolve(slug + ".theme.json");
        assertThat(themeFile).exists();

        JsonObject theme = JsonParser.parseString(Files.readString(themeFile)).getAsJsonObject();
        assertThat(theme.has("name")).as("theme has 'name'").isTrue();
        assertThat(theme.has("dark")).as("theme has 'dark'").isTrue();
        assertThat(theme.has("author")).as("theme has 'author'").isTrue();
        assertThat(theme.has("editorScheme")).as("theme has 'editorScheme'").isTrue();
        assertThat(theme.get("parentTheme").getAsString())
            .as("theme inherits the matching IntelliJ Islands parent")
            .isEqualTo(dark ? "Islands Dark" : "Islands Light");
        assertThat(theme.has("ui")).as("theme has 'ui'").isTrue();
        assertThat(theme.has("icons")).as("theme has 'icons'").isTrue();
        assertThat(theme.get("dark").getAsBoolean()).isEqualTo(dark);
        assertThat(theme.get("name").getAsString()).isEqualTo(name);

        String schemePath = theme.get("editorScheme").getAsString();
        assertThat(schemePath).startsWith("/themes/");
        assertThat(THEMES_DIR.resolve(schemePath.replace("/themes/", ""))).exists();

        JsonObject ui = theme.getAsJsonObject("ui");
        assertThat(ui.keySet()).contains(
            "*", "Editor", "EditorTabs", "Tree", "List", "Button", "MainToolbar",
            "MainWindow", "ToolWindow", "StatusBar", "Popup", "Menu", "ProgressBar", "ScrollBar"
        );
        assertThat(theme.getAsJsonObject("icons").has("ColorPalette"))
            .as("icons have a color palette")
            .isTrue();
    }

    @Test
    public void editorSchemeXmlIsValid() throws Exception {
        Path schemeFile = THEMES_DIR.resolve(slug + ".xml");
        assertThat(schemeFile).exists();

        String xml = Files.readString(schemeFile, StandardCharsets.UTF_8);
        assertThat(xml).startsWith("<?xml");
        assertThat(xml).contains("<scheme name=\"" + escapeXmlAttr(name) + "\"");
        assertThat(xml).contains("<colors>", "<attributes>");
        assertThat(xml).contains(
            "CARET_COLOR", "CARET_ROW_COLOR", "SELECTION_BACKGROUND", "LINE_NUMBERS_COLOR",
            "GUTTER_BACKGROUND", "INDENT_GUIDE", "DEFAULT_KEYWORD", "DEFAULT_STRING",
            "DEFAULT_NUMBER", "DEFAULT_FUNCTION_CALL", "DEFAULT_CLASS_NAME",
            "DEFAULT_BLOCK_COMMENT", "DEFAULT_LOCAL_VARIABLE", "DEFAULT_PARAMETER"
        );
        assertThat(xml).contains(dark ? "parent_scheme=\"Darcula\"" : "parent_scheme=\"Default\"");
    }

    @Test
    public void colorContrastMeetsMinimum() throws Exception {
        JsonObject defaults = readUi().getAsJsonObject("*");
        double contrast = calculateContrastRatio(
            defaults.get("background").getAsString(),
            defaults.get("foreground").getAsString()
        );
        assertThat(contrast)
            .as("background/foreground contrast for " + name)
            .isGreaterThanOrEqualTo(3.0);
    }

    @Test
    public void islandsStylingIsValid() throws Exception {
        JsonObject ui = readUi();
        assertThat(ui.get("Islands").getAsInt()).isEqualTo(1);
        assertThat(ui.get("Island.arc").getAsInt()).isEqualTo(20);
        assertThat(ui.get("Island.arc.compact").getAsInt()).isEqualTo(16);
        assertThat(ui.get("Island.borderWidth").getAsInt()).isEqualTo(5);
        assertThat(ui.get("Island.borderWidth.compact").getAsInt()).isEqualTo(4);

        JsonObject editor = ui.getAsJsonObject("Editor");
        JsonObject tabs = ui.getAsJsonObject("EditorTabs");
        JsonObject mainWindow = ui.getAsJsonObject("MainWindow");
        JsonObject toolWindow = ui.getAsJsonObject("ToolWindow");

        assertThat(ui.get("Island.borderColor").getAsString())
            .isEqualTo(toolWindow.get("background").getAsString());
        assertThat(tabs.get("background").getAsString())
            .isEqualTo(editor.get("background").getAsString());
        assertThat(tabs.keySet()).contains(
            "underlinedBorderColor", "inactiveUnderlinedTabBorderColor", "inactiveUnderlinedTabBackground"
        );
        assertThat(ui.getAsJsonObject("MainToolbar").get("borderColor").getAsString())
            .isEqualTo("#00000000");
        assertThat(ui.getAsJsonObject("StatusBar").get("borderColor").getAsString())
            .isEqualTo("#00000000");
        assertThat(toolWindow.getAsJsonObject("Stripe").get("borderColor").getAsString())
            .isEqualTo("#00000000");

        assertThat(calculateContrastRatio(
            editor.get("background").getAsString(),
            mainWindow.get("background").getAsString()
        )).as("Islands frame contrast for " + name).isGreaterThanOrEqualTo(1.2);
    }

    @Test
    public void interactiveAccentContrastMeetsWcag() throws Exception {
        JsonObject defaultButton = readUi().getAsJsonObject("Button").getAsJsonObject("default");
        assertThat(calculateContrastRatio(
            defaultButton.get("startBackground").getAsString(),
            defaultButton.get("foreground").getAsString()
        )).as("default button accent contrast for " + name).isGreaterThanOrEqualTo(4.5);
    }

    private JsonObject readUi() throws Exception {
        return JsonParser.parseString(Files.readString(THEMES_DIR.resolve(slug + ".theme.json")))
            .getAsJsonObject()
            .getAsJsonObject("ui");
    }

    private static String escapeXmlAttr(String value) {
        return value
            .replace("&", "&amp;")
            .replace("\"", "&quot;")
            .replace("<", "&lt;")
            .replace(">", "&gt;");
    }

    private static double calculateContrastRatio(String hex1, String hex2) {
        double l1 = relativeLuminance(hex1);
        double l2 = relativeLuminance(hex2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    private static double relativeLuminance(String hex) {
        hex = hex.replace("#", "");
        double red = sRGBtoLinear(Integer.parseInt(hex.substring(0, 2), 16) / 255.0);
        double green = sRGBtoLinear(Integer.parseInt(hex.substring(2, 4), 16) / 255.0);
        double blue = sRGBtoLinear(Integer.parseInt(hex.substring(4, 6), 16) / 255.0);
        return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    }

    private static double sRGBtoLinear(double color) {
        return color <= 0.03928 ? color / 12.92 : Math.pow((color + 0.055) / 1.055, 2.4);
    }
}
