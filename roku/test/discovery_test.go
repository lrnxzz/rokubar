package test

import (
	"bytes"
	"net/netip"
	"slices"
	"testing"

	"github.com/lrnxzz/rokubar/roku"
)

func Test_Integration_Discover_FindsTheDevice(t *testing.T) {
	client, container, address := startBrsNode(t)
	host := netip.AddrPortFrom(address, 8060).String()

	devices, err := roku.Discover(t.Context())
	if err != nil {
		t.Fatalf("Failed to discover: %v", err)
	}

	index := slices.IndexFunc(devices, func(device roku.Device) bool {
		return device.Host == host
	})
	if index < 0 {
		t.Fatalf("Expected the device at %s among %+v", host, devices)
	}

	info, err := client.Device().Info(t.Context())
	if err != nil {
		t.Fatalf("Failed to get device info: %v", err)
	}

	if found := devices[index]; found.Serial != info.SerialNumber || !bytes.Equal(found.Mac, BrsNodeMac(t, container)) {
		t.Errorf("Expected serial %q and the MAC of the container, got %+v", info.SerialNumber, found)
	}
}
