"use strict";

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const expanded = normalized.length === 3
    ? normalized.split("").map((character) => character.repeat(2)).join("")
    : normalized;
  return {
    r: Number.parseInt(expanded.substring(0, 2), 16),
    g: Number.parseInt(expanded.substring(2, 4), 16),
    b: Number.parseInt(expanded.substring(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const channel = (value) => Math.max(0, Math.min(255, Math.round(value)))
    .toString(16)
    .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function hexToHsl(hex) {
  const { r: red, g: green, b: blue } = hexToRgb(hex);
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: lightness * 100 };

  const delta = max - min;
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);
  let hue;
  if (max === r) hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / delta + 2) / 6;
  else hue = ((r - g) / delta + 4) / 6;
  return { h: hue * 360, s: saturation * 100, l: lightness * 100 };
}

function hslToHex({ h, s, l }) {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;
  if (saturation === 0) {
    return rgbToHex({ r: lightness * 255, g: lightness * 255, b: lightness * 255 });
  }

  const hueToRgb = (p, q, value) => {
    let component = value;
    if (component < 0) component += 1;
    if (component > 1) component -= 1;
    if (component < 1 / 6) return p + (q - p) * 6 * component;
    if (component < 1 / 2) return q;
    if (component < 2 / 3) return p + (q - p) * (2 / 3 - component) * 6;
    return p;
  };
  const q = lightness < 0.5
    ? lightness * (1 + saturation)
    : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  return rgbToHex({
    r: hueToRgb(p, q, hue + 1 / 3) * 255,
    g: hueToRgb(p, q, hue) * 255,
    b: hueToRgb(p, q, hue - 1 / 3) * 255,
  });
}

function lighten(hex, amount) {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, l: Math.min(100, hsl.l + amount) });
}

function darken(hex, amount) {
  const hsl = hexToHsl(hex);
  return hslToHex({ ...hsl, l: Math.max(0, hsl.l - amount) });
}

function mix(hex1, hex2, weight = 0.5) {
  const first = hexToRgb(hex1);
  const second = hexToRgb(hex2);
  return rgbToHex({
    r: first.r * weight + second.r * (1 - weight),
    g: first.g * weight + second.g * (1 - weight),
    b: first.b * weight + second.b * (1 - weight),
  });
}

function relativeLuminance(hex) {
  const linearize = (value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  };
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(hex1, hex2) {
  const first = relativeLuminance(hex1);
  const second = relativeLuminance(hex2);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function contrastForeground(background) {
  return contrastRatio(background, "#000000") >= contrastRatio(background, "#ffffff")
    ? "#000000"
    : "#ffffff";
}

function ensureContrast(foreground, background, minimum = 3) {
  if (contrastRatio(foreground, background) >= minimum) return foreground;
  const target = relativeLuminance(background) > 0.5 ? "#000000" : "#ffffff";
  for (let foregroundWeight = 0.95; foregroundWeight >= 0; foregroundWeight -= 0.05) {
    const candidate = mix(foreground, target, foregroundWeight);
    if (contrastRatio(candidate, background) >= minimum) return candidate;
  }
  return target;
}

function hexToIntelliJ(hex) {
  return hex.replace("#", "").toUpperCase();
}

function escapeXmlAttribute(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = {
  contrastForeground,
  contrastRatio,
  darken,
  ensureContrast,
  escapeXmlAttribute,
  hexToHsl,
  hexToIntelliJ,
  hexToRgb,
  hslToHex,
  lighten,
  mix,
  relativeLuminance,
  rgbToHex,
};
