package live

import (
	"context"
	"errors"
	"io/fs"
	"sync"
	"testing"
	"time"

	"github.com/lrnxzz/rokubar/roku"
)

type memory struct {
	mu     sync.Mutex
	device roku.Device
}

func (m *memory) Load() (roku.Device, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.device.Serial == "" {
		return roku.Device{}, fs.ErrNotExist
	}

	return m.device, nil
}

func (m *memory) Save(device roku.Device) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.device = device

	return nil
}

func (m *memory) Clear() error {
	return m.Save(roku.Device{})
}

func Test_Config_Validate(t *testing.T) {
	if err := (Config{}).Validate(); err == nil {
		t.Error("Expected a config without store to be refused")
	}
}

func Test_Connection_StartsUnpairedWithNothingRemembered(t *testing.T) {
	connection, err := Connect(Config{
		Store: &memory{},
	})
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer connection.Close()

	if state := connection.State(); state.Paired() {
		t.Errorf("Expected no TV paired, got %+v", state)
	}

	if _, err := connection.Client(); !errors.Is(err, ErrNotPaired) {
		t.Errorf("Expected ErrNotPaired from Client, got %v", err)
	}

	if err := connection.Pair("X04000AJS65H"); !errors.Is(err, ErrNotFound) {
		t.Errorf("Expected ErrNotFound pairing a TV no search found, got %v", err)
	}
}

func Test_Connection_ResumesTheRememberedTv(t *testing.T) {
	connection, err := Connect(Config{
		Store: &memory{
			device: roku.Device{
				Serial: "X04000AJS65H",
				Host:   "127.0.0.1:1",
			},
		},
	})
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer connection.Close()

	if state := connection.State(); state.Device.Serial != "X04000AJS65H" || !state.Connecting {
		t.Errorf("Expected X04000AJS65H connecting, got %+v", state)
	}

	ctx, cancel := context.WithTimeout(t.Context(), 15*time.Second)
	defer cancel()

	for state := range connection.Watch(ctx) {
		if state.Connecting {
			continue
		}

		if state.Reachable || state.Device.Host != "127.0.0.1:1" {
			t.Errorf("Expected 127.0.0.1:1 unreachable, got %+v", state)
		}

		return
	}

	t.Fatal("Expected the TV to be asked before the timeout")
}

func Test_Connection_ForgetsTheTv(t *testing.T) {
	store := &memory{
		device: roku.Device{
			Serial: "X04000AJS65H",
			Host:   "127.0.0.1:1",
		},
	}

	connection, err := Connect(Config{
		Store: store,
	})
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer connection.Close()

	if err := connection.Forget(); err != nil {
		t.Fatalf("Failed to forget: %v", err)
	}

	if state := connection.State(); state.Paired() {
		t.Errorf("Expected no TV paired after Forget, got %+v", state)
	}

	if device, err := store.Load(); err == nil {
		t.Errorf("Expected the store cleared, got %+v", device)
	}

	if err := connection.Forget(); err != nil {
		t.Errorf("Expected forgetting again to do nothing, got %v", err)
	}
}

func Test_Connection_WatchEndsWhenTheConnectionCloses(t *testing.T) {
	connection, err := Connect(Config{
		Store: &memory{},
	})
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}

	ctx, cancel := context.WithTimeout(t.Context(), 5*time.Second)
	defer cancel()

	time.AfterFunc(100*time.Millisecond, func() {
		if err := connection.Close(); err != nil {
			t.Errorf("Failed to close: %v", err)
		}
	})

	for range connection.Watch(ctx) {
	}

	if ctx.Err() != nil {
		t.Fatal("Expected the watch to end when the connection closed, not at the timeout")
	}

	if err := connection.Close(); err != nil {
		t.Errorf("Expected closing again to do nothing, got %v", err)
	}
}
