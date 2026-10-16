package roku

import (
	"strings"
	"testing"

	"github.com/lrnxzz/go-ssdp/ssdp"
)

const documentedAnswer = "HTTP/1.1 200 OK\r\n" +
	"Cache-Control: max-age=3600\r\n" +
	"ST: roku:ecp\r\n" +
	"Location: http://192.168.1.134:8060/\r\n" +
	"USN: uuid:roku:ecp:P0A070000007\r\n" +
	"WAKEUP: MAC=f0:ed:51:de:0e:e1;Timeout=10\r\n" +
	"\r\n"

func Test_NewDevice(t *testing.T) {
	device, ok := newDevice(decodeAnswer(t, documentedAnswer))
	if !ok {
		t.Fatal("Expected the documented answer to be a Roku")
	}

	if device.Serial != "P0A070000007" || device.Host != "192.168.1.134:8060" || device.Mac.String() != "f0:ed:51:de:0e:e1" {
		t.Errorf("Expected serial P0A070000007 at 192.168.1.134:8060 with MAC f0:ed:51:de:0e:e1, got %+v", device)
	}
}

func Test_NewDevice_RefusesAnswersWithoutSerialOrRoot(t *testing.T) {
	tests := map[string]string{
		"uuid without serial": strings.Replace(documentedAnswer, "uuid:roku:ecp:P0A070000007", "uuid:2fac1234-31f8-11b4-a222-08002b34c003", 1),
		"empty serial":        strings.Replace(documentedAnswer, "uuid:roku:ecp:P0A070000007", "uuid:roku:ecp:", 1),
		"no location":         strings.Replace(documentedAnswer, "Location: http://192.168.1.134:8060/\r\n", "", 1),
	}

	for name, datagram := range tests {
		if device, ok := newDevice(decodeAnswer(t, datagram)); ok {
			t.Errorf("Expected an answer with %s to be refused, got %+v", name, device)
		}
	}
}

func Test_ParseWakeUp(t *testing.T) {
	tests := map[string]string{
		"MAC=f0:ed:51:de:0e:e1;Timeout=10":     "f0:ed:51:de:0e:e1",
		"Timeout=10;MAC=f0:ed:51:de:0e:e1":     "f0:ed:51:de:0e:e1",
		" MAC=f0:ed:51:de:0e:e1 ; Timeout=10 ": "f0:ed:51:de:0e:e1",
		"MAC=not-a-mac;Timeout=10":             "",
		"Timeout=10":                           "",
		"":                                     "",
	}

	for field, expected := range tests {
		if got := parseWakeUp(field).String(); got != expected {
			t.Errorf("Expected MAC %q for %q, got %q", expected, field, got)
		}
	}
}

func Test_Device_Config(t *testing.T) {
	device := Device{
		Host: "192.0.2.10:8060",
	}

	if got := device.Config().BaseUrl(); got != "http://192.0.2.10:8060" {
		t.Errorf("Expected http://192.0.2.10:8060, got %s", got)
	}
}

func decodeAnswer(t *testing.T, datagram string) ssdp.SearchResponse {
	t.Helper()

	var response ssdp.SearchResponse
	if err := response.UnmarshalBinary([]byte(datagram)); err != nil {
		t.Fatalf("Failed to decode the answer: %v", err)
	}

	return response
}
