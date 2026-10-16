package test

import (
	"context"
	"io/fs"
	"net/netip"
	"sync"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"

	"github.com/lrnxzz/rokubar/roku"
)

const (
	brsNodeContext = "../../scripts/containers/brs-node"
	brsNodeRepo    = "rokubar/brs-node"
	brsNodeReady   = "ready"
	imageTag       = "test"
	startupTimeout = 60 * time.Second
)

func InitializeBrsNode(t *testing.T) (*testcontainers.DockerContainer, netip.Addr, error) {
	ctx := t.Context()

	container, err := testcontainers.Run(ctx, "",
		testcontainers.WithDockerfile(testcontainers.FromDockerfile{
			Context:   brsNodeContext,
			Repo:      brsNodeRepo,
			Tag:       imageTag,
			KeepImage: true,
		}),
		testcontainers.WithWaitStrategy(
			wait.ForLog(brsNodeReady).WithStartupTimeout(startupTimeout),
		),
	)
	if err != nil {
		return container, netip.Addr{}, err
	}

	address, err := container.ContainerIP(ctx)
	if err != nil {
		return container, netip.Addr{}, err
	}

	parsed, err := netip.ParseAddr(address)

	return container, parsed, err
}

func startBrsNode(t *testing.T) (roku.Device, roku.DeviceInfo) {
	t.Helper()

	container, address, err := InitializeBrsNode(t)
	if err != nil {
		t.Fatalf("Failed to initialize brs-node container: %v", err)
	}

	t.Cleanup(func() {
		if err := container.Terminate(context.Background()); err != nil {
			t.Errorf("Failed to terminate brs-node container: %v", err)
		}
	})

	device := roku.Device{
		Host: netip.AddrPortFrom(address, 8060).String(),
	}

	client, err := roku.NewClient(device.Config())
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	info, err := client.Device().Info(t.Context())
	if err != nil {
		t.Fatalf("Failed to get device info: %v", err)
	}

	device.Serial = info.SerialNumber

	return device, info
}

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
