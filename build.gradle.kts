import org.jetbrains.changelog.Changelog
import org.jetbrains.intellij.platform.gradle.tasks.BuildPluginTask
import java.util.zip.ZipFile
import java.util.zip.ZipInputStream

plugins {
    id("java")
    id("org.jetbrains.intellij.platform") version "2.18.1"
    id("org.jetbrains.changelog") version "2.5.0"
}

group = "dev.jetplugins.beardedtheme"
version = "2026.1.2"

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
    testImplementation("com.google.code.gson:gson:2.14.0")
    testImplementation("org.assertj:assertj-core:3.27.7")

    intellijPlatform {
        intellijIdea("2025.3")
        javaCompiler()
        pluginVerifier()
        zipSigner()
    }
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

val marketplaceScreenshotsDirectory = layout.buildDirectory.dir("marketplace-screenshots")
val marketplaceVideoDirectory = layout.buildDirectory.dir("marketplace-video")
val marketplaceVideoFramesDirectory = marketplaceScreenshotsDirectory.map { it.dir("_video-frames") }
val marketplaceVideoFile = marketplaceVideoDirectory.map { it.file("bearded-theme-demo.mp4") }
val marketplaceDemoDirectory = layout.projectDirectory.dir("marketplace-demo")
val marketplaceSampleFile = marketplaceDemoDirectory.file("src/main/java/demo/store/OrderService.java")
val screenshotThemes = providers.gradleProperty("screenshotThemes").orElse("all")
val marketplaceCaptureSandbox = layout.projectDirectory.dir(
    ".intellijPlatform/sandbox/${rootProject.name}/IU-2025.3",
)
val cleanMarketplaceScreenshots = tasks.register<Delete>("cleanMarketplaceScreenshots") {
    delete(marketplaceScreenshotsDirectory, marketplaceVideoDirectory)
}
val cleanMarketplaceScreenshotIdeState = tasks.register<Delete>("cleanMarketplaceScreenshotIdeState") {
    delete(
        marketplaceCaptureSandbox.dir("config_captureMarketplaceScreenshots"),
        marketplaceCaptureSandbox.dir("system_captureMarketplaceScreenshots"),
        marketplaceCaptureSandbox.dir("log_captureMarketplaceScreenshots"),
        marketplaceDemoDirectory.dir(".idea"),
    )
}

intellijPlatform {
    buildSearchableOptions = false

    pluginConfiguration {
        version = project.version.toString()

        val changelog = project.changelog
        changeNotes = version.map { pluginVersion ->
            with(changelog) {
                renderItem(
                    (getOrNull(pluginVersion) ?: getUnreleased())
                        .withHeader(false)
                        .withEmptySections(false),
                    Changelog.OutputType.HTML,
                )
            }
        }

        ideaVersion {
            sinceBuild = "253"
            untilBuild = provider { null }
        }
    }

    signing {
        certificateChain = providers.environmentVariable("CERTIFICATE_CHAIN")
        privateKey = providers.environmentVariable("PRIVATE_KEY")
        password = providers.environmentVariable("PRIVATE_KEY_PASSWORD")
    }

    publishing {
        token = providers.environmentVariable("PUBLISH_TOKEN")
    }

    pluginVerification {
        ides {
            providers.gradleProperty("verifierIdeVersions")
                .orElse("2025.3,2026.1,2026.2")
                .get()
                .split(',')
                .map(String::trim)
                .filter(String::isNotEmpty)
                .forEach { create("IU", it) }
        }
    }
}

changelog {
    groups.empty()
    repositoryUrl = "https://github.com/Jetplugins/bearded-bear-theme"
    versionPrefix = ""
}

