package transporter

import (
	"github.com/gofiber/fiber/v2"

	"github.com/lrnxzz/rokubar/roku"
	api "github.com/lrnxzz/rokubar/server/api/http"
)

func (t televisionTransporter) PressKey(c *fiber.Ctx) error {
	return t.servicer.PressKey(c.UserContext(), roku.Key(c.Params("key")))
}

func (t televisionTransporter) TypeText(c *fiber.Ctx) error {
	var request api.TypeTextRequest
	if err := c.BodyParser(&request); err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, err.Error())
	}

	if err := request.Validate(); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return t.servicer.TypeText(c.UserContext(), request.Text)
}

func (t televisionTransporter) SetVolume(c *fiber.Ctx) error {
	var request api.SetVolumeRequest
	if err := c.BodyParser(&request); err != nil {
		return fiber.NewError(fiber.StatusUnprocessableEntity, err.Error())
	}

	if err := request.Validate(); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return t.servicer.SetVolume(c.UserContext(), request.Level)
}

func (t televisionTransporter) TurnOn(c *fiber.Ctx) error {
	return t.servicer.TurnOn(c.UserContext())
}

func (t televisionTransporter) TurnOff(c *fiber.Ctx) error {
	return t.servicer.TurnOff(c.UserContext())
}
