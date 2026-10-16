package tray

import (
	"bytes"
	"encoding/json"
	"net"
	"os"

	"github.com/natefinch/atomic"

	"github.com/lrnxzz/rokubar/roku"
)

// televisionStore keeps the paired TV in %APPDATA%\rokubar\tv.json between runs.
type televisionStore struct {
	path string
}

type saved struct {
	Serial string `json:"serial"`
	Host   string `json:"host"`
	Mac    string `json:"mac,omitempty"`
}

func (s televisionStore) Load() (roku.Device, error) {
	file, err := os.Open(s.path)
	if err != nil {
		return roku.Device{}, err
	}
	defer file.Close()

	var device saved
	if err := json.NewDecoder(file).Decode(&device); err != nil {
		return roku.Device{}, err
	}

	mac, _ := net.ParseMAC(device.Mac)

	return roku.Device{
		Serial: device.Serial,
		Host:   device.Host,
		Mac:    mac,
	}, nil
}

func (s televisionStore) Save(device roku.Device) error {
	data, err := json.Marshal(saved{
		Serial: device.Serial,
		Host:   device.Host,
		Mac:    device.Mac.String(),
	})
	if err != nil {
		return err
	}

	return atomic.WriteFile(s.path, bytes.NewReader(data))
}

func (s televisionStore) Clear() error {
	return os.RemoveAll(s.path)
}
