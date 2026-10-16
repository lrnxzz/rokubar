package test

import (
	"testing"
)

func Test_InitializeBrsNode(t *testing.T) {
	ctx := t.Context()

	brsNode, address, err := InitializeBrsNode(t)
	if err != nil {
		t.Fatalf("Failed to initialize brs-node container: %v", err)
	}
	defer func() {
		if err := brsNode.Terminate(ctx); err != nil {
			t.Fatalf("Failed to terminate brs-node container: %v", err)
		}
	}()

	if !address.Is4() {
		t.Errorf("Expected brs-node on an IPv4 address, got %s", address)
	}

	keys, err := PressedKeys(t, brsNode)
	if err != nil || len(keys) != 0 {
		t.Errorf("Expected no key before any was pressed, got %v, %v", keys, err)
	}
}
