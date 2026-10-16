package roku

import (
	"bytes"
	"context"
	"encoding/xml"
	"fmt"
	"net/url"
	"time"

	"github.com/valyala/fasthttp"
)

// ECP is "a simple RESTful API accessed using HTTP on port 8060": queries are GETs that answer XML,
// commands are POSTs "with no body" (ECP documentation).
const (
	ecpPort = "8060"

	// query/icon is the largest answer, 20679 bytes in the documented example, so 4 MiB only bounds a
	// misbehaving device.
	maxBodySize = 4 << 20
)

// transport carries the requests of one client, whose services share its pool of keep-alive connections.
type transport struct {
	client  *fasthttp.HostClient
	timeout time.Duration
}

func newTransport(address string, timeout time.Duration) transport {
	return transport{
		client: &fasthttp.HostClient{
			Addr:                address,
			MaxResponseBodySize: maxBodySize,

			// Literal keys travel percent-encoded, like "Lit_%E2%82%AC", and normalizing would decode them.
			DisablePathNormalizing: true,
		},
		timeout: timeout,
	}
}

// query GETs path and decodes the XML it answers into target.
func (t transport) query(ctx context.Context, path string, target any) error {
	body, _, err := t.do(ctx, fasthttp.MethodGet, path, nil)
	if err != nil {
		return err
	}

	if err := xml.Unmarshal(body, target); err != nil {
		return fmt.Errorf("failed to decode %s: %w", path, err)
	}

	return nil
}

// command POSTs path with params as its query string.
func (t transport) command(ctx context.Context, path string, params url.Values) error {
	_, _, err := t.do(ctx, fasthttp.MethodPost, path, params)

	return err
}

// do returns the body and content type of a 2xx answer. Any other status is the whole error, since ECP
// has no error body.
func (t transport) do(ctx context.Context, method, path string, params url.Values) ([]byte, string, error) {
	// fasthttp takes no context: a canceled one stops here, and its deadline bounds the round trip.
	if err := ctx.Err(); err != nil {
		return nil, "", err
	}

	deadline := time.Now().Add(t.timeout)
	if ctxDeadline, ok := ctx.Deadline(); ok && ctxDeadline.Before(deadline) {
		deadline = ctxDeadline
	}

	request := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(request)

	response := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(response)

	request.Header.SetMethod(method)

	uri := request.URI()
	uri.SetHost(t.client.Addr)
	uri.SetPath(path)
	uri.SetQueryString(params.Encode())

	if err := t.client.DoDeadline(request, response, deadline); err != nil {
		return nil, "", fmt.Errorf("%w: %w", ErrUnreachable, err)
	}

	if status := response.StatusCode(); status < fasthttp.StatusOK || status >= fasthttp.StatusMultipleChoices {
		return nil, "", newStatusError(status, string(response.Body()))
	}

	// The response goes back to fasthttp's pool on return.
	return bytes.Clone(response.Body()), string(response.Header.ContentType()), nil
}
