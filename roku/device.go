package roku

import (
	"cmp"
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"
)

const (
	deviceInfoPath  = "/query/device-info"
	mediaPlayerPath = "/query/media-player"

	millisecondsSuffix = "ms"
)

// PowerMode is how awake a device is. Only [PowerModeOn] has the screen on, and a TV in standby with its
// network up reports [PowerModeDisplayOff].
type PowerMode string

const (
	PowerModeOn         PowerMode = "PowerOn"
	PowerModeDisplayOff PowerMode = "DisplayOff"
	PowerModeReady      PowerMode = "Ready"
	PowerModeHeadless   PowerMode = "Headless"
)

func (m PowerMode) String() string {
	return string(m)
}

// IsOn reports whether the screen is on.
func (m PowerMode) IsOn() bool {
	return m == PowerModeOn
}

// ControlMode is the Control by mobile apps setting of Roku OS 14.1 and later, which gates ECP.
type ControlMode string

const (
	// ControlModeEnabled accepts every request.
	ControlModeEnabled ControlMode = "enabled"

	// ControlModeLimited answers device-info and active-app only, and refuses everything else with
	// [ErrControlDisabled].
	ControlModeLimited ControlMode = "limited"
)

func (m ControlMode) String() string {
	return string(m)
}

// DeviceInfo is the answer to query/device-info.
type DeviceInfo struct {
	Udn          string `xml:"udn"`
	SerialNumber string `xml:"serial-number"`
	DeviceId     string `xml:"device-id"`

	VendorName        string `xml:"vendor-name"`
	ModelName         string `xml:"model-name"`
	ModelNumber       string `xml:"model-number"`
	ModelRegion       string `xml:"model-region"`
	FriendlyModelName string `xml:"friendly-model-name"`

	FriendlyDeviceName string `xml:"friendly-device-name"`
	DefaultDeviceName  string `xml:"default-device-name"`
	UserDeviceName     string `xml:"user-device-name"`
	UserDeviceLocation string `xml:"user-device-location"`

	IsTv         bool   `xml:"is-tv"`
	IsStick      bool   `xml:"is-stick"`
	ScreenSize   int    `xml:"screen-size"`
	UiResolution string `xml:"ui-resolution"`

	SoftwareVersion string `xml:"software-version"`
	SoftwareBuild   string `xml:"software-build"`

	NetworkType      string `xml:"network-type"`
	NetworkName      string `xml:"network-name"`
	SupportsEthernet bool   `xml:"supports-ethernet"`
	WifiMac          string `xml:"wifi-mac"`
	EthernetMac      string `xml:"ethernet-mac"`

	Language string `xml:"language"`
	Country  string `xml:"country"`
	Locale   string `xml:"locale"`
	TimeZone string `xml:"time-zone-tz"`

	PowerMode   PowerMode   `xml:"power-mode"`
	ControlMode ControlMode `xml:"ecp-setting-mode"`
	Uptime      int64       `xml:"uptime"`

	SupportsSuspend            bool `xml:"supports-suspend"`
	SupportsFindRemote         bool `xml:"supports-find-remote"`
	SupportsWakeOnWlan         bool `xml:"supports-wake-on-wlan"`
	SupportsPrivateListening   bool `xml:"supports-private-listening"`
	HeadphonesConnected        bool `xml:"headphones-connected"`
	DeveloperEnabled           bool `xml:"developer-enabled"`
	SearchEnabled              bool `xml:"search-enabled"`
	VoiceSearchEnabled         bool `xml:"voice-search-enabled"`
	SupportsTvPowerControl     bool `xml:"supports-tv-power-control"`
	SupportsAudioVolumeControl bool `xml:"supports-audio-volume-control"`
}

// Name returns the name the owner gave the device, or else its friendly name, or else its default name.
func (i DeviceInfo) Name() string {
	return cmp.Or(i.UserDeviceName, i.FriendlyDeviceName, i.DefaultDeviceName)
}

// PlayerState is what the media player is doing.
type PlayerState string

const (
	PlayerStateNone    PlayerState = "none"
	PlayerStateStartup PlayerState = "startup"
	PlayerStateOpen    PlayerState = "open"
	PlayerStateBuffer  PlayerState = "buffer"
	PlayerStatePlay    PlayerState = "play"
	PlayerStatePause   PlayerState = "pause"
	PlayerStateStop    PlayerState = "stop"
	PlayerStateClose   PlayerState = "close"
)

func (s PlayerState) String() string {
	return string(s)
}

// IsPlaying reports whether the player is playing or buffering.
func (s PlayerState) IsPlaying() bool {
	return s == PlayerStatePlay || s == PlayerStateBuffer
}

// Milliseconds is a duration as ECP writes it, like "12345 ms".
type Milliseconds time.Duration

func (m Milliseconds) Duration() time.Duration {
	return time.Duration(m)
}

// UnmarshalText reads "12345 ms" or "12345", and empty text as zero.
func (m *Milliseconds) UnmarshalText(text []byte) error {
	value := strings.TrimSpace(strings.TrimSuffix(strings.TrimSpace(string(text)), millisecondsSuffix))
	if value == "" {
		*m = 0

		return nil
	}

	parsed, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return fmt.Errorf("invalid duration %q: %w", text, err)
	}

	*m = Milliseconds(time.Duration(parsed) * time.Millisecond)

	return nil
}

// MediaPlugin is the app that plays the media.
type MediaPlugin struct {
	Id        string `xml:"id,attr"`
	Name      string `xml:"name,attr"`
	Bandwidth string `xml:"bandwidth,attr"`
}

// MediaFormat is the codecs, container and DRM of the stream being played.
type MediaFormat struct {
	Audio     string `xml:"audio,attr"`
	Video     string `xml:"video,attr"`
	Captions  string `xml:"captions,attr"`
	Container string `xml:"container,attr"`
	Drm       string `xml:"drm,attr"`
}

// MediaPlayer is the answer to query/media-player.
type MediaPlayer struct {
	State PlayerState `xml:"state,attr"`

	// Error reports whether playback failed.
	Error bool `xml:"error,attr"`

	Plugin MediaPlugin `xml:"plugin"`
	Format MediaFormat `xml:"format"`

	Position Milliseconds `xml:"position"`
	Duration Milliseconds `xml:"duration"`
	IsLive   bool         `xml:"is_live"`
}

// DeviceService reads the device and its media player.
type DeviceService interface {
	// Info answers whenever the device's network is up, in standby and in Limited mode too.
	Info(ctx context.Context) (DeviceInfo, error)
	MediaPlayer(ctx context.Context) (MediaPlayer, error)
}

type deviceService struct {
	transport transport
}

func newDeviceService(transport transport) DeviceService {
	return deviceService{
		transport: transport,
	}
}

func (s deviceService) Info(ctx context.Context) (DeviceInfo, error) {
	var result DeviceInfo
	if err := s.transport.query(ctx, deviceInfoPath, &result); err != nil {
		return DeviceInfo{}, fmt.Errorf("failed to get device info: %w", err)
	}

	return result, nil
}

func (s deviceService) MediaPlayer(ctx context.Context) (MediaPlayer, error) {
	var result MediaPlayer
	if err := s.transport.query(ctx, mediaPlayerPath, &result); err != nil {
		return MediaPlayer{}, fmt.Errorf("failed to get media player: %w", err)
	}

	return result, nil
}
