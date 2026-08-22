"use strict";

const { lighten } = require("./colors");
const { makeMainColorsDark, makeMainColorsLight } = require("./semantic-tokens");

const classicsColors = {
  blue: "#3398DB",
  green: "#29ae57",
  greenAlt: "#b7d175",
  orange: "#d78012",
  pink: "#d471a9",
  purple: "#8e6daf",
  red: "#c1503d",
  salmon: "#e06e6e",
  turquoize: "#1abc9c",
  yellow: "#d4b074",
};
const classicsLevels = { danger: classicsColors.red, info: classicsColors.blue, success: classicsColors.green, warning: classicsColors.orange };

const arcColors = {
  blue: "#69C3FF", green: "#3CEC85", greenAlt: "#A4EF58", orange: "#FF955C",
  pink: "#F38CEC", purple: "#B78AFF", red: "#E35535", salmon: "#FF738A",
  turquoize: "#22ECDB", yellow: "#EACD61",
};
const arcLevels = { danger: arcColors.red, info: arcColors.blue, success: arcColors.green, warning: arcColors.orange };

const vividColors = {
  blue: "#28A9FF", green: "#42DD76", greenAlt: "#b7d175", orange: "#FF7135",
  pink: "#E66DFF", purple: "#A95EFF", red: "#D62C2C", salmon: "#FF478D",
  turquoize: "#14E5D4", yellow: "#FFB638",
};
const vividLevels = { danger: vividColors.red, info: vividColors.blue, success: vividColors.green, warning: vividColors.yellow };

const vividLightColors = {
  blue: "#0099ff", green: "#00ac39", greenAlt: "#6f9b00", orange: "#df6800",
  pink: "#E66DFF", purple: "#9c45ff", red: "#D62C2C", salmon: "#ff0062",
  turquoize: "#00b8a9", yellow: "#d48700",
};

const monokaiColors = {
  blue: "#78dce8", green: "#a9dc76", greenAlt: "#b7d175", orange: "#fc9867",
  pink: "#e991e3", purple: "#ab9df2", red: "#fc6a67", salmon: "#ff6188",
  turquoize: "#78e8c6", yellow: "#ffd866",
};
const monokaiLevels = { danger: monokaiColors.red, info: monokaiColors.blue, success: monokaiColors.green, warning: monokaiColors.yellow };

const solarizedColors = {
  blue: "#268bd2", green: "#859900", greenAlt: "#b7d175", orange: "#cb4b16",
  pink: "#d33682", purple: "#6c71c4", red: "#dc322f", salmon: "#e66a6a",
  turquoize: "#2aa198", yellow: "#b58900",
};
const solarizedLevels = { danger: solarizedColors.red, info: solarizedColors.blue, success: solarizedColors.green, warning: solarizedColors.orange };

const solarizedLightColors = {
  blue: "#268bd2", green: "#739d00", greenAlt: "#6a8f07", orange: "#cb4b16",
  pink: "#d33682", purple: "#6c71c4", red: "#dc322f", salmon: "#e66a6a",
  turquoize: "#2aa198", yellow: "#b58900",
};

const oceanicColors = {
  blue: "#6699cc", green: "#99c794", greenAlt: "#b7d175", orange: "#f99157",
  pink: "#d471a9", purple: "#c594c5", red: "#ec5f67", salmon: "#e06e6e",
  turquoize: "#5fb3b3", yellow: "#fac863",
};
const oceanicLevels = { danger: oceanicColors.red, info: oceanicColors.blue, success: oceanicColors.green, warning: oceanicColors.orange };

const milkshakeColors = {
  blue: "#0076c5", green: "#008b17", greenAlt: "#668b07", orange: "#b96000",
  pink: "#c121a4", purple: "#7522d3", red: "#d12525", salmon: "#da2a5f",
  turquoize: "#008f8f", yellow: "#c08403",
};
const milkshakeLevels = { danger: milkshakeColors.red, info: milkshakeColors.blue, success: milkshakeColors.green, warning: milkshakeColors.yellow };

const blackColors = {
  blue: "#69C3FF", green: "#3CEC85", greenAlt: "#A4EF58", orange: "#FF955C",
  pink: "#F38CEC", purple: "#B78AFF", red: "#E35535", salmon: "#FF738A",
  turquoize: "#22ECDB", yellow: "#EACD61",
};
const blackLevels = { danger: blackColors.red, info: blackColors.blue, success: blackColors.green, warning: blackColors.orange };

