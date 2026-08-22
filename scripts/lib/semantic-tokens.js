"use strict";

const { contrastForeground, darken, ensureContrast, hexToIntelliJ, lighten, mix } = require("./colors");

function makeMainColorsDark({ base, primary, reversed, primaryAlt }) {
  const uibackground = reversed ? lighten(base, 4) : base;
  return {
    border: lighten(base, 5),
    default: lighten(base, 4),
    defaultalt: lighten(base, 8),
    defaultMain: base,
    font: lighten(base, 55),
    fontalt: ensureContrast(lighten(base, 35), uibackground, 3.1),
    primary,
    primaryalt: primaryAlt || lighten(base, 10),
    uibackground,
    uibackgroundalt: reversed ? base : lighten(base, 4),
    uibackgroundmid: reversed ? lighten(base, 2) : lighten(base, 2),
  };
}

function makeMainColorsLight({ base, primary, primaryAlt }) {
  return {
    border: darken(base, 10),
    default: darken(base, 6),
    defaultalt: darken(base, 12),
    defaultMain: base,
    font: darken(base, 65),
    fontalt: ensureContrast(darken(base, 35), base, 3.1),
    primary,
    primaryalt: primaryAlt || darken(base, 15),
    uibackground: base,
    uibackgroundalt: darken(base, 6),
    uibackgroundmid: darken(base, 3),
  };
}

function createSemanticTokens(entry) {
  const { colors, levels, ui, light } = entry;
  const isDark = !light;
  const accessible = createAccessibleEditorPalette(entry);
  const adjust = (amount) => isDark
    ? lighten(ui.uibackground, amount)
    : darken(ui.uibackground, amount);
  const tint = (color, weight) => mix(ui.uibackground, color, weight);

  return {
    isDark,
    transparent: "#00000000",
    accentForeground: contrastForeground(ui.primary),
    frameBackground: mix(ui.uibackground, isDark ? "#ffffff" : "#000000", 0.88),
    selection: adjust(12),
    selectionInactive: adjust(8),
    lineHighlight: adjust(4),
    caretRow: adjust(3),
    bracketBackground: adjust(10),
    scrollThumb: adjust(12),
    scrollThumbBorder: adjust(15),
    diff: {
      added: tint(accessible.levels.success, 0.78),
      deleted: tint(accessible.levels.danger, 0.78),
      modified: tint(accessible.levels.info, 0.78),
      conflict: tint(accessible.levels.warning, 0.78),
    },
    search: {
      result: tint(accessible.colors.yellow, 0.78),
      write: tint(accessible.colors.orange, 0.78),
    },
  };
}

function createAccessibleEditorPalette(entry) {
  const normalize = (palette) => Object.fromEntries(
    Object.entries(palette).map(([name, color]) => [
      name,
      ensureContrast(color, entry.ui.uibackground, 3.1),
    ]),
  );
  return {
    colors: normalize(entry.colors),
    levels: normalize(entry.levels),
  };
}

function toIntelliJTokens(entry) {
  const semantic = createSemanticTokens(entry);
  return Object.fromEntries(Object.entries(semantic).map(([key, value]) => {
    if (typeof value === "string" && value.startsWith("#")) return [key, hexToIntelliJ(value)];
    if (value && typeof value === "object") {
      return [key, Object.fromEntries(Object.entries(value).map(([nestedKey, nestedValue]) => [nestedKey, hexToIntelliJ(nestedValue)]))];
    }
    return [key, value];
  }));
}

module.exports = {
  createAccessibleEditorPalette,
  createSemanticTokens,
  makeMainColorsDark,
  makeMainColorsLight,
  toIntelliJTokens,
};
