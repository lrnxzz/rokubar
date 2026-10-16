package main

import (
	"flag"
	"log"

	"github.com/lrnxzz/rokubar/tray"
)

func main() {
	show := flag.Bool("show", false, "Open the panel as soon as Rokubar starts, and keep it open")
	page := flag.String("page", "tv", "The page the panel opens on: tv, remote, apps or settings")
	flag.Parse()

	err := tray.Run(tray.Config{
		Show: *show,
		Page: *page,
	})
	if err != nil {
		log.Fatal(err)
	}
}
