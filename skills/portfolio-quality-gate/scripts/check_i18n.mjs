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

function sortStrings(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
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
      file: path.relative(process.cwd(), translationsPath),
      message: `Unable to parse translations.js: ${error.message}`,
    });
    return null;
  }

  const translations = sandbox.__translations__;
  if (!translations || typeof translations !== "object") {
    report.errors.push({
      code: "TRANSLATIONS_INVALID",
      file: path.relative(process.cwd(), translationsPath),
      message: "translations.js did not expose a valid translations object.",
    });
    return null;
  }

  if (!translations.ko || !translations.en) {
    report.errors.push({
      code: "TRANSLATIONS_LANG_MISSING",
      file: path.relative(process.cwd(), translationsPath),
      message: "translations.js must include both `ko` and `en` dictionaries.",
    });
    return null;
  }

  return translations;
}

function summarizeKeys(keys, max = 12) {
  if (keys.length <= max) {
    return keys.join(", ");
  }
  const preview = keys.slice(0, max).join(", ");
  return `${preview} ... (+${keys.length - max} more)`;
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

  const htmlKeys = extractDataI18nKeys(indexSource);
  const jsTemplateKeys = extractDataI18nKeys(mainSource);
  const usedKeys = new Set([...htmlKeys, ...jsTemplateKeys]);

  const koKeys = new Set(Object.keys(translations.ko));
  const enKeys = new Set(Object.keys(translations.en));

  const missingInKo = sortStrings(
    [...usedKeys].filter((key) => !koKeys.has(key))
  );
  const missingInEn = sortStrings(
    [...usedKeys].filter((key) => !enKeys.has(key))
  );
  const koOnly = sortStrings([...koKeys].filter((key) => !enKeys.has(key)));
  const enOnly = sortStrings([...enKeys].filter((key) => !koKeys.has(key)));

  if (missingInKo.length > 0) {
    report.errors.push({
      code: "I18N_KEY_MISSING_IN_KO",
      file: "js/translations.js",
      message: `Used i18n keys missing in ko dictionary: ${summarizeKeys(
        missingInKo
      )}`,
    });
  }

  if (missingInEn.length > 0) {
    report.errors.push({
      code: "I18N_KEY_MISSING_IN_EN",
      file: "js/translations.js",
      message: `Used i18n keys missing in en dictionary: ${summarizeKeys(
        missingInEn
      )}`,
    });
  }

  if (koOnly.length > 0) {
    report.errors.push({
      code: "I18N_KO_EN_MISMATCH",
      file: "js/translations.js",
      message: `Keys present only in ko dictionary: ${summarizeKeys(koOnly)}`,
    });
  }

  if (enOnly.length > 0) {
    report.errors.push({
      code: "I18N_EN_KO_MISMATCH",
      file: "js/translations.js",
      message: `Keys present only in en dictionary: ${summarizeKeys(enOnly)}`,
    });
  }

  const translationUnion = new Set([...koKeys, ...enKeys]);
  const unusedKeys = sortStrings(
    [...translationUnion].filter((key) => !usedKeys.has(key))
  );
  if (unusedKeys.length > 0) {
    report.warnings.push({
      code: "I18N_UNUSED_TRANSLATION_KEYS",
      file: "js/translations.js",
      message: `Translation keys not referenced by index.html or js/main.js: ${summarizeKeys(
        unusedKeys
      )}`,
    });
  }

  report.stats = {
    htmlKeyCount: htmlKeys.size,
    jsTemplateKeyCount: jsTemplateKeys.size,
    usedKeyCount: usedKeys.size,
    koKeyCount: koKeys.size,
    enKeyCount: enKeys.size,
    missingInKoCount: missingInKo.length,
    missingInEnCount: missingInEn.length,
    koOnlyCount: koOnly.length,
    enOnlyCount: enOnly.length,
    unusedKeyCount: unusedKeys.length,
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
