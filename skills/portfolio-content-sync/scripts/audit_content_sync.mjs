#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
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

function extractDataProjectValues(indexSource) {
  const values = new Set();
  const regex = /data-project=["']([^"']+)["']/g;
  let match = regex.exec(indexSource);
  while (match) {
    values.add(match[1]);
    match = regex.exec(indexSource);
  }
  return values;
}

function extractProjectDataKeys(mainSource) {
  const marker = "const projectData = {";
  const start = mainSource.indexOf(marker);
  if (start === -1) {
    return null;
  }

  const end = mainSource.indexOf("\nfunction setupProjectModal", start);
  if (end === -1) {
    return null;
  }

  const objectSection = mainSource.slice(start, end);
  const keys = new Set();
  const keyRegex = /^\s{2}([a-zA-Z0-9_-]+)\s*:\s*{/gm;

  let match = keyRegex.exec(objectSection);
  while (match) {
    keys.add(match[1]);
    match = keyRegex.exec(objectSection);
  }

  return keys;
}

export function runCheck(options = {}) {
  const resolvedOptions = {
    repoPath: path.resolve(options.repoPath ?? process.cwd()),
  };
  const report = baseReport();

  const indexPath = path.join(resolvedOptions.repoPath, "index.html");
  const mainPath = path.join(resolvedOptions.repoPath, "js", "main.js");

  const indexSource = readUtf8(indexPath, report);
  const mainSource = readUtf8(mainPath, report);
  if (indexSource === null || mainSource === null) {
    report.ok = false;
    return report;
  }

  const htmlProjectIds = extractDataProjectValues(indexSource);
  const projectDataKeys = extractProjectDataKeys(mainSource);
  if (projectDataKeys === null) {
    report.errors.push({
      code: "PROJECT_DATA_PARSE_FAILED",
      file: "js/main.js",
      message:
        "Unable to locate and parse `const projectData = { ... }` section in js/main.js.",
    });
    report.ok = false;
    return report;
  }

  const missingInProjectData = sortStrings(
    [...htmlProjectIds].filter((id) => !projectDataKeys.has(id))
  );
  const missingInHtml = sortStrings(
    [...projectDataKeys].filter((id) => !htmlProjectIds.has(id))
  );

  if (missingInProjectData.length > 0) {
    report.errors.push({
      code: "PROJECT_DATA_MISSING_KEYS",
      file: "js/main.js",
      message: `data-project values missing in projectData keys: ${summarizeKeys(
        missingInProjectData
      )}`,
    });
  }

  if (missingInHtml.length > 0) {
    report.errors.push({
      code: "HTML_DATA_PROJECT_MISSING_KEYS",
      file: "index.html",
      message: `projectData keys not referenced by any data-project attribute: ${summarizeKeys(
        missingInHtml
      )}`,
    });
  }

  report.stats = {
    htmlDataProjectCount: htmlProjectIds.size,
    projectDataKeyCount: projectDataKeys.size,
    missingInProjectDataCount: missingInProjectData.length,
    missingInHtmlCount: missingInHtml.length,
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
