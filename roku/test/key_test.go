package test

import (
	"testing"

	"github.com/lrnxzz/rokubar/roku"
)

func Test_Integration_PressKey_ReachesTheChannel(t *testing.T) {
	client, container, _ := startBrsNode(t)

	keys := []roku.Key{
		roku.KeyUp,
		roku.KeySelect,
	}

	for _, key := range keys {
		if err := client.Keys().Press(t.Context(), key); err != nil {
			t.Fatalf("Failed to press %s: %v", key, err)
		}
	}

	ExpectKeys(t, container, 2, 102, 6, 106)
}

func Test_Integration_HoldKey_HoldsUntilReleased(t *testing.T) {
	client, container, _ := startBrsNode(t)

	if err := client.Keys().Hold(t.Context(), roku.KeyRight); err != nil {
		t.Fatalf("Failed to hold Right: %v", err)
	}

	ExpectKeys(t, container, 5)

	if err := client.Keys().Release(t.Context(), roku.KeyRight); err != nil {
		t.Fatalf("Failed to release Right: %v", err)
	}

	ExpectKeys(t, container, 5, 105)
}

func Test_Integration_TypeText_TypesEveryCharacter(t *testing.T) {
	client, container, _ := startBrsNode(t)

	if err := client.Keys().Type(t.Context(), "ab"); err != nil {
		t.Fatalf("Failed to type text: %v", err)
	}

	ExpectKeys(t, container, 97, 197, 98, 198)
}
