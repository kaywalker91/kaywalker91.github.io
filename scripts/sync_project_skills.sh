#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_ROOT="${REPO_ROOT}/skills"
DEST_ROOT="${CODEX_HOME:-${HOME}/.codex}/skills"

SKILLS=(
  "portfolio-quality-gate"
  "portfolio-content-sync"
)

mkdir -p "${DEST_ROOT}"

for skill in "${SKILLS[@]}"; do
  src="${SOURCE_ROOT}/${skill}"
  dst="${DEST_ROOT}/${skill}"

  if [[ ! -d "${src}" ]]; then
    echo "[ERROR] Missing source skill directory: ${src}" >&2
    exit 1
  fi

  mkdir -p "${dst}"

  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete "${src}/" "${dst}/"
  else
    cp -R "${src}/." "${dst}/"
  fi

  echo "[SYNCED] ${skill} -> ${dst}"
done

echo "[DONE] Project skills synchronized."
echo "Restart Codex to pick up new or updated skills."
