package test

import (
	"context"
	"slices"
	"testing"
	"time"

	"github.com/lrnxzz/rokubar/live"
	"github.com/lrnxzz/rokubar/roku"
)

func Test_Integration_Connection_PairsATvFromASearch(t *testing.T) {
	device, info := startBrsNode(t)

	connection, err := live.Connect(live.Config{
		Store: &memory{},
	})
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer connection.Close()

	found, err := connection.Search(t.Context())
	if err != nil {
		t.Fatalf("Failed to search: %v", err)
	}

	index := slices.IndexFunc(found, func(state live.State) bool {
		return state.Device.Serial == device.Serial
	})
	if index < 0 {
		t.Fatalf("Expected %s among %+v", device.Serial, found)
	}

	if found[index].Info.SerialNumber != info.SerialNumber {
		t.Errorf("Expected the search to describe %s, got %+v", info.SerialNumber, found[index])
	}

	if err := connection.Pair(device.Serial); err != nil {
		t.Fatalf("Failed to pair: %v", err)
	}

	ctx, cancel := context.WithTimeout(t.Context(), 10*time.Second)
	defer cancel()

	for state := range connection.Watch(ctx) {
		if !state.Reachable {
			continue
		}

		if state.Info.SerialNumber != info.SerialNumber || state.Active.App.Name == "" {
			t.Errorf("Expected device %s with its foreground app, got %+v", info.SerialNumber, state)
		}

		if state.Audio != (roku.Audio{}) {
			t.Errorf("Expected no audio from brs-node, which has no audio-device, got %+v", state.Audio)
		}

		return
	}

	t.Fatal("Expected the paired TV to answer before the timeout")
}

func Test_Integration_Connection_RemembersThePairedTv(t *testing.T) {
	device, _ := startBrsNode(t)
	store := &memory{}

	first, err := live.Connect(live.Config{
		Store: store,
	})
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}

	if _, err := first.Search(t.Context()); err != nil {
		t.Fatalf("Failed to search: %v", err)
	}

	if err := first.Pair(device.Serial); err != nil {
		t.Fatalf("Failed to pair: %v", err)
	}

	if err := first.Close(); err != nil {
		t.Fatalf("Failed to close: %v", err)
	}

	second, err := live.Connect(live.Config{
		Store: store,
	})
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer second.Close()

	if state := second.State(); state.Device.Serial != device.Serial || state.Device.Host != device.Host {
		t.Errorf("Expected %s at %s remembered, got %+v", device.Serial, device.Host, state.Device)
	}
}

func Test_Integration_Connection_FollowsTheTvToItsNewAddress(t *testing.T) {
	device, _ := startBrsNode(t)

	store := &memory{
		device: roku.Device{
			Serial: device.Serial,
			Host:   "127.0.0.1:1",
		},
	}

	connection, err := live.Connect(live.Config{
		Store: store,
	})
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer connection.Close()

	ctx, cancel := context.WithTimeout(t.Context(), 30*time.Second)
	defer cancel()

	for state := range connection.Watch(ctx) {
		if !state.Reachable || state.Device.Host != device.Host {
			continue
		}

		if saved, _ := store.Load(); saved.Host != device.Host {
			t.Errorf("Expected %s saved at %s, got %+v", device.Serial, device.Host, saved)
		}

		return
	}

	t.Fatalf("Expected the connection to find %s at %s before the timeout, got %+v", device.Serial, device.Host, connection.State())
}
