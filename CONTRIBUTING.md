# Contributing

You need Go at the version in [`go.mod`](go.mod), Node.js with npm for the panel, Docker for the
integration tests and [golangci-lint](https://golangci-lint.run) v2. Rokubar runs on Windows but builds
from Linux and WSL as well. Install the panel's dependencies once with `npm ci` in
[`tray/frontend`](tray/frontend).

Changes reach `main` through pull requests from short-lived branches. Commit messages follow
[Conventional Commits](https://www.conventionalcommits.org), which GoReleaser turns into the changelog
when a `vX.Y.Z` tag is pushed, and the release carries `rokubar.exe`.

## Modules

The repository holds three Go modules: the app at the root, and [`roku`](roku) and [`live`](live), which
other programs can use on their own. They require each other at released versions and never through a
`replace`, and a `go.work` at the root builds them against the local folders, changes not released yet
included. It is ignored by git, and the scripts create one when there is none.

`roku` and `live` are released by pushing `roku/vX.Y.Z` and `live/vX.Y.Z` tags, in that order, since
`live` requires `roku`, and the app comes last. After a module is tagged, `go mod tidy` in the modules
that require it records its checksum.

## Checks

The CI runs the same scripts you can run locally:

```sh
scripts/lint.sh
scripts/test.sh
```

`scripts/build.sh` builds the panel and `bin/rokubar.exe`. `scripts/coverage.sh` shows what the tests
leave uncovered, and the CI fails below the threshold in [`.testcoverage.yml`](.testcoverage.yml).

## Tests

Unit tests sit next to the code and cover pure logic. Integration tests live in [`roku/test`](roku/test),
[`live/test`](live/test) and [`server/test`](server/test): every run starts brs-node, a Roku simulator
built from [`scripts/containers/brs-node`](scripts/containers/brs-node), in Docker, and nothing recorded
or faked stands in for it. Every container answers with the same serial, so the packages run one at a
time.

The tests in `roku/test` that need a real Roku TV are skipped unless `-try-device` is passed. They read
the TV from `ROKU_HOST`, `ROKU_MAC` and `ROKU_SERIAL`, in the environment or in a `.env` file at the
root. Wake-on-LAN broadcasts don't leave WSL, so the power tests have to run from Windows.

The panel's tests run with Vitest. Its TypeScript types for the API are generated from the Go types in
[`server/api`](server/api) with `npm run types`.

## Code style

Go code is formatted with gofumpt and goimports and has to pass the linter.

Types are built with `NewX()` constructors, and behavior is exposed as an interface backed by an
unexported struct, the way `roku.NewClient()` returns a `Client`. Names are whole words, with acronyms
written as words too, like `Tv` and `BaseUrl`. Composite literals that hold anything put one element per
line, types are always declared at package level, and code lives where it is used instead of in small
helpers. Logs go through the configured `*slog.Logger`, with the message and attribute keys written out
at each call.

Comments are two lines at most, without semicolons, and explain a decision taken from the protocol or
from how a real TV behaves. Code that reads plainly gets no comment, and tests get none. Only the
reusable packages, `roku` and `live`, document their use, on the exported names and in their `doc.go`.

The panel is React with the React Compiler, TypeScript and CSS Modules, linted and formatted by Biome.
