# roku

[![test](https://img.shields.io/github/actions/workflow/status/lrnxzz/rokubar/test.yml?branch=main&label=test)](https://github.com/lrnxzz/rokubar/actions/workflows/test.yml)
[![Go Reference](https://pkg.go.dev/badge/github.com/lrnxzz/rokubar/roku.svg)](https://pkg.go.dev/github.com/lrnxzz/rokubar/roku)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Control Roku TVs and players from Go over the
[External Control Protocol](https://developer.roku.com/docs/developer-program/dev-tools/external-control-api.md).
The package finds them on the network with [go-ssdp](https://github.com/lrnxzz/go-ssdp), reads what they
are showing and sends anything a remote can, from keys and text to apps, volume and power.

Tested against [brs-node](https://github.com/lvcabral/brs-engine) in Docker and a real `AOC 43S5155`
running Roku OS 15.3.4.