intellijPlatformTesting {
    runIde {
        register("captureMarketplaceScreenshots") {
            task {
                group = "documentation"
                description = "Launches IntelliJ and captures every selected theme from the live IDE UI."
                dependsOn(cleanMarketplaceScreenshots)
                args(marketplaceDemoDirectory.asFile.absolutePath)
                systemProperty(
                    "beardedTheme.screenshotOutputDirectory",
                    marketplaceScreenshotsDirectory.get().asFile.absolutePath,
                )
                systemProperty(
                    "beardedTheme.screenshotSampleFile",
                    marketplaceSampleFile.asFile.absolutePath,
                )
                systemProperty("beardedTheme.screenshotThemes", screenshotThemes.get())
                jvmArgs(
                    "-Didea.trust.all.projects=true",
                    "-Dide.show.tips.on.startup.default.value=false",
                    "-Djb.consents.confirmation.enabled=false",
                    "-Djb.privacy.policy.text=<!--999.999-->",
                    "-Dide.mac.message.dialogs.as.sheets=false",
                    "-Dapple.laf.useScreenMenuBar=false",
                    "-DjbScreenMenuBar.enabled=false",
                )
                inputs.dir(marketplaceDemoDirectory)
                inputs.file(layout.projectDirectory.file("src/main/resources/themes/theme-list.json"))
                outputs.dir(marketplaceScreenshotsDirectory)
                outputs.upToDateWhen { false }
            }
        }
    }
}

tasks.named("prepareSandbox_captureMarketplaceScreenshots") {
    dependsOn(cleanMarketplaceScreenshotIdeState)
}

val stripMarketplaceScreenshotLicense = tasks.register<JavaExec>("stripMarketplaceScreenshotLicense") {
    description = "Removes paid-license metadata from the disposable screenshot sandbox only."
    dependsOn("prepareSandbox_captureMarketplaceScreenshots", tasks.testClasses)
    classpath = sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.jetplugins.beardedtheme.ScreenshotSandboxDescriptorPatcher")
    args(
        marketplaceCaptureSandbox
            .dir("plugins_captureMarketplaceScreenshots/${rootProject.name}/lib")
            .asFile
            .absolutePath,
    )
    outputs.upToDateWhen { false }
}

tasks.named("captureMarketplaceScreenshots") {
    dependsOn(stripMarketplaceScreenshotLicense)
}

val verifyMarketplaceScreenshots = tasks.register<JavaExec>("verifyMarketplaceScreenshots") {
    group = "documentation"
    description = "Verifies every screenshot created by the live IntelliJ capture session."
    dependsOn("captureMarketplaceScreenshots", tasks.testClasses)
    classpath = sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.jetplugins.beardedtheme.MarketplaceScreenshotVerifier")
    args(
        marketplaceScreenshotsDirectory.get().asFile.absolutePath,
        layout.projectDirectory.file("src/main/resources/themes/theme-list.json").asFile.absolutePath,
        screenshotThemes.get(),
    )
    outputs.upToDateWhen { false }
}

val prepareMarketplaceVideoDirectory = tasks.register<Exec>("prepareMarketplaceVideoDirectory") {
    description = "Creates the clean output directory after the live IntelliJ capture completes."
    dependsOn("captureMarketplaceScreenshots")
    commandLine("mkdir", "-p", marketplaceVideoDirectory.get().asFile.absolutePath)
    outputs.dir(marketplaceVideoDirectory)
    outputs.upToDateWhen { false }
}

val encodeMarketplaceVideo = tasks.register<Exec>("encodeMarketplaceVideo") {
    group = "documentation"
    description = "Encodes a 12-second Marketplace demo from frames captured from the live IntelliJ UI."
    dependsOn(prepareMarketplaceVideoDirectory)
    inputs.dir(marketplaceVideoFramesDirectory)
    outputs.file(marketplaceVideoFile)
    outputs.upToDateWhen { false }
    commandLine(
        "ffmpeg",
        "-hide_banner",
        "-loglevel", "warning",
        "-y",
        "-framerate", "10",
        "-i", marketplaceVideoFramesDirectory.get().file("frame-%04d.png").asFile.absolutePath,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        marketplaceVideoFile.get().asFile.absolutePath,
    )
}

