package transporter

import (
	"github.com/gofiber/fiber/v2"

	api "github.com/lrnxzz/rokubar/server/api/http"
)

func (t televisionTransporter) Television(c *fiber.Ctx) error {
	return c.JSON(api.GetTelevisionResponse(t.servicer.Television()))
}

func (t televisionTransporter) Search(c *fiber.Ctx) error {
	televisions, err := t.servicer.Search(c.UserContext())
	if err != nil {
		return err
	}

	return c.JSON(api.SearchTelevisionsResponse(televisions))
}

func (t televisionTransporter) Pair(c *fiber.Ctx) error {
	return t.servicer.Pair(c.Params("serial"))
}

func (t televisionTransporter) Forget(c *fiber.Ctx) error {
	return t.servicer.Forget()
}
