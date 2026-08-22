"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { contrastRatio } = require("../lib/colors");
const { createAccessibleEditorPalette, createSemanticTokens } = require("../lib/semantic-tokens");
const { themeRegistry } = require("../lib/theme-registry");
const { generateThemeJson } = require("../lib/theme-ui");
const { generateEditorSchemeXml } = require("../lib/editor-scheme");

test("registry contains unique, complete theme definitions", () => {
  assert.equal(themeRegistry.length, 65);
  assert.equal(new Set(themeRegistry.map(({ slug }) => slug)).size, themeRegistry.length);
  for (const entry of themeRegistry) {
    assert.match(entry.slug, /^[a-z0-9-]+$/);
    assert.ok(entry.name.startsWith("Bearded Theme "));
    assert.deepEqual(
      Object.keys(entry.colors).sort(),
      ["blue", "green", "greenAlt", "orange", "pink", "purple", "red", "salmon", "turquoize", "yellow"].sort(),
    );
  }
});

test("all themes inherit the official Islands parent and expose readable surfaces", () => {
  for (const entry of themeRegistry) {
    const theme = generateThemeJson(entry);
    const semantic = createSemanticTokens(entry);
    assert.equal(theme.parentTheme, entry.light ? "Islands Light" : "Islands Dark");
    assert.equal(theme.ui.Islands, 1);
    assert.ok(contrastRatio(entry.ui.uibackground, semantic.frameBackground) >= 1.2, entry.slug);
    assert.ok(contrastRatio(entry.ui.primary, semantic.accentForeground) >= 4.5, entry.slug);
    assert.ok(contrastRatio(entry.ui.uibackground, entry.ui.fontalt) >= 3.0, `${entry.slug} inactive text`);
    assert.ok(Number(theme.ui["Island.inactiveAlpha"]) >= 0.4, `${entry.slug} inactive island visibility`);
    for (const [role, color] of Object.entries(createAccessibleEditorPalette(entry).colors)) {
      assert.ok(contrastRatio(entry.ui.uibackground, color) >= 3.0, `${entry.slug} syntax ${role}`);
    }
    for (const [state, color] of Object.entries(semantic.diff)) {
      assert.ok(contrastRatio(entry.ui.uibackground, color) >= 1.1, `${entry.slug} diff ${state}`);
      assert.ok(contrastRatio(entry.ui.font, color) >= 3.0, `${entry.slug} diff text ${state}`);
    }
    for (const [state, color] of Object.entries(semantic.search)) {
      assert.ok(contrastRatio(entry.ui.uibackground, color) >= 1.1, `${entry.slug} search ${state}`);
      assert.ok(contrastRatio(entry.ui.font, color) >= 3.0, `${entry.slug} search text ${state}`);
    }
  }
});

test("colorblind status roles remain distinguishable under common CVD simulations", () => {
  const colorblind = themeRegistry.find(({ slug }) => slug === "colorblind");
  const matrices = [
    [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
  ];
  const simulate = (hex, matrix) => {
    const { r, g, b } = require("../lib/colors").hexToRgb(hex);
    return matrix.map((row) => Math.max(0, Math.min(255, row[0] * r + row[1] * g + row[2] * b)));
  };
  for (const matrix of matrices) {
    const roles = Object.entries(colorblind.levels).map(([name, color]) => [name, simulate(color, matrix)]);
    for (let first = 0; first < roles.length; first += 1) {
      for (let second = first + 1; second < roles.length; second += 1) {
        const distance = Math.hypot(...roles[first][1].map((value, index) => value - roles[second][1][index]));
        assert.ok(distance >= 40, `${roles[first][0]} and ${roles[second][0]}: ${distance}`);
      }
    }
  }
});

test("editor schemes include modern semantic states and well-nested values", () => {
  const required = [
    "DEFAULT_KEYWORD", "DEFAULT_STRING", "DEFAULT_NUMBER", "DEFAULT_FUNCTION_CALL",
    "DEFAULT_CLASS_NAME", "DEFAULT_BLOCK_COMMENT", "DEFAULT_LOCAL_VARIABLE",
    "DEFAULT_PARAMETER", "DIFF_INSERTED", "DIFF_DELETED", "DIFF_MODIFIED",
    "DIFF_CONFLICT", "SEARCH_RESULT_ATTRIBUTES", "WRITE_SEARCH_RESULT_ATTRIBUTES",
  ];
  for (const entry of themeRegistry) {
    const xml = generateEditorSchemeXml(entry);
    assert.doesNotMatch(xml, /<value>\s*<value>/, entry.slug);
    assert.match(xml, new RegExp(`parent_scheme="${entry.light ? "Default" : "Darcula"}"`));
    for (const token of required) assert.match(xml, new RegExp(`name="${token}"`), `${entry.slug}: ${token}`);
  }
});
