package transporter

import (
	"github.com/gofiber/fiber/v2"

	"github.com/lrnxzz/rokubar/live"
)

func (t televisionTransporter) paired(c *fiber.Ctx) error {
	if !t.servicer.Television().Paired {
		return fiber.NewError(fiber.StatusConflict, live.ErrNotPaired.Error())
	}

	return c.Next()
}
