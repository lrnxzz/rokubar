package live

import (
	"context"
	"sync"

	"github.com/lrnxzz/rokubar/roku"
)

type link struct {
	device roku.Device
	client roku.Client
}

func newLink(device roku.Device) (*link, error) {
	client, err := roku.NewClient(device.Config())
	if err != nil {
		return nil, err
	}

	return &link{
		device: device,
		client: client,
	}, nil
}

func (l *link) is(device roku.Device) bool {
	return device.Serial == l.device.Serial
}

func (l *link) moveTo(device roku.Device) (*link, error) {
	if device.Mac == nil {
		device.Mac = l.device.Mac
	}

	return newLink(device)
}

func (l *link) describe(ctx context.Context) State {
	info, err := l.client.Device().Info(ctx)
	if err != nil {
		return State{
			Device: l.device,
		}
	}

	state := State{
		Device:    l.device,
		Reachable: true,
		Info:      info,
	}

	if info.PowerMode.IsOn() {
		var queries sync.WaitGroup

		queries.Go(func() {
			state.Active, _ = l.client.Apps().Active(ctx)
		})

		// Limited mode refuses media-player, and Player stays zero.
		queries.Go(func() {
			state.Player, _ = l.client.Device().MediaPlayer(ctx)
		})

		queries.Go(func() {
			state.Audio, _ = l.client.Audio().Volume(ctx)
		})

		queries.Wait()
	}

	return state
}
