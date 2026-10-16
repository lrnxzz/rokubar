package servicer

import (
	"context"
	"iter"

	"github.com/lrnxzz/rokubar/live"
	"github.com/lrnxzz/rokubar/roku"
	"github.com/lrnxzz/rokubar/server/api"
)

type TelevisionServicer interface {
	Television() api.Television
	Watch(ctx context.Context) iter.Seq[api.Television]
	Search(ctx context.Context) ([]api.Television, error)
	Pair(serial string) error
	Forget() error

	PressKey(ctx context.Context, key roku.Key) error
	TypeText(ctx context.Context, text string) error
	SetVolume(ctx context.Context, level int) error
	TurnOn(ctx context.Context) error
	TurnOff(ctx context.Context) error

	ListApps(ctx context.Context) ([]api.App, error)
	LaunchApp(ctx context.Context, appId string) error
	GetAppIcon(ctx context.Context, appId string) (roku.Icon, error)
}

type televisionServicer struct {
	connection live.Connection
}

func NewTelevisionServicer(connection live.Connection) TelevisionServicer {
	return &televisionServicer{
		connection: connection,
	}
}

// command sends to the paired TV and asks for its state again, so the panel shows the effect at once.
func (s *televisionServicer) command(send func(client roku.Client) error) error {
	client, err := s.connection.Client()
	if err != nil {
		return err
	}

	defer s.connection.Refresh()

	return send(client)
}
