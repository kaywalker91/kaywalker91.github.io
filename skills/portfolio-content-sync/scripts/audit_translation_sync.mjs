#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";

function parseArgs(argv) {
  const options = {
    repoPath: process.cwd(),
    format: "text",
    strict: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--repo") {
      options.repoPath = argv[i + 1] ?? options.repoPath;
      i += 1;
      continue;
    }
    if (arg === "--format") {
      const format = argv[i + 1];
      if (format === "json" || format === "text") {
        options.format = format;
      }
      i += 1;
      continue;
    }
    if (arg === "--strict") {
      options.strict = true;
    }
  }

  options.repoPath = path.resolve(options.repoPath);
  return options;
}

function baseReport() {
  return {
    ok: true,
    errors: [],
    warnings: [],
    stats: {},
  };
}

function readUtf8(filePath, report) {
  if (!fs.existsSync(filePath)) {
    report.errors.push({
      code: "FILE_NOT_FOUND",
      file: filePath,
      message: `Required file does not exist: ${filePath}`,
    });
    return null;
  }

  return fs.readFileSync(filePath, "utf8");
}

function sortStrings(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function summarizeKeys(keys, max = 12) {
  if (keys.length <= max) {
    return keys.join(", ");
  }
  const preview = keys.slice(0, max).join(", ");
  return `${preview} ... (+${keys.length - max} more)`;
}

function extractDataI18nKeys(source) {
  const keys = new Set();
  const regex = /data-i18n=["']([^"']+)["']/g;
  let match = regex.exec(source);
  while (match) {
    keys.add(match[1]);
    match = regex.exec(source);
  }
  return keys;
}

function extractI18nCallKeys(source) {
  const keys = new Set();
  const regex = /i18n\.t\(\s*["']([^"']+)["']\s*\)/g;
  let match = regex.exec(source);
  while (match) {
    keys.add(match[1]);
    match = regex.exec(source);
  }
  return keys;
}

function loadTranslations(translationsPath, report) {
  const source = readUtf8(translationsPath, report);
  if (source === null) {
    return null;
  }

  const sandbox = {};
  vm.createContext(sandbox);
  try {
    vm.runInContext(
      `${source}\n;globalThis.__translations__ = translations;`,
      sandbox,
      { timeout: 1000 }
    );
  } catch (error) {
    report.errors.push({
      code: "TRANSLATIONS_PARSE_FAILED",
      file: "js/translations.js",
      message: `Unable to parse translations.js: ${error.message}`,
    });
    return null;
  }

  const translations = sandbox.__translations__;
  if (!translations || typeof translations !== "object") {
    report.errors.push({
      code: "TRANSLATIONS_INVALID",
      file: "js/translations.js",
      message: "translations.js did not expose a valid translations object.",
    });
    return null;
  }

  if (!translations.ko || !translations.en) {
    report.errors.push({
      code: "TRANSLATIONS_LANG_MISSING",
      file: "js/translations.js",
      message: "translations.js must include both `ko` and `en` dictionaries.",
    });
    return null;
  }

  return translations;
}

function collectPrefixedKeys(keys, prefix) {
  return new Set([...keys].filter((key) => key.startsWith(prefix)));
}

export function runCheck(options = {}) {
  const resolvedOptions = {
    repoPath: path.resolve(options.repoPath ?? process.cwd()),
  };
  const report = baseReport();

  const indexPath = path.join(resolvedOptions.repoPath, "index.html");
  const mainPath = path.join(resolvedOptions.repoPath, "js", "main.js");
  const translationsPath = path.join(
    resolvedOptions.repoPath,
    "js",
    "translations.js"
  );

  const indexSource = readUtf8(indexPath, report);
  const mainSource = readUtf8(mainPath, report);
  const translations = loadTranslations(translationsPath, report);
  if (indexSource === null || mainSource === null || translations === null) {
    report.ok = false;
    return report;
  }

  const usageKeys = new Set([
    ...extractDataI18nKeys(indexSource),
    ...extractDataI18nKeys(mainSource),
    ...extractI18nCallKeys(mainSource),
  ]);

  const koKeys = new Set(Object.keys(translations.ko));
  const enKeys = new Set(Object.keys(translations.en));
  const prefixes = ["projects.", "experience.", "modal."];
  const prefixStats = {};

  for (const prefix of prefixes) {
    const koPrefixKeys = collectPrefixedKeys(koKeys, prefix);
    const enPrefixKeys = collectPrefixedKeys(enKeys, prefix);
    const usedPrefixKeys = collectPrefixedKeys(usageKeys, prefix);

    const koOnly = sortStrings(
      [...koPrefixKeys].filter((key) => !enPrefixKeys.has(key))
    );
    const enOnly = sortStrings(
      [...enPrefixKeys].filter((key) => !koPrefixKeys.has(key))
    );
    const usedMissingKo = sortStrings(
      [...usedPrefixKeys].filter((key) => !koPrefixKeys.has(key))
    );
    const usedMissingEn = sortStrings(
      [...usedPrefixKeys].filter((key) => !enPrefixKeys.has(key))
    );
    const unusedKo = sortStrings(
      [...koPrefixKeys].filter((key) => !usedPrefixKeys.has(key))
    );
    const unusedEn = sortStrings(
      [...enPrefixKeys].filter((key) => !usedPrefixKeys.has(key))
    );

    if (koOnly.length > 0) {
      report.errors.push({
        code: "TRANSLATION_KO_ONLY_KEYS",
        file: "js/translations.js",
        message: `[${prefix}] keys present only in ko: ${summarizeKeys(koOnly)}`,
      });
    }

    if (enOnly.length > 0) {
      report.errors.push({
        code: "TRANSLATION_EN_ONLY_KEYS",
        file: "js/translations.js",
        message: `[${prefix}] keys present only in en: ${summarizeKeys(enOnly)}`,
      });
    }

    if (usedMissingKo.length > 0) {
      report.errors.push({
        code: "TRANSLATION_USED_KEY_MISSING_KO",
        file: "js/translations.js",
        message: `[${prefix}] used keys missing in ko: ${summarizeKeys(
          usedMissingKo
        )}`,
      });
    }

    if (usedMissingEn.length > 0) {
      report.errors.push({
        code: "TRANSLATION_USED_KEY_MISSING_EN",
        file: "js/translations.js",
        message: `[${prefix}] used keys missing in en: ${summarizeKeys(
          usedMissingEn
        )}`,
      });
    }

    if (unusedKo.length > 0 || unusedEn.length > 0) {
      report.warnings.push({
        code: "TRANSLATION_UNUSED_PREFIX_KEYS",
        file: "js/translations.js",
        message: `[${prefix}] unused keys in ko/en dictionaries. ko=${unusedKo.length}, en=${unusedEn.length}.`,
      });
    }

    prefixStats[prefix] = {
      usedKeyCount: usedPrefixKeys.size,
      koKeyCount: koPrefixKeys.size,
      enKeyCount: enPrefixKeys.size,
      koOnlyCount: koOnly.length,
      enOnlyCount: enOnly.length,
      usedMissingKoCount: usedMissingKo.length,
      usedMissingEnCount: usedMissingEn.length,
      unusedKoCount: unusedKo.length,
      unusedEnCount: unusedEn.length,
    };
  }

  report.stats = {
    prefixes: prefixStats,
  };
  report.ok = report.errors.length === 0;
  return report;
}

function renderText(report) {
  const lines = [];
  lines.push(`ok: ${report.ok}`);
  lines.push(`errors: ${report.errors.length}`);
  for (const error of report.errors) {
    lines.push(`- [${error.code}] ${error.file}: ${error.message}`);
  }
  lines.push(`warnings: ${report.warnings.length}`);
  for (const warning of report.warnings) {
    lines.push(`- [${warning.code}] ${warning.file}: ${warning.message}`);
  }
  lines.push(`stats: ${JSON.stringify(report.stats)}`);
  return lines.join("\n");
}

function printReport(report, format) {
  if (format === "json") {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(renderText(report));
}

function runCli() {
  const options = parseArgs(process.argv.slice(2));
  const report = runCheck(options);
  printReport(report, options.format);

  if (options.strict && report.errors.length > 0) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
