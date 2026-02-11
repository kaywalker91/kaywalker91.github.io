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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findElementTagById(source, id) {
  const pattern = new RegExp(
    `<[^>]*\\bid=["']${escapeRegExp(id)}["'][^>]*>`,
    "i"
  );
  const match = source.match(pattern);
  return match ? match[0] : null;
}

function hasAttribute(tag, attribute) {
  const pattern = new RegExp(`\\b${escapeRegExp(attribute)}=["'][^"']*["']`, "i");
  return pattern.test(tag);
}

export function runCheck(options = {}) {
  const resolvedOptions = {
    repoPath: path.resolve(options.repoPath ?? process.cwd()),
  };
  const report = baseReport();

  const indexPath = path.join(resolvedOptions.repoPath, "index.html");
  const indexSource = readUtf8(indexPath, report);
  if (indexSource === null) {
    report.ok = false;
    return report;
  }

  const requirements = [
    { id: "lang-toggle", requiredAttribute: "aria-label" },
    { id: "theme-toggle", requiredAttribute: "aria-label" },
    { id: "project-modal", requiredAttribute: "aria-hidden" },
    { id: "back-to-top", requiredAttribute: "aria-label" },
  ];

  let foundCount = 0;
  let attributeSatisfiedCount = 0;

  for (const item of requirements) {
    const tag = findElementTagById(indexSource, item.id);
    if (!tag) {
      report.errors.push({
        code: "UI_REQUIRED_ID_MISSING",
        file: "index.html",
        message: `Required element id "${item.id}" was not found.`,
      });
      continue;
    }
    foundCount += 1;

    if (!hasAttribute(tag, item.requiredAttribute)) {
      report.errors.push({
        code: "UI_REQUIRED_ATTRIBUTE_MISSING",
        file: "index.html",
        message: `Element "${item.id}" is missing attribute "${item.requiredAttribute}".`,
      });
      continue;
    }
    attributeSatisfiedCount += 1;
  }

  const modalCloseButtonPattern =
    /<button[^>]*\bdata-modal-close\b[^>]*>/i;
  const modalCloseButton = indexSource.match(modalCloseButtonPattern);
  if (!modalCloseButton) {
    report.warnings.push({
      code: "UI_MODAL_CLOSE_BUTTON_MISSING",
      file: "index.html",
      message: "No button with data-modal-close was found.",
    });
  } else if (!hasAttribute(modalCloseButton[0], "aria-label")) {
    report.warnings.push({
      code: "UI_MODAL_CLOSE_ARIA_LABEL_MISSING",
      file: "index.html",
      message: "Modal close button should define aria-label.",
    });
  }

  report.stats = {
    requiredElementCount: requirements.length,
    foundElementCount: foundCount,
    satisfiedAttributeCount: attributeSatisfiedCount,
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
