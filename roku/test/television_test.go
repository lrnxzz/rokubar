package test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/lrnxzz/rokubar/roku"
)

func Test_Device_DeclaresItsControlMode(t *testing.T) {
	client, ctx := RequireDevice(t)

	info, err := client.Device().Info(ctx)
	if err != nil {
		t.Fatalf("Failed to get device info: %v", err)
	}

	if info.ControlMode != roku.ControlModeEnabled && info.ControlMode != roku.ControlModeLimited {
		t.Errorf("Expected an enabled or limited control mode, got %q", info.ControlMode)
	}
}

func Test_Device_HomeIsAnAppOfTypeHome(t *testing.T) {
	client, ctx := RequireDevice(t)
	requireControl(t, client.Keys().Press(ctx, roku.KeyHome))

	deadline := time.Now().Add(5 * time.Second)

	for {
		active, err := client.Apps().Active(ctx)
		if err != nil {
			t.Fatalf("Failed to get the active app: %v", err)
		}

		if active.IsHome() {
			return
		}

		if time.Now().After(deadline) {
			t.Fatalf("Expected the home screen after Home, got %+v", active.App)
		}

		time.Sleep(200 * time.Millisecond)
	}
}

func Test_Device_LiteralKeysTravelEscaped(t *testing.T) {
	client, ctx := RequireDevice(t)

	chars := []rune{
		'/',
		'é',
	}

	for _, char := range chars {
		requireControl(t, client.Keys().Press(ctx, roku.LiteralKey(char)))
	}
}

func Test_Device_VolumeKeys(t *testing.T) {
	client, ctx := RequireDevice(t)

	keys := []roku.Key{
		roku.KeyVolumeUp,
		roku.KeyVolumeDown,
	}

	for _, key := range keys {
		requireControl(t, client.Keys().Press(ctx, key))
	}
}

func Test_Device_SetVolumeStepsToTheLevel(t *testing.T) {
	client, ctx := RequireDevice(t)

	before, err := client.Audio().Volume(ctx)
	requireControl(t, err)

	target := before.Volume + 3
	if target > 100 {
		target = before.Volume - 3
	}

	t.Cleanup(func() {
		if err := client.Audio().SetVolume(context.WithoutCancel(ctx), before.Volume); err != nil {
			t.Errorf("Failed to put the volume back to %d: %v", before.Volume, err)
		}
	})

	requireControl(t, client.Audio().SetVolume(ctx, target))

	after, err := client.Audio().Volume(ctx)
	if err != nil {
		t.Fatalf("Failed to read the volume: %v", err)
	}

	if after.Volume != target || after.Muted {
		t.Errorf("Expected volume %d unmuted, got %+v", target, after)
	}
}

func Test_Device_MediaPlayerAndChannelsAnswer(t *testing.T) {
	client, ctx := RequireDevice(t)

	player, err := client.Device().MediaPlayer(ctx)
	requireControl(t, err)

	if player.State == "" {
		t.Errorf("Expected a player state, got %+v", player)
	}

	_, err = client.Tv().Channels(ctx)
	requireControl(t, err)
}

func requireControl(t *testing.T, err error) {
	t.Helper()

	if errors.Is(err, roku.ErrControlDisabled) {
		t.Skipf("Skipping: the TV refuses control, set Control by mobile apps to Enabled (%v)", err)
	}

	if err != nil {
		t.Fatalf("Expected the TV to accept the request, got %v", err)
	}
}
