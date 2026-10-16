package wol

import (
	"bytes"
	"net"
	"net/netip"
	"testing"
)

func Test_MagicPacket(t *testing.T) {
	mac, _ := net.ParseMAC("f0:ed:51:de:0e:e1")

	packet := magicPacket(mac)

	if len(packet) != 102 {
		t.Fatalf("Expected 102 bytes, got %d", len(packet))
	}

	sync := []byte{
		0xFF,
	}

	if !bytes.Equal(packet[:6], bytes.Repeat(sync, 6)) {
		t.Errorf("Expected 6 bytes of FFh first, got % x", packet[:6])
	}

	for offset := 6; offset < len(packet); offset += 6 {
		if !bytes.Equal(packet[offset:offset+6], mac) {
			t.Errorf("Expected the MAC at offset %d, got % x", offset, packet[offset:offset+6])
		}
	}
}

func Test_DirectedBroadcast(t *testing.T) {
	tests := map[string]string{
		"192.168.1.8/24":    "192.168.1.255",
		"172.23.112.31/20":  "172.23.127.255",
		"172.17.0.1/16":     "172.17.255.255",
		"10.0.0.5/8":        "10.255.255.255",
		"192.168.1.130/25":  "192.168.1.255",
		"192.168.1.8/32":    "192.168.1.8",
		"0.0.0.0/0":         "255.255.255.255",
		"203.0.113.77/30":   "203.0.113.79",
		"198.51.100.200/29": "198.51.100.207",
	}

	for prefix, expected := range tests {
		if got := directedBroadcast(netip.MustParsePrefix(prefix)).String(); got != expected {
			t.Errorf("Expected %s for %s, got %s", expected, prefix, got)
		}
	}
}

func Test_Send_RefusesWhatIsNotEui48(t *testing.T) {
	macs := []string{
		"",
		"00:00:00:00:fe:80:00:00",
	}

	for _, value := range macs {
		mac, _ := net.ParseMAC(value)

		if err := Send(mac); err == nil {
			t.Errorf("Expected %q to be refused", value)
		}
	}
}
