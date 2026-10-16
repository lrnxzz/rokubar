#!/usr/bin/env bash
# Builds the panel, the icon resource and bin/rokubar.exe, from Windows, Linux or WSL alike.
set -euo pipefail

cd "$(dirname "$0")/.."

(cd tray/frontend && npm run build)

go run github.com/tc-hib/go-winres@v0.3.3 simply --icon tray/icons/icon.ico --arch amd64 --manifest none

GOOS=windows GOARCH=amd64 go build -tags production -ldflags="-H windowsgui -s -w" -o bin/rokubar.exe .
