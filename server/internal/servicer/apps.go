package servicer

import (
	"context"

	"github.com/lrnxzz/rokubar/roku"
	"github.com/lrnxzz/rokubar/server/api"
)

func (s *televisionServicer) ListApps(ctx context.Context) ([]api.App, error) {
	client, err := s.connection.Client()
	if err != nil {
		return nil, err
	}

	listed, err := client.Apps().List(ctx)
	if err != nil {
		return nil, err
	}

	apps := make([]api.App, 0, len(listed))

	for _, app := range listed {
		apps = append(apps, newApp(app))
	}

	return apps, nil
}

func (s *televisionServicer) LaunchApp(ctx context.Context, appId string) error {
	return s.command(func(client roku.Client) error {
		return client.Apps().Launch(ctx, roku.LaunchRequest{
			AppId: appId,
		})
	})
}

func (s *televisionServicer) GetAppIcon(ctx context.Context, appId string) (roku.Icon, error) {
	client, err := s.connection.Client()
	if err != nil {
		return roku.Icon{}, err
	}

	return client.Apps().Icon(ctx, appId)
}