const aquarelleColors = {
  blue: "#afd9ec", green: "#b7dda2", greenAlt: "#cfddaa", orange: "#dfc6a2",
  pink: "#eba3c0", purple: "#c4b7e6", red: "#d8877a", salmon: "#e8a19e",
  turquoize: "#a2dbd0", yellow: "#f3e1ac",
};
const aquarelleLevels = { danger: aquarelleColors.red, info: aquarelleColors.blue, success: aquarelleColors.green, warning: aquarelleColors.orange };

const hcColors = {
  blue: "#7fd7f5", green: "#AFEA7B", greenAlt: "#c1e97b", orange: "#ffaa7d",
  pink: "#f5a1e3", purple: "#bc98ff", red: "#fd604f", salmon: "#FF738A",
  turquoize: "#0cf5d9", yellow: "#f3e589",
};
const hcLevels = { danger: hcColors.red, info: hcColors.blue, success: hcColors.green, warning: hcColors.orange };

const stainedColors = {
  blue: "#4FA2FF", green: "#42DD76", greenAlt: "#A4EF58", orange: "#FF955C",
  pink: "#F38CEC", purple: "#B78AFF", red: "#E35535", salmon: "#FF738A",
  turquoize: "#22ECDB", yellow: "#EACD61",
};
const stainedLevels = { danger: stainedColors.red, info: stainedColors.blue, success: stainedColors.green, warning: stainedColors.orange };

const surprisingBaseColors = {
  blue: "#00B3BD", green: "#a9dc76", greenAlt: "#A4EF58", orange: "#FF955C",
  pink: "#F38CEC", purple: "#B78AFF", red: "#C13838", salmon: "#FF738A",
};
const surprisingLevels = { danger: "#E35535", info: "#00B3BD", success: "#a9dc76", warning: "#d1a456" };

const colorblindColors = {
  blue: "#4F8FE6", green: "#78CC78", greenAlt: "#b7d175", orange: "#E69A4F",
  pink: "#CC78B7", purple: "#9A78CC", red: "#E64F4F", salmon: "#E6787A",
  turquoize: "#4FC7C7", yellow: "#D1CC6E",
};
const colorblindLevels = { danger: colorblindColors.red, info: colorblindColors.blue, success: colorblindColors.green, warning: colorblindColors.orange };

const oledColors = {
  blue: "#69C3FF", green: "#3CEC85", greenAlt: "#A4EF58", orange: "#FF955C",
  pink: "#F38CEC", purple: "#B78AFF", red: "#E35535", salmon: "#FF738A",
  turquoize: "#22ECDB", yellow: "#EACD61",
};
const oledLevels = { danger: oledColors.red, info: oledColors.blue, success: oledColors.green, warning: oledColors.orange };

// Exotic theme colors
const earthColors = {
  blue: "#8ab0ed", green: "#85bd6f", greenAlt: "#b7d175", orange: "#d7a455",
  pink: "#d887be", purple: "#a284d1", red: "#c96363", salmon: "#e07472",
  turquoize: "#5fb6a7", yellow: "#d1c67f",
};
const earthLevels = { danger: earthColors.red, info: earthColors.blue, success: earthColors.green, warning: earthColors.orange };

const coffeeColors = {
  blue: "#8ab0ed", green: "#92ca76", greenAlt: "#b7d175", orange: "#e39a5c",
  pink: "#d887be", purple: "#a284d1", red: "#d0645a", salmon: "#e07472",
  turquoize: "#5fb6a7", yellow: "#d1c67f",
};
const coffeeLevels = { danger: coffeeColors.red, info: coffeeColors.blue, success: coffeeColors.green, warning: coffeeColors.orange };

const coffeeLightColors = {
  blue: "#2a6ec5", green: "#2d8a23", greenAlt: "#6a8f07", orange: "#c27225",
  pink: "#b44594", purple: "#7d45b5", red: "#c4473c", salmon: "#d0534a",
  turquoize: "#138a7e", yellow: "#b59b3e",
};

