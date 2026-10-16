# live

[![test](https://img.shields.io/github/actions/workflow/status/lrnxzz/rokubar/test.yml?branch=main&label=test)](https://github.com/lrnxzz/rokubar/actions/workflows/test.yml)
[![Go Reference](https://pkg.go.dev/badge/github.com/lrnxzz/rokubar/live.svg)](https://pkg.go.dev/github.com/lrnxzz/rokubar/live)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Keep a real, stable connection to a Roku TV from any Go application. Built on [`roku`](../roku), it
remembers the paired TV, polls its state and follows it when it comes back from standby on another
address. It is application-agnostic: the application decides where the TV is stored and what to do with
each state.

Tested against [brs-node](https://github.com/lvcabral/brs-engine) in Docker and a real `AOC 43S5155`
running Roku OS 15.3.4.
