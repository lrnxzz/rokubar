package roku

import (
	"testing"
	"time"
)

func Test_Config_Validate(t *testing.T) {
	invalid := map[string]Config{
		"no host": {},
		"negative timeout": {
			Host:    "192.0.2.10",
			Timeout: -time.Second,
		},
	}

	for name, config := range invalid {
		if err := config.Validate(); err == nil {
			t.Errorf("Expected %s to be refused", name)
		}
	}

	valid := Config{
		Host: "192.0.2.10",
	}

	if err := valid.Validate(); err != nil {
		t.Errorf("Expected a host alone to be enough, got %v", err)
	}
}

func Test_Config_BaseURL(t *testing.T) {
	tests := map[string]string{
		"192.0.2.10":      "http://192.0.2.10:8060",
		"192.0.2.10:9000": "http://192.0.2.10:9000",
		"::1":             "http://[::1]:8060",
	}

	for host, expected := range tests {
		config := Config{
			Host: host,
		}

		if got := config.BaseUrl(); got != expected {
			t.Errorf("Expected %s for host %q, got %s", expected, host, got)
		}
	}
}
