package transporter

import (
	"context"

	"github.com/lrnxzz/rokubar/server/internal/servicer"
)

// Emitter sends an event to the panel, like Wails' app.Event.
type Emitter interface {
	Emit(name string, data ...any) bool
}

type EventTransporter interface {
	// Publish sends the television as the "state" event on every change, until ctx ends or the connection
	// closes.
	Publish(ctx context.Context, emitter Emitter)
}

type eventTransporter struct {
	servicer servicer.TelevisionServicer
}

func NewEventTransporter(television servicer.TelevisionServicer) EventTransporter {
	return eventTransporter{
		servicer: television,
	}
}

func (t eventTransporter) Publish(ctx context.Context, emitter Emitter) {
	for television := range t.servicer.Watch(ctx) {
		emitter.Emit("state", television)
	}
}
