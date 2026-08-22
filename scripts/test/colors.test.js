"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  contrastForeground,
  contrastRatio,
  darken,
  hexToRgb,
  lighten,
  mix,
} = require("../lib/colors");

test("color transforms are deterministic", () => {
  assert.deepEqual(hexToRgb("#abc"), { r: 170, g: 187, b: 204 });
  assert.equal(mix("#000000", "#ffffff", 0.5), "#808080");
  assert.equal(lighten("#000000", 50), "#808080");
  assert.equal(darken("#ffffff", 50), "#808080");
});

test("accent foreground always chooses the stronger black/white contrast", () => {
  for (const background of ["#000000", "#ffffff", "#63D9D1", "#7A63ED"]) {
    const selected = contrastForeground(background);
    const alternative = selected === "#000000" ? "#ffffff" : "#000000";
    assert.ok(contrastRatio(background, selected) >= contrastRatio(background, alternative));
    assert.ok(contrastRatio(background, selected) >= 4.5);
  }
});
