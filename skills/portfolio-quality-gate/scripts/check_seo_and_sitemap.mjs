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

function addMissingTagError(report, code, message) {
  report.errors.push({
    code,
    file: "index.html",
    message,
  });
}

function pathFromLoc(repoPath, locValue) {
  let pathname = "";
  try {
    const parsed = new URL(locValue);
    pathname = parsed.pathname;
  } catch {
    pathname = locValue;
  }

  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }

  if (pathname === "/") {
    return path.join(repoPath, "index.html");
  }

  if (pathname.endsWith("/")) {
    return path.join(repoPath, pathname.slice(1), "index.html");
  }

  const relativePath = pathname.slice(1);
  const directPath = path.join(repoPath, relativePath);

  if (path.extname(relativePath)) {
    return directPath;
  }

  return path.join(repoPath, relativePath, "index.html");
}

export function runCheck(options = {}) {
  const resolvedOptions = {
    repoPath: path.resolve(options.repoPath ?? process.cwd()),
  };
  const report = baseReport();

  const indexPath = path.join(resolvedOptions.repoPath, "index.html");
  const robotsPath = path.join(resolvedOptions.repoPath, "robots.txt");
  const sitemapPath = path.join(resolvedOptions.repoPath, "sitemap.xml");

  const indexSource = readUtf8(indexPath, report);
  const robotsSource = readUtf8(robotsPath, report);
  const sitemapSource = readUtf8(sitemapPath, report);

  if (indexSource === null || robotsSource === null || sitemapSource === null) {
    report.ok = false;
    return report;
  }

  const requiredChecks = [
    {
      code: "SEO_CANONICAL_MISSING",
      regex: /<link[^>]+rel=["']canonical["'][^>]*>/i,
      message: "Missing canonical link tag.",
    },
    {
      code: "SEO_OG_IMAGE_MISSING",
      regex: /<meta[^>]+property=["']og:image["'][^>]*>/i,
      message: "Missing Open Graph image tag (og:image).",
    },
    {
      code: "SEO_TWITTER_CARD_MISSING",
      regex: /<meta[^>]+name=["']twitter:card["'][^>]*>/i,
      message: "Missing Twitter card tag.",
    },
    {
      code: "SEO_TWITTER_TITLE_MISSING",
      regex: /<meta[^>]+name=["']twitter:title["'][^>]*>/i,
      message: "Missing Twitter title tag.",
    },
    {
      code: "SEO_TWITTER_DESCRIPTION_MISSING",
      regex: /<meta[^>]+name=["']twitter:description["'][^>]*>/i,
      message: "Missing Twitter description tag.",
    },
    {
      code: "SEO_TWITTER_IMAGE_MISSING",
      regex: /<meta[^>]+name=["']twitter:image["'][^>]*>/i,
      message: "Missing Twitter image tag.",
    },
  ];

  for (const check of requiredChecks) {
    if (!check.regex.test(indexSource)) {
      addMissingTagError(report, check.code, check.message);
    }
  }

  const sitemapLineMatch = robotsSource.match(/^Sitemap:\s*(\S+)/im);
  if (!sitemapLineMatch) {
    report.errors.push({
      code: "ROBOTS_SITEMAP_LINE_MISSING",
      file: "robots.txt",
      message: "robots.txt does not include a Sitemap declaration line.",
    });
  }

  const locRegex = /<loc>([^<]+)<\/loc>/g;
  const locValues = [];
  let locMatch = locRegex.exec(sitemapSource);
  while (locMatch) {
    locValues.push(locMatch[1].trim());
    locMatch = locRegex.exec(sitemapSource);
  }

  if (locValues.length === 0) {
    report.errors.push({
      code: "SITEMAP_NO_LOC_ENTRIES",
      file: "sitemap.xml",
      message: "No <loc> entries were found in sitemap.xml.",
    });
  }

  let missingLocTargetCount = 0;
  for (const locValue of locValues) {
    const expectedFilePath = pathFromLoc(resolvedOptions.repoPath, locValue);
    if (!fs.existsSync(expectedFilePath)) {
      missingLocTargetCount += 1;
      report.errors.push({
        code: "SITEMAP_TARGET_MISSING",
        file: "sitemap.xml",
        message: `Sitemap URL has no matching file: ${locValue} -> ${path.relative(
          resolvedOptions.repoPath,
          expectedFilePath
        )}`,
      });
    }
  }

  report.stats = {
    sitemapLocCount: locValues.length,
    sitemapMissingTargetCount: missingLocTargetCount,
    seoErrorCount: report.errors.filter((entry) =>
      entry.code.startsWith("SEO_")
    ).length,
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
