package transporter

import (
	"github.com/gofiber/fiber/v2"

	api "github.com/lrnxzz/rokubar/server/api/http"
)

func (t televisionTransporter) ListApps(c *fiber.Ctx) error {
	apps, err := t.servicer.ListApps(c.UserContext())
	if err != nil {
		return err
	}

	return c.JSON(api.ListAppsResponse(apps))
}

func (t televisionTransporter) LaunchApp(c *fiber.Ctx) error {
	return t.servicer.LaunchApp(c.UserContext(), c.Params("id"))
}

func (t televisionTransporter) GetAppIcon(c *fiber.Ctx) error {
	icon, err := t.servicer.GetAppIcon(c.UserContext(), c.Params("id"))
	if err != nil {
		return err
	}

	c.Set(fiber.HeaderContentType, icon.ContentType)
	c.Set(fiber.HeaderCacheControl, "max-age=86400")

	return c.Send(icon.Data)
}
