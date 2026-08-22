package dev.jetplugins.beardedtheme;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/** Removes paid-plugin metadata from the disposable screenshot sandbox only. */
public final class ScreenshotSandboxDescriptorPatcher {

    private static final Pattern PRODUCT_DESCRIPTOR = Pattern.compile(
        "\\s*<product-descriptor\\b[^>]*/>"
    );

    private ScreenshotSandboxDescriptorPatcher() {}

    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            throw new IllegalArgumentException("Expected the screenshot sandbox plugin lib directory");
        }

        Path pluginLibDirectory = Path.of(args[0]);
        List<Path> pluginJars;
        try (Stream<Path> files = Files.list(pluginLibDirectory)) {
            pluginJars = files.filter(path -> path.getFileName().toString().endsWith(".jar")).toList();
        }
        if (pluginJars.size() != 1) {
            throw new IllegalStateException(
                "Expected one screenshot-sandbox plugin JAR in " + pluginLibDirectory + ", found " + pluginJars
            );
        }

        Path pluginJar = pluginJars.getFirst();
        Path temporaryJar = Files.createTempFile(pluginLibDirectory, "screenshot-plugin-", ".jar");
        boolean descriptorPatched = false;

        try (ZipInputStream input = new ZipInputStream(Files.newInputStream(pluginJar));
             ZipOutputStream output = new ZipOutputStream(Files.newOutputStream(temporaryJar))) {
            ZipEntry entry;
            while ((entry = input.getNextEntry()) != null) {
                ZipEntry outputEntry = new ZipEntry(entry.getName());
                outputEntry.setTime(entry.getTime());
                output.putNextEntry(outputEntry);
                if (entry.getName().equals("META-INF/plugin.xml")) {
                    String descriptor = new String(input.readAllBytes(), StandardCharsets.UTF_8);
                    String patched = PRODUCT_DESCRIPTOR.matcher(descriptor).replaceFirst("");
                    if (patched.equals(descriptor)) {
                        throw new IllegalStateException("Screenshot sandbox descriptor has no product-descriptor");
                    }
                    output.write(patched.getBytes(StandardCharsets.UTF_8));
                    descriptorPatched = true;
                } else {
                    input.transferTo(output);
                }
                output.closeEntry();
                input.closeEntry();
            }
        }

        if (!descriptorPatched) {
            Files.deleteIfExists(temporaryJar);
            throw new IllegalStateException("META-INF/plugin.xml was not found in " + pluginJar);
        }
        Files.move(temporaryJar, pluginJar, StandardCopyOption.REPLACE_EXISTING);
    }
}
