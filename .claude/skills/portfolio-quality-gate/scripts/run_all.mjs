#!/usr/bin/env node

import path from "node:path";
import { pathToFileURL } from "node:url";
import { runCheck as runI18nCheck } from "./check_i18n.mjs";
import { runCheck as runSeoSitemapCheck } from "./check_seo_and_sitemap.mjs";
import { runCheck as runUiContractsCheck } from "./check_ui_contracts.mjs";

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

export function runCheck(options = {}) {
  const resolvedOptions = {
    repoPath: path.resolve(options.repoPath ?? process.cwd()),
  };
  const report = baseReport();

  const checks = [
    { id: "i18n", fn: runI18nCheck },
    { id: "seo_sitemap", fn: runSeoSitemapCheck },
    { id: "ui_contracts", fn: runUiContractsCheck },
  ];

  const statsByCheck = {};

  for (const check of checks) {
    const result = check.fn({ repoPath: resolvedOptions.repoPath });
    statsByCheck[check.id] = result.stats;

    for (const entry of result.errors) {
      report.errors.push({
        code: `${check.id.toUpperCase()}_${entry.code}`,
        file: entry.file,
        message: entry.message,
      });
    }

    for (const entry of result.warnings) {
      report.warnings.push({
        code: `${check.id.toUpperCase()}_${entry.code}`,
        file: entry.file,
        message: entry.message,
      });
    }
  }

  report.stats = {
    checks: statsByCheck,
    errorCount: report.errors.length,
    warningCount: report.warnings.length,
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
