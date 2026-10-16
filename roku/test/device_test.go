package test

import (
	"errors"
	"testing"

	"github.com/lrnxzz/rokubar/roku"
)

func Test_Integration_GetDeviceInfo_DescribesTheDevice(t *testing.T) {
	client, _, _ := startBrsNode(t)

	info, err := client.Device().Info(t.Context())
	if err != nil {
		t.Fatalf("Failed to get device info: %v", err)
	}

	if info.SerialNumber == "" || info.ModelName == "" || info.Name() == "" || info.SoftwareVersion == "" {
		t.Errorf("Expected a serial, model, name and software version, got %+v", info)
	}

	if !info.PowerMode.IsOn() {
		t.Errorf("Expected a running device to be on, got %s", info.PowerMode)
	}
}

func Test_Integration_MissingEndpointsAreNotFound(t *testing.T) {
	client, _, _ := startBrsNode(t)

	_, mediaPlayerErr := client.Device().MediaPlayer(t.Context())
	_, channelsErr := client.Tv().Channels(t.Context())
	_, audioErr := client.Audio().Volume(t.Context())

	failures := map[string]error{
		"media player": mediaPlayerErr,
		"channels":     channelsErr,
		"audio device": audioErr,
	}

	for endpoint, err := range failures {
		if !errors.Is(err, roku.ErrNotFound) {
			t.Errorf("Expected the %s query to be not found, got %v", endpoint, err)
		}
	}
}