const voidedColors = {
  blue: "#8DC5FF", green: "#80E8A7", greenAlt: "#C3E878", orange: "#FFB07F",
  pink: "#F5A3EB", purple: "#BEAAFF", red: "#FF8A80", salmon: "#FF93A8",
  turquoize: "#6DEBDB", yellow: "#FFE08A",
};
const voidedLevels = { danger: voidedColors.red, info: voidedColors.blue, success: voidedColors.green, warning: voidedColors.orange };

const alticaColors = {
  blue: "#82C9FC", green: "#76D6A3", greenAlt: "#B7E58E", orange: "#F5B679",
  pink: "#ECA0E0", purple: "#B8A0F5", red: "#F5847C", salmon: "#F58F9E",
  turquoize: "#60E0D3", yellow: "#F5D97C",
};
const alticaLevels = { danger: alticaColors.red, info: alticaColors.blue, success: alticaColors.green, warning: alticaColors.orange };

// Feat colors
const willColors = {
  blue: "#8ad0ff", green: "#68d89c", greenAlt: "#A4EF58", orange: "#FF955C",
  pink: "#f397e2", purple: "#bea3f5", red: "#E35535", salmon: "#ff7daa",
  turquoize: "#44f8e9", yellow: "#f0d37c",
};
const willLevels = { danger: willColors.red, info: willColors.blue, success: willColors.green, warning: willColors.orange };

const goldDColors = {
  blue: "#7ec4e6", green: "#8fd49e", greenAlt: "#b7d175", orange: "#e39000",
  pink: "#d887be", purple: "#a284d1", red: "#d95050", salmon: "#e07472",
  turquoize: "#5fb6a7", yellow: "#e6c86b",
};
const goldDLevels = { danger: goldDColors.red, info: goldDColors.blue, success: goldDColors.green, warning: goldDColors.orange };

const goldLightColors = {
  blue: "#2397e5", green: "#2d8a23", greenAlt: "#6a8f07", orange: "#c27225",
  pink: "#b44594", purple: "#7d45b5", red: "#c4473c", salmon: "#d0534a",
  turquoize: "#138a7e", yellow: "#b59b3e",
};

const melleJulieColors = {
  blue: "#7ec4e6", green: "#8fd49e", greenAlt: "#b7d175", orange: "#e0a25c",
  pink: "#d887be", purple: "#a284d1", red: "#d95050", salmon: "#e07472",
  turquoize: "#63edef", yellow: "#e6c86b",
};
const melleJulieLevels = { danger: melleJulieColors.red, info: melleJulieColors.blue, success: melleJulieColors.green, warning: melleJulieColors.orange };

const melleJulieLightColors = {
  blue: "#218d8f", green: "#2d8a23", greenAlt: "#6a8f07", orange: "#c27225",
  pink: "#b44594", purple: "#7d45b5", red: "#c4473c", salmon: "#d0534a",
  turquoize: "#138a7e", yellow: "#b59b3e",
};

const webDevCodyColors = {
  blue: "#7fc4e8", green: "#8fd49e", greenAlt: "#b7d175", orange: "#e0a25c",
  pink: "#f75f94", purple: "#a284d1", red: "#d95050", salmon: "#e07472",
  turquoize: "#63edef", yellow: "#e6c86b",
};
const webDevCodyLevels = { danger: webDevCodyColors.red, info: webDevCodyColors.blue, success: webDevCodyColors.green, warning: webDevCodyColors.orange };

// Islands Moonstone uses a restrained slate base with cool, legible accents.
// It is an original IntelliJ-first variant rather than a port of a VS Code
// theme, and is designed to make the Islands frame/content separation clear.
const moonstoneColors = {
  blue: "#82B8FF", green: "#86D6A4", greenAlt: "#B7D779", orange: "#F2A875",
  pink: "#E59BC9", purple: "#B5A0FF", red: "#F07D80", salmon: "#FF8F9C",
  turquoize: "#63D9D1", yellow: "#E8CD7A",
};
const moonstoneLevels = {
  danger: moonstoneColors.red,
  info: moonstoneColors.blue,
  success: moonstoneColors.green,
  warning: moonstoneColors.orange,
};

// ---------------------------------------------------------------------------
// Theme registry (slug -> name, theme, isLight, isHC)
// ---------------------------------------------------------------------------

