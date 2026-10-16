#!/usr/bin/env bash
# Lints the panel with Biome and builds it, then lints the Go code for Windows, whose tray embeds that build.
set -euo pipefail

cd "$(dirname "$0")/.."

# roku and live are modules of their own, so without a go.work of your own the app builds against these
# folders through one.
if [[ ! -f go.work ]]; then
	go work init . ./roku ./live
fi

(cd tray/frontend && npx biome ci . && npm run build)

GOOS=windows golangci-lint run ./... ./roku/... ./live/...
