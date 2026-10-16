package roku

import (
	"cmp"
	"fmt"
	"net"
	"time"
)

const defaultTimeout = 3 * time.Second

// Config says how to reach a Roku.
type Config struct {
	// Host is the device's address, like "192.168.1.2", on port 8060 unless it names another.
	Host string

	// Timeout bounds each request and defaults to 3 seconds. A context deadline that comes first wins.
	Timeout time.Duration
}

// Validate returns an error when Host is empty or Timeout is negative.
func (c Config) Validate() error {
	if c.Host == "" {
		return fmt.Errorf("host is not set")
	}

	if c.Timeout < 0 {
		return fmt.Errorf("timeout must not be negative")
	}

	return nil
}

// BaseUrl returns the device's ECP root, like "http://192.168.1.2:8060".
func (c Config) BaseUrl() string {
	return "http://" + c.address()
}

func (c Config) address() string {
	host := c.Host
	if _, _, err := net.SplitHostPort(host); err != nil {
		host = net.JoinHostPort(host, ecpPort)
	}

	return host
}

// Client sends ECP requests to one Roku, through services that share one pool of keep-alive connections.
// It is safe for concurrent use.
type Client interface {
	Config() Config

	Device() DeviceService
	Apps() AppService
	Keys() KeyService
	Audio() AudioService

	// Tv reads the tuner, which only Roku TVs have.
	Tv() TvService
}

type rokuClient struct {
	config Config

	deviceService DeviceService
	appService    AppService
	keyService    KeyService
	audioService  AudioService
	tvService     TvService
}

// NewClient returns a client for the Roku config reaches. It fails only on an invalid config: the device
// is first contacted by the first request.
func NewClient(config Config) (Client, error) {
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("invalid Roku configuration: %w", err)
	}

	transport := newTransport(config.address(), cmp.Or(config.Timeout, defaultTimeout))
	keyService := newKeyService(transport)

	return rokuClient{
		config: config,

		deviceService: newDeviceService(transport),
		appService:    newAppService(transport),
		keyService:    keyService,
		audioService:  newAudioService(transport, keyService),
		tvService:     newTvService(transport),
	}, nil
}

func (c rokuClient) Config() Config {
	return c.config
}

func (c rokuClient) Device() DeviceService {
	return c.deviceService
}

func (c rokuClient) Apps() AppService {
	return c.appService
}

func (c rokuClient) Keys() KeyService {
	return c.keyService
}

func (c rokuClient) Audio() AudioService {
	return c.audioService
}

func (c rokuClient) Tv() TvService {
	return c.tvService
}
