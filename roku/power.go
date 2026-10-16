package roku

import (
	"context"
	"errors"
	"fmt"

	"github.com/lrnxzz/rokubar/roku/internal/wol"
)

// TurnOn turns a Roku TV on and returns it where it answers, which may be a new address. A TV in deep
// standby is woken with Wake-on-LAN at device.Mac and searched for until it answers or ctx ends.
func TurnOn(ctx context.Context, device Device) (Device, error) {
	client, err := NewClient(device.Config())
	if err != nil {
		return Device{}, err
	}

	if err := client.Keys().Press(ctx, KeyPowerOn); !errors.Is(err, ErrUnreachable) {
		return device, err
	}

	for ctx.Err() == nil {
		if err := wol.Send(device.Mac); err != nil {
			return Device{}, err
		}

		devices, err := Discover(ctx)
		if err != nil && ctx.Err() == nil {
			return Device{}, err
		}

		for _, found := range devices {
			if found.Serial != device.Serial {
				continue
			}

			if found.Mac == nil {
				found.Mac = device.Mac
			}

			client, err := NewClient(found.Config())
			if err != nil {
				return Device{}, err
			}

			return found, client.Keys().Press(ctx, KeyPowerOn)
		}
	}

	return Device{}, fmt.Errorf("%w: %s didn't come back after the magic packets: %w", ErrUnreachable, device.Serial, ctx.Err())
}
