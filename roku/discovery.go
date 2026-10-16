package roku

import (
	"context"
	"net"
	"net/url"
	"strings"
	"time"

	"github.com/lrnxzz/go-ssdp/ssdp"
)

// A Roku answers an M-SEARCH for roku:ecp with "the URL for the device's external control services" in
// LOCATION and its serial number in USN, "uuid:roku:ecp:P0A070000007" (ECP documentation).
const (
	searchTarget = "roku:ecp"
	serialPrefix = "roku:ecp:"

	// The shortest MX UDA 1.1 §1.3.2 allows, which keeps a search to a second and a half.
	searchWait = time.Second
)

// DIAL's WAKEUP field, "MAC=f0:ed:51:de:0e:e1;Timeout=10" (Netflix dial-reference, server/quick_ssdp.c).
const (
	wakeUpHeader    = "WAKEUP"
	wakeUpMac       = "MAC"
	wakeUpSeparator = ";"
)

// Device is a Roku as the network announces it: Serial and Mac don't change, Host may.
type Device struct {
	Serial string
	Host   string

	// Mac is where Wake-on-LAN reaches the device, read from DIAL's WAKEUP in its answer, or nil without one.
	Mac net.HardwareAddr
}

// newDevice reads a Roku out of its answer, and reports false when the answer has no serial or ECP root.
func newDevice(response ssdp.SearchResponse) (Device, bool) {
	serial, ok := strings.CutPrefix(response.ServiceName.Uuid(), serialPrefix)
	if !ok || serial == "" {
		return Device{}, false
	}

	location, err := url.Parse(response.Location)
	if err != nil || location.Host == "" {
		return Device{}, false
	}

	return Device{
		Serial: serial,
		Host:   location.Host,
		Mac:    parseWakeUp(response.Extensions.Get(wakeUpHeader)),
	}, true
}

// Config returns the Config that reaches the device at Host.
func (d Device) Config() Config {
	return Config{
		Host: d.Host,
	}
}

// Discover searches the network with SSDP for a second and a half and returns every Roku that answered.
// A Roku in deep standby doesn't answer.
func Discover(ctx context.Context) ([]Device, error) {
	devices := make([]Device, 0)

	for response, err := range ssdp.Search(ctx, searchTarget, searchWait) {
		if err != nil {
			return devices, err
		}

		if device, ok := newDevice(response); ok {
			devices = append(devices, device)
		}
	}

	return devices, nil
}

// parseWakeUp reads the MAC of a WAKEUP field, nil when it carries none.
func parseWakeUp(field string) net.HardwareAddr {
	for parameter := range strings.SplitSeq(field, wakeUpSeparator) {
		name, value, _ := strings.Cut(strings.TrimSpace(parameter), "=")
		if name != wakeUpMac {
			continue
		}

		mac, _ := net.ParseMAC(value)

		return mac
	}

	return nil
}
