package test

import (
	"bufio"
	"context"
	"flag"
	"net"
	"net/netip"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
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

	bridgeNetwork = "bridge"

	keyLinePrefix = "key "
	wakeLine      = "wake"
	keyWait       = 5 * time.Second
	keyPoll       = 100 * time.Millisecond

	hostVariable   = "ROKU_HOST"
	macVariable    = "ROKU_MAC"
	serialVariable = "ROKU_SERIAL"
	dotenvName     = ".env"
	deviceTimeout  = 30 * time.Second
)

var tryDevice = flag.Bool("try-device", false, "Run the tests that need the Roku TV at ROKU_HOST")

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

func BrsNodeMac(t *testing.T, container *testcontainers.DockerContainer) net.HardwareAddr {
	t.Helper()

	inspect, err := container.Inspect(t.Context())
	if err != nil {
		t.Fatalf("Failed to inspect brs-node container: %v", err)
	}

	return net.HardwareAddr(inspect.NetworkSettings.Networks[bridgeNetwork].MacAddress)
}

func PressedKeys(t *testing.T, container *testcontainers.DockerContainer) ([]int, error) {
	logs, err := container.Logs(t.Context())
	if err != nil {
		return nil, err
	}
	defer logs.Close()

	keys := make([]int, 0)
	scanner := bufio.NewScanner(logs)

	for scanner.Scan() {
		value, ok := strings.CutPrefix(strings.TrimSpace(scanner.Text()), keyLinePrefix)
		if !ok {
			continue
		}

		key, err := strconv.Atoi(strings.TrimSpace(value))
		if err != nil {
			return nil, err
		}

		keys = append(keys, key)
	}

	return keys, scanner.Err()
}

func ExpectKeys(t *testing.T, container *testcontainers.DockerContainer, expected ...int) {
	t.Helper()

	deadline := time.Now().Add(keyWait)
	slices.Sort(expected)

	for {
		keys, err := PressedKeys(t, container)
		if err != nil {
			t.Fatalf("Failed to read the keys the channel received: %v", err)
		}

		slices.Sort(keys)

		if slices.Equal(keys, expected) {
			return
		}

		if time.Now().After(deadline) {
			t.Fatalf("Expected the channel to receive keys %v, got %v", expected, keys)
		}

		time.Sleep(keyPoll)
	}
}

func ExpectWakes(t *testing.T, container *testcontainers.DockerContainer, expected int) {
	t.Helper()

	deadline := time.Now().Add(keyWait)

	for {
		logs, err := container.Logs(t.Context())
		if err != nil {
			t.Fatalf("Failed to read the magic packets the container received: %v", err)
		}

		wakes := 0
		scanner := bufio.NewScanner(logs)

		for scanner.Scan() {
			if strings.TrimSpace(scanner.Text()) == wakeLine {
				wakes++
			}
		}

		logs.Close()

		if err := scanner.Err(); err != nil {
			t.Fatalf("Failed to read the magic packets the container received: %v", err)
		}

		if wakes == expected {
			return
		}

		if time.Now().After(deadline) {
			t.Fatalf("Expected the container to receive %d magic packets, got %d", expected, wakes)
		}

		time.Sleep(keyPoll)
	}
}

func RequireDevice(t *testing.T) (roku.Client, context.Context) {
	t.Helper()

	if !*tryDevice {
		t.Skip("Skipping test that needs the Roku TV; run it with -try-device")
	}

	readDotenv(t)

	host := os.Getenv(hostVariable)
	if host == "" {
		t.Fatalf("Expected %s to name the Roku TV", hostVariable)
	}

	client, err := roku.NewClient(roku.Config{
		Host: host,
	})
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	ctx, cancel := context.WithTimeout(t.Context(), deviceTimeout)
	t.Cleanup(cancel)

	return client, ctx
}

func readDotenv(t *testing.T) {
	t.Helper()

	directory, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to find the working directory: %v", err)
	}

	for {
		data, err := os.ReadFile(filepath.Join(directory, dotenvName))
		if err == nil {
			for line := range strings.Lines(string(data)) {
				key, value, ok := strings.Cut(strings.TrimSpace(line), "=")
				if ok && !strings.HasPrefix(key, "#") && os.Getenv(key) == "" {
					t.Setenv(strings.TrimSpace(key), strings.TrimSpace(value))
				}
			}

			return
		}

		parent := filepath.Dir(directory)
		if parent == directory {
			return
		}

		directory = parent
	}
}

func startBrsNode(t *testing.T) (roku.Client, *testcontainers.DockerContainer, netip.Addr) {
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

	client, err := roku.NewClient(roku.Config{
		Host: address.String(),
	})
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	return client, container, address
}
