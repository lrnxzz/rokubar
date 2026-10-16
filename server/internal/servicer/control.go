package servicer

import (
	"context"

	"github.com/lrnxzz/rokubar/roku"
)

func (s *televisionServicer) PressKey(ctx context.Context, key roku.Key) error {
	return s.command(func(client roku.Client) error {
		return client.Keys().Press(ctx, key)
	})
}

func (s *televisionServicer) TypeText(ctx context.Context, text string) error {
	return s.command(func(client roku.Client) error {
		return client.Keys().Type(ctx, text)
	})
}

func (s *televisionServicer) SetVolume(ctx context.Context, level int) error {
	return s.command(func(client roku.Client) error {
		return client.Audio().SetVolume(ctx, level)
	})
}

func (s *televisionServicer) TurnOn(ctx context.Context) error {
	return s.connection.TurnOn(ctx)
}

func (s *televisionServicer) TurnOff(ctx context.Context) error {
	return s.PressKey(ctx, roku.KeyPowerOff)
}