val verifyMarketplaceVideo = tasks.register<JavaExec>("verifyMarketplaceVideo") {
    group = "documentation"
    description = "Verifies the dimensions, duration, frame sequence, and UI changes in the Marketplace video."
    dependsOn(encodeMarketplaceVideo, tasks.testClasses)
    classpath = sourceSets.test.get().runtimeClasspath
    mainClass.set("dev.jetplugins.beardedtheme.MarketplaceVideoVerifier")
    args(
        marketplaceVideoFile.get().asFile.absolutePath,
        marketplaceVideoFramesDirectory.get().asFile.absolutePath,
    )
    outputs.upToDateWhen { false }
}

tasks {
    processResources {
        val pluginVersion = project.version.toString()
        inputs.property("licenseNoticePluginVersion", pluginVersion)
        from(rootProject.files("LICENSE", "THIRD_PARTY_NOTICES.md")) {
            into("META-INF")
        }
        from(rootProject.file("SOURCE_CODE.md")) {
            into("META-INF")
            expand("pluginVersion" to pluginVersion)
        }
    }

    withType<JavaCompile>().configureEach {
        options.release = 21
        options.compilerArgs.add("-Xlint:deprecation")
    }

    register("createScreenshots") {
        group = "documentation"
        description = "Captures and verifies 1200x760 Marketplace screenshots and a 12-second video from a live IntelliJ IDE."
        dependsOn(verifyMarketplaceScreenshots, verifyMarketplaceVideo)
    }

    register("createMarketplaceVideo") {
        group = "documentation"
        description = "Captures, encodes, and verifies the 12-second live IntelliJ Marketplace demo video."
        dependsOn(verifyMarketplaceVideo)
    }

    named<BuildPluginTask>("buildPlugin") {
        val finalArchive = archiveFile
        doLast {
            val distribution = finalArchive.get().asFile
            check(distribution.isFile) { "Plugin distribution was not created: $distribution" }

            val requiredResources = mapOf(
                "META-INF/LICENSE" to listOf("GNU GENERAL PUBLIC LICENSE", "Version 3"),
                "META-INF/THIRD_PARTY_NOTICES.md" to listOf(
                    "BeardedBear/bearded-theme",
                    "BeardedBear/bearded-icons",
                    "GNU General Public License version 3",
                ),
                "META-INF/SOURCE_CODE.md" to listOf(
                    "https://github.com/Jetplugins/bearded-bear-theme/tree/2026.1.2",
                ),
            )
            val foundResources = mutableMapOf<String, String>()

            ZipFile(distribution).use { outerZip ->
                val pluginJars = outerZip.entries().asSequence()
                    .filter { !it.isDirectory && it.name.contains("/lib/") && it.name.endsWith(".jar") }
                    .toList()
                check(pluginJars.isNotEmpty()) { "No plugin JAR found in $distribution" }

                pluginJars.forEach { pluginJar ->
                    ZipInputStream(outerZip.getInputStream(pluginJar)).use { nestedZip ->
                        while (true) {
                            val entry = nestedZip.nextEntry ?: break
                            if (!entry.isDirectory && entry.name in requiredResources) {
                                foundResources[entry.name] = nestedZip.readBytes().toString(Charsets.UTF_8)
                            }
                        }
                    }
                }
            }

            val errors = requiredResources.flatMap { (path, requiredText) ->
                val contents = foundResources[path]
                when {
                    contents == null -> listOf("missing $path")
                    else -> requiredText.filterNot(contents::contains).map { "missing '$it' from $path" }
                }
            }
            check(errors.isEmpty()) {
                "Plugin distribution licensing verification failed:\n" +
                    errors.joinToString("\n") { "  - $it" }
            }
            logger.lifecycle("Verified GPL terms, upstream notices, and version-matched source directions in ${distribution.name}")
        }
    }
}
