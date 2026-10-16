package roku

import (
	"testing"
	"time"
)

func Test_Milliseconds_UnmarshalText(t *testing.T) {
	tests := map[string]time.Duration{
		"6916 ms":   6916 * time.Millisecond,
		"887999 ms": 887999 * time.Millisecond,
		"  12 ms  ": 12 * time.Millisecond,
		"0 ms":      0,
		"":          0,
		"1500":      1500 * time.Millisecond,
	}

	for text, expected := range tests {
		var got Milliseconds

		if err := got.UnmarshalText([]byte(text)); err != nil {
			t.Errorf("Failed to read %q: %v", text, err)

			continue
		}

		if got.Duration() != expected {
			t.Errorf("Expected %s for %q, got %s", expected, text, got.Duration())
		}
	}

	var invalid Milliseconds

	if err := invalid.UnmarshalText([]byte("soon ms")); err == nil {
		t.Error("Expected words to be refused")
	}
}
