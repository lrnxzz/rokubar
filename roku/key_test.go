package roku

import (
	"errors"
	"testing"
)

func Test_Key_IsValid(t *testing.T) {
	tests := map[Key]bool{
		KeyHome:           true,
		KeyPowerOn:        true,
		KeyInputHdmi1:     true,
		LiteralKey('a'):   true,
		LiteralKey('/'):   true,
		LiteralKey('é'):   true,
		"Lit_ab":          false,
		"Lit_":            false,
		"home":            false,
		"../launch/12345": false,
	}

	for key, expected := range tests {
		if got := key.IsValid(); got != expected {
			t.Errorf("Expected IsValid() = %t for %q, got %t", expected, key, got)
		}
	}
}

func Test_LiteralKey(t *testing.T) {
	tests := map[rune]Key{
		'a': "Lit_a",
		'/': "Lit_/",
		'é': "Lit_é",
	}

	for char, expected := range tests {
		if got := LiteralKey(char); got != expected || !got.IsLiteral() {
			t.Errorf("Expected literal %q for %q, got %q", expected, char, got)
		}
	}

	if KeyHome.IsLiteral() {
		t.Error("Expected Home not to be a literal")
	}
}

func Test_PressKey_RefusesInvalidKeys(t *testing.T) {
	client, err := NewClient(Config{
		Host: "192.0.2.10",
	})
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	if err := client.Keys().Press(t.Context(), "../launch/12345"); err == nil || errors.Is(err, ErrUnreachable) {
		t.Errorf("Expected the key to be refused before any request, got %v", err)
	}
}

func Test_PressKey_ReportsAnUnreachableDevice(t *testing.T) {
	client, err := NewClient(Config{
		Host: "127.0.0.1:1",
	})
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	if err := client.Keys().Press(t.Context(), KeyHome); !errors.Is(err, ErrUnreachable) {
		t.Errorf("Expected ErrUnreachable, got %v", err)
	}
}

func Test_TypeText_RefusesEmptyText(t *testing.T) {
	client, err := NewClient(Config{
		Host: "192.0.2.10",
	})
	if err != nil {
		t.Fatalf("Failed to create client: %v", err)
	}

	if err := client.Keys().Type(t.Context(), ""); err == nil {
		t.Error("Expected empty text to be refused")
	}
}
