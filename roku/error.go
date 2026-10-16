package roku

import (
	"errors"
	"fmt"

	"github.com/valyala/fasthttp"
)

var (
	// ErrUnreachable is wrapped by every request the device didn't answer: a wrong host, a device off the
	// network, or a TV in deep standby.
	ErrUnreachable = errors.New("roku device unreachable")

	// ErrControlDisabled matches a 401 or 403, the refusal of Control by mobile apps set to anything but
	// Enabled.
	ErrControlDisabled = errors.New("roku control by mobile apps is not enabled")

	// ErrNotFound matches a 404: the device doesn't serve the endpoint, or doesn't know the app.
	ErrNotFound = errors.New("roku endpoint not found")
)

// StatusError is an answer outside 2xx, returned as a value. [errors.Is] matches it against
// [ErrControlDisabled] and [ErrNotFound].
type StatusError struct {
	statusCode int
	body       string
}

func newStatusError(statusCode int, body string) StatusError {
	return StatusError{
		statusCode: statusCode,
		body:       body,
	}
}

func (e StatusError) Error() string {
	if e.body != "" {
		return fmt.Sprintf("roku request failed with status %d: %s", e.statusCode, e.body)
	}

	return fmt.Sprintf("roku request failed with status %d", e.statusCode)
}

func (e StatusError) Is(target error) bool {
	switch target {
	case ErrControlDisabled:
		return e.statusCode == fasthttp.StatusUnauthorized || e.statusCode == fasthttp.StatusForbidden
	case ErrNotFound:
		return e.statusCode == fasthttp.StatusNotFound
	default:
		return false
	}
}

func (e StatusError) StatusCode() int {
	return e.statusCode
}

// Body returns the text the device sent with the status, often empty: ECP has no error format.
func (e StatusError) Body() string {
	return e.body
}
