# Bearded Theme for IntelliJ

A carefully crafted collection of **65 color themes** for JetBrains IDEs, ported from the popular [Bearded Theme](https://github.com/BeardedBear/bearded-theme) VS Code extension by BeardedBear, plus an IntelliJ-first Islands variant.

Includes the [Bearded Icons](https://github.com/BeardedBear/bearded-icons) file icon set with 112 SVG icons for files and folders.

See the [changelog](CHANGELOG.md) for release highlights and upgrade details.

## Theme families

| Family | Variants |
|--------|----------|
| **Classics** | Anthracite, Light |
| **Arc** | Arc, Eolstorm, Blueberry, Eggplant, Reversed |
| **Vivid** | Purple, Black, Light |
| **Monokai** | Terra, Metallian, Stone, Black, Reversed |
| **Solarized** | Dark, Reversed, Light |
| **Oceanic** | Oceanic, Reversed |
| **Milkshake** | Raspberry, Blueberry, Mango, Mint, Vanilla |
| **Black & Gems** | Gold, Ruby, Emerald, Diamond, Amethyst (+ Soft variants) |
| **Aquarelle** | Cymbidium, Hydrangea, Lilac |
| **High contrast** | Ebony, Midnight Void, Wonderland Wood, Brewing Storm, Flurry |
| **Stained** | Purple, Blue |
| **Surprising** | Eggplant, Blueberry, Watermelon |
| **Exotic** | Earth, Coffee, Coffee Reversed, Coffee Cream, Voided, Altica |
| **Featured** | Will, Gold D Raynh, Gold D Raynh Light, Melle Julie, Melle Julie Light, WebDevCody |
| **Islands** | Moonstone |
| **Special** | Colorblind, OLED, Minuit, Chocolate Espresso |

## Installation

### From JetBrains Marketplace

1. Open **Settings → Plugins → Marketplace**
2. Search for "Bearded Theme"
3. Click **Install** and restart the IDE

### From disk

1. Download the latest `.zip` from [Releases](../../releases)
2. Open **Settings → Plugins → ⚙️ → Install Plugin from Disk...**
3. Select the `.zip` file and restart the IDE

## Applying a theme

Go to **Settings → Appearance & Behavior → Appearance** and select any Bearded Theme variant from the **Theme** dropdown.

## What's included

- **Full Islands UI theming** — layered main-window and content surfaces, rounded islands, modern tabs, tool windows, menus, buttons, popups, scrollbars, status bar, welcome screen, and more
- **Complete editor color schemes** — syntax highlighting with language-specific rules for Java, Kotlin, Python, JavaScript/TypeScript, Go, Rust, PHP, HTML/CSS, JSON, YAML, Markdown, and more
- **Bearded Icons** — 79 file type icons and 33 folder icons covering common languages, frameworks, and config files
- **Icon color palette** — action and object icon colors adapted to each theme variant

## Building from source

```bash
npm test
npm run check:generated
./gradlew test buildPlugin verifyPluginStructure
```

The plugin `.zip` will be in `build/distributions/`.

### Regenerating themes

The theme files are generated from the palette registry and semantic/UI modules under `scripts/lib/`:

```bash
npm run generate
```

`npm run check:generated` verifies that theme files and the generated provider block in `plugin.xml` have not drifted.

### Running tests

```bash
./gradlew test
```

Tests validate theme JSON structure, editor scheme XML, Islands parents and surfaces, accessibility contrast, and icon SVG integrity.

### Creating Marketplace media

```bash
./gradlew createScreenshots
```

This launches a sandboxed IntelliJ IDEA with the plugin installed, opens the real sample project in
`marketplace-demo/`, applies every registered theme, and captures the live IDE window as a 1200×760
Marketplace-ready PNG in `build/marketplace-screenshots/`. The Project view is held to 25% of the
image width so the sample code remains the focus. The task also opens the real **Bearded Theme**
settings page for `plugin-settings.png`, records a 12-second theme-and-settings demonstration, and
encodes one MP4 at `build/marketplace-video/bearded-theme-demo.mp4`.

The task verifies the complete image set, exact dimensions, content complexity, visual uniqueness,
video frame sequence, duration, and video dimensions. `ffmpeg` and `ffprobe` must be available on the
local `PATH`. To capture only a comma-separated theme selection, use
`-PscreenshotThemes=anthracite-light,islands-moonstone`; the settings image and demo video are still
created so every run produces a complete Marketplace media set.

### Running the IDE with the plugin

```bash
./gradlew runIde
```

### Release automation

Every push to `main` builds the plugin and creates or refreshes a draft GitHub release for the
version declared in `build.gradle.kts`. The plugin ZIP is attached to the draft. Publishing that
draft as a stable GitHub release automatically runs the lightweight JetBrains Marketplace publish
workflow—without the Plugin Verifier—and publishes the tagged source with `./gradlew publishPlugin`.
Release notes are taken from the `[Unreleased]` section in `CHANGELOG.md`; the workflow stops if that
section is empty so a draft cannot silently ship without user-facing notes. When publishing a
release, move those entries under a dated version heading and add a fresh `[Unreleased]` section as
part of the next version bump.

Add a repository Actions secret named `PUBLISH_TOKEN` containing a JetBrains Marketplace token.
Before starting the next release cycle, update the version in `build.gradle.kts`; GitHub and the
Marketplace both require each published version to be unique.

## Subscription

The JetBrains Marketplace charges **$1/month** for access to its delivery channel, updates, and
support. Once you receive a copy, your right to use, study, modify, and redistribute it is governed
by GPLv3 and is not conditioned on an active subscription.

## Credits

- Original theme by [BeardedBear](https://github.com/BeardedBear)
- VS Code theme: [bearded-theme](https://github.com/BeardedBear/bearded-theme)
- VS Code icons: [bearded-icons](https://github.com/BeardedBear/bearded-icons)

## License

This plugin is free software licensed under the [GNU General Public License v3.0](LICENSE), including
the IntelliJ adaptations of [Bearded Theme](https://github.com/BeardedBear/bearded-theme) and
[Bearded Icons](https://github.com/BeardedBear/bearded-icons). See
[the third-party notices](THIRD_PARTY_NOTICES.md) for attribution and [the source-code notice](SOURCE_CODE.md)
for the version-matched source location included in every distribution.
