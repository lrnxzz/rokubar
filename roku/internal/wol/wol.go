// Package wol wakes sleeping hosts with Wake-on-LAN. A sleeping host answers no ARP, so the magic packet
// goes to the directed broadcast of every IPv4 subnet, since 255.255.255.255 leaves through one interface.
package wol

import (
	"bytes"
	"fmt"
	"net"
	"net/netip"
)

// Magic packet layout, AMD white paper 20213.
const (
	syncByte     = 0xFF
	syncLength   = 6
	macRepeats   = 16
	packetLength = syncLength + macRepeats*macLength

	// EUI-48, the IEEE address the white paper repeats.
	macLength = 6
)

// RFC 863.
const discardPort = 9

// Send broadcasts the magic packet for mac on every IPv4 subnet this host is attached to.
func Send(mac net.HardwareAddr) error {
	if len(mac) != macLength {
		return fmt.Errorf("MAC %q is not an EUI-48 address", mac)
	}

	broadcasts, err := directedBroadcasts()
	if err != nil {
		return err
	}

	// Go sets SO_BROADCAST on every UDP socket.
	socket, err := net.ListenUDP("udp4", nil)
	if err != nil {
		return fmt.Errorf("failed to open a socket: %w", err)
	}
	defer socket.Close()

	packet := magicPacket(mac)

	for _, broadcast := range broadcasts {
		if _, err := socket.WriteToUDPAddrPort(packet, broadcast); err != nil {
			return fmt.Errorf("failed to send the magic packet to %s: %w", broadcast, err)
		}
	}

	return nil
}

func directedBroadcasts() ([]netip.AddrPort, error) {
	interfaces, err := net.Interfaces()
	if err != nil {
		return nil, fmt.Errorf("failed to list network interfaces: %w", err)
	}

	broadcasts := make([]netip.AddrPort, 0)

	for _, networkInterface := range interfaces {
		if networkInterface.Flags&net.FlagUp == 0 || networkInterface.Flags&net.FlagBroadcast == 0 {
			continue
		}

		addresses, err := networkInterface.Addrs()
		if err != nil {
			return nil, fmt.Errorf("failed to list addresses of %s: %w", networkInterface.Name, err)
		}

		for _, address := range addresses {
			prefix, err := netip.ParsePrefix(address.String())
			if err != nil || !prefix.Addr().Is4() {
				continue
			}

			broadcasts = append(broadcasts, netip.AddrPortFrom(directedBroadcast(prefix), discardPort))
		}
	}

	if len(broadcasts) == 0 {
		return nil, fmt.Errorf("no IPv4 interface can broadcast")
	}

	return broadcasts, nil
}

// directedBroadcast sets every host bit of prefix, the broadcast address of RFC 922 §7.
func directedBroadcast(prefix netip.Prefix) netip.Addr {
	octets := prefix.Addr().As4()
	mask := net.CIDRMask(prefix.Bits(), 8*len(octets))

	for index := range octets {
		octets[index] |= ^mask[index]
	}

	return netip.AddrFrom4(octets)
}

func magicPacket(mac net.HardwareAddr) []byte {
	packet := make([]byte, syncLength, packetLength)
	for index := range packet {
		packet[index] = syncByte
	}

	return append(packet, bytes.Repeat(mac, macRepeats)...)
}
