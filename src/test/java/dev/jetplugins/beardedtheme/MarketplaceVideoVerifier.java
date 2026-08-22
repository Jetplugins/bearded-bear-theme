package dev.jetplugins.beardedtheme;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

/** Verifies the live IntelliJ frames and encoded Marketplace demo video. */
public final class MarketplaceVideoVerifier {

    private static final int WIDTH = 1200;
    private static final int HEIGHT = 760;
    private static final int EXPECTED_FRAMES = 120;

    private MarketplaceVideoVerifier() {}

    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            throw new IllegalArgumentException("Expected: <video-file> <frames-directory>");
        }

        Path video = Path.of(args[0]);
        Path framesDirectory = Path.of(args[1]);
        if (!Files.isRegularFile(video) || Files.size(video) < 300_000) {
            throw new AssertionError("Marketplace video is missing or suspiciously small: " + video);
        }

        List<Path> frames;
        try (Stream<Path> paths = Files.list(framesDirectory)) {
            frames = paths
                .filter(path -> path.getFileName().toString().matches("frame-\\d{4}\\.png"))
                .sorted()
                .toList();
        }
        if (frames.size() != EXPECTED_FRAMES) {
            throw new AssertionError("Expected " + EXPECTED_FRAMES + " live frames, got " + frames.size());
        }

        Set<String> hashes = new HashSet<>();
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        for (int index = 0; index < frames.size(); index++) {
            Path frame = frames.get(index);
            String expectedName = "frame-%04d.png".formatted(index);
            if (!frame.getFileName().toString().equals(expectedName)) {
                throw new AssertionError("Video-frame sequence is not contiguous at " + frame);
            }
            BufferedImage image = ImageIO.read(frame.toFile());
            if (image == null || image.getWidth() != WIDTH || image.getHeight() != HEIGHT) {
                throw new AssertionError("Invalid 1200x760 live frame: " + frame);
            }
            hashes.add(HexFormat.of().formatHex(digest.digest(Files.readAllBytes(frame))));
        }
        if (hashes.size() < 4) {
            throw new AssertionError("The demo video does not show enough live UI changes: only "
                + hashes.size() + " unique frames");
        }

        Process process = new ProcessBuilder(
            "ffprobe",
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height:format=duration",
            "-of", "default=noprint_wrappers=1",
            video.toAbsolutePath().toString()
        ).redirectErrorStream(true).start();
        String probeOutput = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        if (process.waitFor() != 0) {
            throw new AssertionError("ffprobe could not inspect the Marketplace video:\n" + probeOutput);
        }

        int width = integerValue(probeOutput, "width");
        int height = integerValue(probeOutput, "height");
        double duration = decimalValue(probeOutput, "duration");
        if (width != WIDTH || height != HEIGHT) {
            throw new AssertionError("Expected a 1200x760 video, got " + width + "x" + height);
        }
        if (duration < 10.0 || duration > 15.0) {
            throw new AssertionError("Expected a 10–15 second video, got " + duration + " seconds");
        }

        try (Stream<Path> media = Files.list(video.getParent())) {
            long videoCount = media.filter(path -> path.getFileName().toString().endsWith(".mp4")).count();
            if (videoCount != 1) {
                throw new AssertionError("Expected exactly one Marketplace MP4, got " + videoCount);
            }
        }

        System.out.println("Verified one " + duration + "-second 1200x760 Marketplace video encoded from "
            + EXPECTED_FRAMES + " live IntelliJ frames (" + hashes.size() + " visually unique).");
    }

    private static int integerValue(String output, String key) {
        return Integer.parseInt(value(output, key));
    }

    private static double decimalValue(String output, String key) {
        return Double.parseDouble(value(output, key));
    }

    private static String value(String output, String key) {
        String prefix = key + "=";
        return output.lines()
            .filter(line -> line.startsWith(prefix))
            .map(line -> line.substring(prefix.length()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("ffprobe did not report " + key + ":\n" + output));
    }
}
