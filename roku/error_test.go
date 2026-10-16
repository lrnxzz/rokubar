package roku

import (
	"errors"
	"testing"
)

func Test_StatusError_Is(t *testing.T) {
	tests := map[int]error{
		401: ErrControlDisabled,
		403: ErrControlDisabled,
		404: ErrNotFound,
		500: nil,
	}

	sentinels := []error{
		ErrControlDisabled,
		ErrNotFound,
		ErrUnreachable,
	}

	for status, expected := range tests {
		err := error(newStatusError(status, ""))

		for _, sentinel := range sentinels {
			if errors.Is(err, sentinel) != errors.Is(expected, sentinel) {
				t.Errorf("Expected status %d to match %v only, matched %v as %t", status, expected, sentinel, errors.Is(err, sentinel))
			}
		}
	}
}

func Test_StatusError_KeepsWhatTheDeviceAnswered(t *testing.T) {
	err := newStatusError(403, "ECP command not allowed in Limited mode.")

	if err.StatusCode() != 403 || err.Body() != "ECP command not allowed in Limited mode." {
		t.Errorf("Expected status 403 and the body, got %d and %q", err.StatusCode(), err.Body())
	}
}
