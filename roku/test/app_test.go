package test

import (
	"slices"
	"testing"

	"github.com/lrnxzz/rokubar/roku"
)

func Test_Integration_GetApps_ListsTheRunningChannel(t *testing.T) {
	client, _, _ := startBrsNode(t)

	apps, err := client.Apps().List(t.Context())
	if err != nil {
		t.Fatalf("Failed to get apps: %v", err)
	}

	listed := slices.ContainsFunc(apps, func(app roku.App) bool {
		return app.Id == "dev" && app.Type == roku.AppTypeApplication && app.Name != ""
	})

	if !listed {
		t.Errorf("Expected the side-loaded channel among the apps, got %+v", apps)
	}
}

func Test_Integration_GetActiveApp_NamesTheForegroundApp(t *testing.T) {
	client, _, _ := startBrsNode(t)

	active, err := client.Apps().Active(t.Context())
	if err != nil {
		t.Fatalf("Failed to get the active app: %v", err)
	}

	if active.App.Name == "" || active.Screensaver != nil {
		t.Errorf("Expected a named app without screensaver, got %+v", active)
	}
}

func Test_Integration_LaunchApp_DeepLinksIntoAChannel(t *testing.T) {
	client, _, _ := startBrsNode(t)

	request := roku.LaunchRequest{
		AppId:     "dev",
		ContentId: "tt1",
		MediaType: roku.MediaTypeMovie,
		Params: map[string]string{
			"profile": "kids",
		},
	}

	if err := client.Apps().Launch(t.Context(), request); err != nil {
		t.Errorf("Failed to launch the channel: %v", err)
	}
}