const themeRegistry = [
  // Classics
  { slug: "anthracite", name: "Bearded Theme Anthracite", colors: classicsColors, levels: classicsLevels, ui: makeMainColorsDark({ base: "#181a1f", primary: "#a2abb6" }), light: false },
  { slug: "anthracite-light", name: "Bearded Theme Light", colors: {
    blue: "#2a7ec5", green: "#229a54", greenAlt: "#6a8f07", orange: "#c27225",
    pink: "#b44594", purple: "#7d45b5", red: "#b8473e", salmon: "#d0534a",
    turquoize: "#22a5c9", yellow: "#b59b3e",
  }, levels: classicsLevels, ui: makeMainColorsLight({ base: "#f3f4f5", primary: "#22a5c9" }), light: true },

  // Arc
  { slug: "arc", name: "Bearded Theme Arc", colors: arcColors, levels: arcLevels, ui: makeMainColorsDark({ base: "#1c2433", primary: "#8196b5" }), light: false },
  { slug: "arc-eolstorm", name: "Bearded Theme Arc Eolstorm", colors: arcColors, levels: arcLevels, ui: makeMainColorsDark({ base: "#222A38", primary: "#9DACC3" }), light: false },
  { slug: "arc-blueberry", name: "Bearded Theme Arc Blueberry", colors: arcColors, levels: arcLevels, ui: makeMainColorsDark({ base: "#111422", primary: "#8eb0e6" }), light: false },
  { slug: "arc-eggplant", name: "Bearded Theme Arc Eggplant", colors: arcColors, levels: arcLevels, ui: makeMainColorsDark({ base: "#181421", primary: "#9698d8" }), light: false },
  { slug: "arc-reversed", name: "Bearded Theme Arc Reversed", colors: arcColors, levels: arcLevels, ui: makeMainColorsDark({ base: "#161c28", primary: "#8196b5", reversed: true }), light: false },

  // Vivid
  { slug: "vivid-purple", name: "Bearded Theme Vivid Purple", colors: vividColors, levels: vividLevels, ui: makeMainColorsDark({ base: "#171131", primary: "#A680FF" }), light: false },
  { slug: "vivid-black", name: "Bearded Theme Vivid Black", colors: vividColors, levels: vividLevels, ui: makeMainColorsDark({ base: "#141417", primary: "#AAAAAA" }), light: false },
  { slug: "vivid-light", name: "Bearded Theme Vivid Light", colors: vividLightColors, levels: vividLevels, ui: makeMainColorsLight({ base: "#f4f4f4", primary: "#7e7e7e" }), light: true },

  // Monokai
  { slug: "monokai-terra", name: "Bearded Theme Monokai Terra", colors: monokaiColors, levels: monokaiLevels, ui: makeMainColorsDark({ base: "#262329", primary: "#b0a2a6" }), light: false },
  { slug: "monokai-metallian", name: "Bearded Theme Monokai Metallian", colors: monokaiColors, levels: monokaiLevels, ui: makeMainColorsDark({ base: "#1e212b", primary: "#98a2b5" }), light: false },
  { slug: "monokai-stone", name: "Bearded Theme Monokai Stone", colors: monokaiColors, levels: monokaiLevels, ui: makeMainColorsDark({ base: "#2A2D33", primary: "#9AA2A6" }), light: false },
  { slug: "monokai-black", name: "Bearded Theme Monokai Black", colors: monokaiColors, levels: monokaiLevels, ui: makeMainColorsDark({ base: "#141414", primary: "#8f8f8f" }), light: false },
  { slug: "monokai-reversed", name: "Bearded Theme Monokai Reversed", colors: monokaiColors, levels: monokaiLevels, ui: makeMainColorsDark({ base: "#171921", primary: "#98a2b5", reversed: true }), light: false },

  // Solarized
  { slug: "solarized-dark", name: "Bearded Theme Solarized Dark", colors: solarizedColors, levels: solarizedLevels, ui: makeMainColorsDark({ base: "#002b36", primary: "#839496" }), light: false },
  { slug: "solarized-reversed", name: "Bearded Theme Solarized Reversed", colors: solarizedColors, levels: solarizedLevels, ui: makeMainColorsDark({ base: "#00222b", primary: "#839496", reversed: true }), light: false },
  { slug: "solarized-light", name: "Bearded Theme Solarized Light", colors: solarizedLightColors, levels: solarizedLevels, ui: makeMainColorsLight({ base: "#fdf6e3", primary: "#839496" }), light: true },

  // Oceanic
  { slug: "oceanic", name: "Bearded Theme Oceanic", colors: oceanicColors, levels: oceanicLevels, ui: makeMainColorsDark({ base: "#1a2b34", primary: "#8fa2a7" }), light: false },
  { slug: "oceanic-reversed", name: "Bearded Theme Oceanic Reversed", colors: oceanicColors, levels: oceanicLevels, ui: makeMainColorsDark({ base: "#152229", primary: "#8fa2a7", reversed: true }), light: false },

  // Milkshake
  { slug: "milkshake-raspberry", name: "Bearded Theme Milkshake Raspberry", colors: milkshakeColors, levels: milkshakeLevels, ui: makeMainColorsLight({ base: "#f1e8eb", primary: "#d1174f", primaryAlt: "#f6eff1" }), light: true },
  { slug: "milkshake-blueberry", name: "Bearded Theme Milkshake Blueberry", colors: milkshakeColors, levels: milkshakeLevels, ui: makeMainColorsLight({ base: "#dad9eb", primary: "#422eb0" }), light: true },
  { slug: "milkshake-mango", name: "Bearded Theme Milkshake Mango", colors: milkshakeColors, levels: milkshakeLevels, ui: makeMainColorsLight({ base: "#f3eae3", primary: "#bd4f27" }), light: true },
  { slug: "milkshake-mint", name: "Bearded Theme Milkshake Mint", colors: milkshakeColors, levels: milkshakeLevels, ui: makeMainColorsLight({ base: "#edf3ee", primary: "#2a9b7d" }), light: true },
  { slug: "milkshake-vanilla", name: "Bearded Theme Milkshake Vanilla", colors: milkshakeColors, levels: milkshakeLevels, ui: makeMainColorsLight({ base: "#ece7da", primary: "#937416" }), light: true },

  // Black & Gems
  { slug: "black-gold", name: "Bearded Theme Black & Gold", colors: blackColors, levels: blackLevels, ui: makeMainColorsDark({ base: "#111418", primary: "#EACD61" }), light: false },
  { slug: "black-gold-soft", name: "Bearded Theme Black & Gold Soft", colors: blackColors, levels: blackLevels, ui: makeMainColorsDark({ base: "#15151a", primary: "#EACD61" }), light: false },
  { slug: "black-ruby", name: "Bearded Theme Black & Ruby", colors: blackColors, levels: blackLevels, ui: makeMainColorsDark({ base: "#111418", primary: "#FF738A" }), light: false },
  { slug: "black-ruby-soft", name: "Bearded Theme Black & Ruby Soft", colors: blackColors, levels: blackLevels, ui: makeMainColorsDark({ base: "#171518", primary: "#FF738A" }), light: false },
  { slug: "black-emerald", name: "Bearded Theme Black & Emerald", colors: blackColors, levels: blackLevels, ui: makeMainColorsDark({ base: "#111418", primary: "#22ECDB" }), light: false },
  { slug: "black-emerald-soft", name: "Bearded Theme Black & Emerald Soft", colors: blackColors, levels: blackLevels, ui: makeMainColorsDark({ base: "#131518", primary: "#22ECDB" }), light: false },
  { slug: "black-diamond", name: "Bearded Theme Black & Diamond", colors: blackColors, levels: blackLevels, ui: makeMainColorsDark({ base: "#111418", primary: "#69C3FF" }), light: false },
  { slug: "black-diamond-soft", name: "Bearded Theme Black & Diamond Soft", colors: blackColors, levels: blackLevels, ui: makeMainColorsDark({ base: "#131518", primary: "#69C3FF" }), light: false },
  { slug: "black-amethyst", name: "Bearded Theme Black & Amethyst", colors: blackColors, levels: blackLevels, ui: makeMainColorsDark({ base: "#111418", primary: "#B78AFF" }), light: false },
  { slug: "black-amethyst-soft", name: "Bearded Theme Black & Amethyst Soft", colors: blackColors, levels: blackLevels, ui: makeMainColorsDark({ base: "#151418", primary: "#B78AFF" }), light: false },

  // Aquarelle
  { slug: "aquarelle-cymbidium", name: "Bearded Theme Aquarelle Cymbidium", colors: aquarelleColors, levels: aquarelleLevels, ui: makeMainColorsDark({ base: "#2c252a", primary: "#da6e6c" }), light: false },
  { slug: "aquarelle-hydrangea", name: "Bearded Theme Aquarelle Hydrangea", colors: aquarelleColors, levels: aquarelleLevels, ui: makeMainColorsDark({ base: "#22273c", primary: "#6394f1" }), light: false },
  { slug: "aquarelle-lilac", name: "Bearded Theme Aquarelle Lilac", colors: aquarelleColors, levels: aquarelleLevels, ui: makeMainColorsDark({ base: "#252433", primary: "#9587ff" }), light: false },

  // HC
  { slug: "hc-ebony", name: "Bearded Theme HC Ebony", colors: hcColors, levels: hcLevels, ui: makeMainColorsDark({ base: "#181820", primary: "#c2c8d7" }), light: false, hc: true },
  { slug: "hc-midnightvoid", name: "Bearded Theme HC Midnight Void", colors: hcColors, levels: hcLevels, ui: makeMainColorsDark({ base: "#151f27", primary: "#99b3c9" }), light: false, hc: true },
  { slug: "hc-wonderlandwood", name: "Bearded Theme HC Wonderland Wood", colors: hcColors, levels: hcLevels, ui: makeMainColorsDark({ base: "#1F1D36", primary: "#bdb5d6" }), light: false, hc: true },
  { slug: "hc-brewingstorm", name: "Bearded Theme HC Brewing Storm", colors: hcColors, levels: hcLevels, ui: makeMainColorsDark({ base: "#0c2a42", primary: "#8fb8d8" }), light: false, hc: true },
  { slug: "hc-flurry", name: "Bearded Theme HC Flurry", colors: {
    blue: "#0076c5", green: "#008b17", greenAlt: "#668b07", orange: "#b96000",
    pink: "#c121a4", purple: "#7522d3", red: "#d12525", salmon: "#da2a5f",
    turquoize: "#008f8f", yellow: "#c08403",
  }, levels: hcLevels, ui: makeMainColorsLight({ base: "#f5f8fc", primary: "#3a6fa5" }), light: true, hc: true },
  { slug: "minuit", name: "Bearded Theme Minuit", colors: hcColors, levels: hcLevels, ui: makeMainColorsDark({ base: "#1C1827", primary: "#b2a9cb" }), light: false },
  { slug: "chocolate-espresso", name: "Bearded Theme Chocolate Espresso", colors: hcColors, levels: hcLevels, ui: makeMainColorsDark({ base: "#2e2424", primary: "#c0a9a9" }), light: false },

  // Stained
  { slug: "stained-purple", name: "Bearded Theme Stained Purple", colors: stainedColors, levels: stainedLevels, ui: makeMainColorsDark({ base: "#20192b", primary: "#a948ef" }), light: false },
  { slug: "stained-blue", name: "Bearded Theme Stained Blue", colors: stainedColors, levels: stainedLevels, ui: makeMainColorsDark({ base: "#121726", primary: "#3A7FFF" }), light: false },

  // Surprising
  { slug: "surprising-eggplant", name: "Bearded Theme Surprising Eggplant", colors: { ...surprisingBaseColors, turquoize: "#d24e4e", yellow: "#d1a456" }, levels: surprisingLevels, ui: makeMainColorsDark({ base: "#1d1426", primary: "#d24e4e" }), light: false },
  { slug: "surprising-blueberry", name: "Bearded Theme Surprising Blueberry", colors: { ...surprisingBaseColors, turquoize: "#c93e71", yellow: "#d1a456" }, levels: surprisingLevels, ui: makeMainColorsDark({ base: "#101a29", primary: "#c93e71" }), light: false },
  { slug: "surprising-watermelon", name: "Bearded Theme Surprising Watermelon", colors: { ...surprisingBaseColors, turquoize: "#da6c62", yellow: "#d1a456" }, levels: surprisingLevels, ui: makeMainColorsDark({ base: "#142326", primary: "#da6c62" }), light: false },

  // Colorblind
  { slug: "colorblind", name: "Bearded Theme Colorblind", colors: colorblindColors, levels: colorblindLevels, ui: makeMainColorsDark({ base: "#1b1e28", primary: "#9887eb" }), light: false },

  // OLED
  { slug: "oled", name: "Bearded Theme OLED", colors: oledColors, levels: oledLevels, ui: {
    border: lighten("#000000", 10),
    default: lighten("#000000", 4),
    defaultalt: lighten("#000000", 8),
    defaultMain: "#000000",
    font: "#c5c5c5",
    fontalt: "#808080",
    primary: "#688eff",
    primaryalt: lighten("#000000", 15),
    uibackground: "#000000",
    uibackgroundalt: lighten("#000000", 4),
    uibackgroundmid: lighten("#000000", 2),
  }, light: false },

  // Exotic
  { slug: "earth", name: "Bearded Theme Earth", colors: earthColors, levels: earthLevels, ui: makeMainColorsDark({ base: "#221b1b", primary: "#d35386" }), light: false },
  { slug: "coffee", name: "Bearded Theme Coffee", colors: coffeeColors, levels: coffeeLevels, ui: makeMainColorsDark({ base: "#292423", primary: "#F09177" }), light: false },
  { slug: "coffee-reversed", name: "Bearded Theme Coffee Reversed", colors: coffeeColors, levels: coffeeLevels, ui: makeMainColorsDark({ base: "#231e1d", primary: "#F09177", reversed: true }), light: false },
  { slug: "coffee-cream", name: "Bearded Theme Coffee Cream", colors: coffeeLightColors, levels: coffeeLevels, ui: makeMainColorsLight({ base: "#EAE4E1", primary: "#c27225" }), light: true },
  { slug: "voided", name: "Bearded Theme Voided", colors: voidedColors, levels: voidedLevels, ui: makeMainColorsDark({ base: "#101023", primary: "#7A63ED" }), light: false },
  { slug: "altica", name: "Bearded Theme Altica", colors: alticaColors, levels: alticaLevels, ui: {
    border: "#2C3543",
    default: "#232D3B",
    defaultalt: "#354357",
    defaultMain: "#1A2332",
    font: "#A8B8CC",
    fontalt: "#6B7D92",
    primary: "#60A8E0",
    primaryalt: "#2F4052",
    uibackground: "#1A2332",
    uibackgroundalt: "#232D3B",
    uibackgroundmid: "#1E2838",
  }, light: false },

  // Feat
  { slug: "will", name: "Bearded Theme Will", colors: willColors, levels: willLevels, ui: makeMainColorsDark({ base: "#17171f", primary: "#8f9eb8" }), light: false },
  { slug: "gold-d-raynh", name: "Bearded Theme Gold D Raynh", colors: goldDColors, levels: goldDLevels, ui: makeMainColorsDark({ base: "#0f1628", primary: "#e39000" }), light: false },
  { slug: "gold-d-raynh-light", name: "Bearded Theme Gold D Raynh Light", colors: goldLightColors, levels: goldDLevels, ui: makeMainColorsLight({ base: "#f5f5f5", primary: "#2397e5" }), light: true },
  { slug: "melle-julie", name: "Bearded Theme Melle Julie", colors: melleJulieColors, levels: melleJulieLevels, ui: makeMainColorsDark({ base: "#1c1f24", primary: "#63edef" }), light: false },
  { slug: "melle-julie-light", name: "Bearded Theme Melle Julie Light", colors: melleJulieLightColors, levels: melleJulieLevels, ui: makeMainColorsLight({ base: "#edeeee", primary: "#218d8f" }), light: true },
  { slug: "webdevcody", name: "Bearded Theme WebDevCody", colors: webDevCodyColors, levels: webDevCodyLevels, ui: makeMainColorsDark({ base: "#00171e", primary: "#e95d74" }), light: false },

  // Islands
  { slug: "islands-moonstone", name: "Bearded Theme Islands Moonstone", colors: moonstoneColors, levels: moonstoneLevels, ui: makeMainColorsDark({ base: "#151D28", primary: "#63D9D1" }), light: false },
];


module.exports = { themeRegistry };
