#!/usr/bin/env node

"use strict";

/**
 * Generates every theme, editor scheme, the test registry, and the plugin.xml
 * provider block from one palette registry. Use --check in CI to detect drift.
 */

const fs = require("fs");
const path = require("path");
const { generateEditorSchemeXml } = require("./lib/editor-scheme");
const { themeRegistry } = require("./lib/theme-registry");
const { generateThemeJson } = require("./lib/theme-ui");

const projectRoot = path.resolve(__dirname, "..");
const themesDirectory = path.join(projectRoot, "src", "main", "resources", "themes");
const pluginXmlPath = path.join(projectRoot, "src", "main", "resources", "META-INF", "plugin.xml");
const providerStart = "    <!-- GENERATED-THEME-PROVIDERS:START -->";
const providerEnd = "    <!-- GENERATED-THEME-PROVIDERS:END -->";

function themeList() {
  return themeRegistry.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    dark: !entry.light,
    hc: Boolean(entry.hc),
    themeFile: `${entry.slug}.theme.json`,
    schemeFile: `${entry.slug}.xml`,
  }));
}

function buildGeneratedFiles() {
  const files = new Map();
  for (const entry of themeRegistry) {
    files.set(
      path.join(themesDirectory, `${entry.slug}.theme.json`),
      `${JSON.stringify(generateThemeJson(entry), null, 2)}\n`,
    );
    files.set(
      path.join(themesDirectory, `${entry.slug}.xml`),
      generateEditorSchemeXml(entry),
    );
  }
  files.set(
    path.join(themesDirectory, "theme-list.json"),
    `${JSON.stringify(themeList(), null, 2)}\n`,
  );
  return files;
}

function generatedProviderBlock() {
  const providers = themeRegistry.map((entry) =>
    `    <themeProvider id="dev.jetplugins.beardedtheme.${entry.slug}" path="/themes/${entry.slug}.theme.json" />`,
  );
  return [providerStart, ...providers, providerEnd].join("\n");
}

function withGeneratedProviders(pluginXml) {
  const start = pluginXml.indexOf(providerStart);
  const end = pluginXml.indexOf(providerEnd);
  if (start < 0 || end < start) {
    throw new Error("plugin.xml is missing the generated theme-provider markers");
  }
  return pluginXml.slice(0, start)
    + generatedProviderBlock()
    + pluginXml.slice(end + providerEnd.length);
}

function staleGeneratedFiles() {
  if (!fs.existsSync(themesDirectory)) return [];
  const expected = new Set([...buildGeneratedFiles().keys()].map((file) => path.basename(file)));
  return fs.readdirSync(themesDirectory)
    .filter((file) => (file.endsWith(".theme.json") || file.endsWith(".xml")) && !expected.has(file))
    .map((file) => path.join(themesDirectory, file));
}

function checkGeneratedFiles() {
  const problems = [];
  for (const [file, expected] of buildGeneratedFiles()) {
    if (!fs.existsSync(file)) {
      problems.push(`missing: ${path.relative(projectRoot, file)}`);
    } else if (fs.readFileSync(file, "utf8") !== expected) {
      problems.push(`out of date: ${path.relative(projectRoot, file)}`);
    }
  }
  for (const file of staleGeneratedFiles()) {
    problems.push(`stale: ${path.relative(projectRoot, file)}`);
  }

  const currentPluginXml = fs.readFileSync(pluginXmlPath, "utf8");
  if (withGeneratedProviders(currentPluginXml) !== currentPluginXml) {
    problems.push("out of date: src/main/resources/META-INF/plugin.xml provider block");
  }
  return problems;
}

function writeGeneratedFiles() {
  fs.mkdirSync(themesDirectory, { recursive: true });
  const stale = staleGeneratedFiles();
  if (stale.length > 0) {
    throw new Error(`Refusing to overwrite with stale generated files present:\n${stale.join("\n")}`);
  }
  for (const [file, content] of buildGeneratedFiles()) fs.writeFileSync(file, content);
  const pluginXml = fs.readFileSync(pluginXmlPath, "utf8");
  fs.writeFileSync(pluginXmlPath, withGeneratedProviders(pluginXml));
}

function main(arguments_) {
  if (arguments_.includes("--check")) {
    const problems = checkGeneratedFiles();
    if (problems.length > 0) {
      console.error("Generated theme validation failed:\n" + problems.map((problem) => `  - ${problem}`).join("\n"));
      process.exitCode = 1;
      return;
    }
    console.log(`All ${themeRegistry.length} generated themes are current.`);
    return;
  }

  writeGeneratedFiles();
  console.log(`Generated ${themeRegistry.length} themes and synchronized plugin.xml.`);
}

if (require.main === module) main(process.argv.slice(2));

module.exports = {
  buildGeneratedFiles,
  checkGeneratedFiles,
  generatedProviderBlock,
  main,
  themeList,
  withGeneratedProviders,
  writeGeneratedFiles,
};
