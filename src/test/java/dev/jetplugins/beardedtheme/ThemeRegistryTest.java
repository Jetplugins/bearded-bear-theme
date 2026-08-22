package dev.jetplugins.beardedtheme;

import com.google.gson.*;
import org.junit.Test;

import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;

/** Keeps generated theme files, the registry, and plugin.xml providers in sync. */
public class ThemeRegistryTest {

    private static final Path THEMES_DIR = Paths.get("src/main/resources/themes");
    private static final Path PLUGIN_XML = Paths.get("src/main/resources/META-INF/plugin.xml");
    private static final Pattern THEME_PROVIDER = Pattern.compile(
        "<themeProvider\\s+id=\"dev\\.jetplugins\\.beardedtheme\\.([^\"]+)\"\\s+" +
        "path=\"/themes/([^\"]+\\.theme\\.json)\"\\s*/>"
    );

    @Test
    public void generatedThemesAndPluginProvidersAreInSync() throws Exception {
        JsonArray themeList = JsonParser.parseString(
            new String(Files.readAllBytes(THEMES_DIR.resolve("theme-list.json")), StandardCharsets.UTF_8)
        ).getAsJsonArray();

        Set<String> listedSlugs = new LinkedHashSet<>();
        Map<String, String> expectedProviders = new LinkedHashMap<>();
        for (JsonElement element : themeList) {
            JsonObject theme = element.getAsJsonObject();
            String slug = theme.get("slug").getAsString();
            assertThat(listedSlugs.add(slug)).as("unique theme slug: " + slug).isTrue();
            expectedProviders.put(slug, theme.get("themeFile").getAsString());
        }

        Set<String> generatedSlugs = new LinkedHashSet<>();
        try (Stream<Path> paths = Files.list(THEMES_DIR)) {
            paths.map(path -> path.getFileName().toString())
                .filter(file -> file.endsWith(".theme.json"))
                .map(file -> file.substring(0, file.length() - ".theme.json".length()))
                .forEach(generatedSlugs::add);
        }
        assertThat(generatedSlugs).containsExactlyInAnyOrderElementsOf(listedSlugs);

        String pluginXml = new String(Files.readAllBytes(PLUGIN_XML), StandardCharsets.UTF_8);
        Matcher matcher = THEME_PROVIDER.matcher(pluginXml);
        Map<String, String> actualProviders = new LinkedHashMap<>();
        while (matcher.find()) {
            String previous = actualProviders.put(matcher.group(1), matcher.group(2));
            assertThat(previous).as("duplicate theme provider: " + matcher.group(1)).isNull();
        }

        assertThat(actualProviders).containsExactlyInAnyOrderEntriesOf(expectedProviders);
    }
}
