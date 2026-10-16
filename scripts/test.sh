#!/usr/bin/env bash
# Runs the panel's tests and the Go tests, whose integration tests start brs-node in Docker one package at a
# time, since every container answers with the same serial. The tray only builds for Windows and is left out.
set -euo pipefail

cd "$(dirname "$0")/.."

# roku and live are modules of their own, so without a go.work of your own the app builds against these
# folders through one.
if [[ ! -f go.work ]]; then
	go work init . ./roku ./live
fi

profile="${COVERAGE_PROFILE:-coverage.out}"
packages=(./roku/... ./live/... ./server/...)

(cd tray/frontend && npx vitest run)

go test -race -count=1 -p 1 -timeout=15m -covermode=atomic -coverpkg="$(IFS=,; echo "${packages[*]}")" \
	-coverprofile="$profile" "${packages[@]}"
