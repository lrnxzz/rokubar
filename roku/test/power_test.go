package test

import (
	"context"
	"net"
	"net/netip"
	"os"
	"testing"
	"time"

	"github.com/lrnxzz/rokubar/roku"
)

func Test_Integration_TurnOn_SkipsTheWakeOfAnAnsweringDevice(t *testing.T) {
	client, container, _ := startBrsNode(t)

	device := roku.Device{
		Host: client.Config().Host,
		Mac:  BrsNodeMac(t, container),
	}

	turnedOn, err := roku.TurnOn(t.Context(), device)
	if err != nil {
		t.Fatalf("Failed to turn the device on: %v", err)
	}

	if turnedOn.Host != device.Host {
		t.Errorf("Expected the device to stay at %s, got %s", device.Host, turnedOn.Host)
	}

	ExpectWakes(t, container, 0)
}

func Test_Integration_TurnOn_FollowsTheDeviceToItsNewAddress(t *testing.T) {
	client, container, address := startBrsNode(t)

	info, err := client.Device().Info(t.Context())
	if err != nil {
		t.Fatalf("Failed to get device info: %v", err)
	}

	stale := roku.Device{
		Serial: info.SerialNumber,
		Host:   "127.0.0.1:1",
		Mac:    BrsNodeMac(t, container),
	}

	ctx, cancel := context.WithTimeout(t.Context(), 30*time.Second)
	defer cancel()

	turnedOn, err := roku.TurnOn(ctx, stale)
	if err != nil {
		t.Fatalf("Failed to turn the device on: %v", err)
	}

	if host := netip.AddrPortFrom(address, 8060).String(); turnedOn.Host != host {
		t.Errorf("Expected the device found again at %s, got %s", host, turnedOn.Host)
	}

	ExpectWakes(t, container, 1)
}

func Test_Device_TurnsOnFromStandby(t *testing.T) {
	client, _ := RequireDevice(t)

	mac, err := net.ParseMAC(os.Getenv(macVariable))
	if err != nil {
		t.Fatalf("Expected %s to hold the MAC the TV announces in WAKEUP: %v", macVariable, err)
	}

	device := roku.Device{
		Serial: os.Getenv(serialVariable),
		Host:   client.Config().Host,
		Mac:    mac,
	}

	ctx, cancel := context.WithTimeout(t.Context(), 2*time.Minute)
	defer cancel()

	device, err = roku.TurnOn(ctx, device)
	if err != nil {
		t.Fatalf("Failed to turn the TV on: %v", err)
	}

	client, err = roku.NewClient(device.Config())
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	info, err := client.Device().Info(ctx)
	if err != nil {
		t.Fatalf("Failed to get device info: %v", err)
	}

	if info.SerialNumber != device.Serial || !info.PowerMode.IsOn() {
		t.Errorf("Expected TV %s on, got %s in %s", device.Serial, info.SerialNumber, info.PowerMode)
	}
}
