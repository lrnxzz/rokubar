package transporter

import (
	"github.com/gofiber/fiber/v2"

	"github.com/lrnxzz/rokubar/server/internal/servicer"
)

type TelevisionTransporter interface {
	Initialize(app *fiber.App)

	Television(c *fiber.Ctx) error
	Search(c *fiber.Ctx) error
	Pair(c *fiber.Ctx) error
	Forget(c *fiber.Ctx) error

	PressKey(c *fiber.Ctx) error
	TypeText(c *fiber.Ctx) error
	SetVolume(c *fiber.Ctx) error
	TurnOn(c *fiber.Ctx) error
	TurnOff(c *fiber.Ctx) error

	ListApps(c *fiber.Ctx) error
	LaunchApp(c *fiber.Ctx) error
	GetAppIcon(c *fiber.Ctx) error
}

type televisionTransporter struct {
	servicer servicer.TelevisionServicer
}

func NewTelevisionTransporter(television servicer.TelevisionServicer) TelevisionTransporter {
	return televisionTransporter{
		servicer: television,
	}
}

func (t televisionTransporter) Initialize(app *fiber.App) {
	v1 := app.Group("/v1")
	{
		v1.Get("/televisions", t.Search)
		v1.Post("/televisions/:serial/pair", t.Pair)

		television := v1.Group("/television")
		{
			television.Get("/", t.Television)
			television.Delete("/", t.Forget)

			television.Post("/keys/:key", t.paired, t.PressKey)
			television.Post("/text", t.paired, t.TypeText)
			television.Put("/volume", t.paired, t.SetVolume)
			television.Post("/power/on", t.paired, t.TurnOn)
			television.Post("/power/off", t.paired, t.TurnOff)

			television.Get("/apps", t.paired, t.ListApps)
			television.Post("/apps/:id/launch", t.paired, t.LaunchApp)
			television.Get("/apps/:id/icon", t.paired, t.GetAppIcon)
		}
	}
}
