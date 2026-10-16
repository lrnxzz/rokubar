package roku

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"unicode/utf8"
)

const (
	keypressPath = "/keypress/%s"
	keydownPath  = "/keydown/%s"
	keyupPath    = "/keyup/%s"

	literalPrefix = "Lit_"
)

// Key is a remote key. Besides the constants, [LiteralKey] makes the key that types a character.
type Key string

// The keys every Roku takes.
const (
	KeyHome          Key = "Home"
	KeyRev           Key = "Rev"
	KeyFwd           Key = "Fwd"
	KeyPlay          Key = "Play"
	KeySelect        Key = "Select"
	KeyLeft          Key = "Left"
	KeyRight         Key = "Right"
	KeyDown          Key = "Down"
	KeyUp            Key = "Up"
	KeyBack          Key = "Back"
	KeyInstantReplay Key = "InstantReplay"
	KeyInfo          Key = "Info"
	KeyBackspace     Key = "Backspace"
	KeySearch        Key = "Search"
	KeyEnter         Key = "Enter"

	// KeyFindRemote rings the remote, on devices whose DeviceInfo.SupportsFindRemote is true.
	KeyFindRemote Key = "FindRemote"
)

// The keys of Roku TVs. Volume and power off work on some players too.
const (
	KeyVolumeDown Key = "VolumeDown"
	KeyVolumeMute Key = "VolumeMute"
	KeyVolumeUp   Key = "VolumeUp"
	KeyPowerOff   Key = "PowerOff"

	// KeyPowerOn is missing from the ECP documentation and turns a TV on while its network is up.
	// [TurnOn] also wakes a TV whose network sleeps.
	KeyPowerOn Key = "PowerOn"

	KeyChannelUp   Key = "ChannelUp"
	KeyChannelDown Key = "ChannelDown"
	KeyInputTuner  Key = "InputTuner"
	KeyInputHdmi1  Key = "InputHDMI1"
	KeyInputHdmi2  Key = "InputHDMI2"
	KeyInputHdmi3  Key = "InputHDMI3"
	KeyInputHdmi4  Key = "InputHDMI4"
	KeyInputAv1    Key = "InputAV1"
)

// LiteralKey returns the key that types char into an on-screen keyboard. Any Unicode character works.
func LiteralKey(char rune) Key {
	return Key(literalPrefix + string(char))
}

func (k Key) String() string {
	return string(k)
}

// IsLiteral reports whether k types a character, as [LiteralKey] makes it.
func (k Key) IsLiteral() bool {
	char, ok := strings.CutPrefix(string(k), literalPrefix)

	return ok && utf8.RuneCountInString(char) == 1
}

// IsValid reports whether k is one of the Key constants or a literal key.
func (k Key) IsValid() bool {
	switch k {
	case KeyHome, KeyRev, KeyFwd, KeyPlay, KeySelect, KeyLeft, KeyRight, KeyDown, KeyUp, KeyBack,
		KeyInstantReplay, KeyInfo, KeyBackspace, KeySearch, KeyEnter, KeyFindRemote,
		KeyVolumeDown, KeyVolumeMute, KeyVolumeUp, KeyPowerOff, KeyPowerOn, KeyChannelUp, KeyChannelDown,
		KeyInputTuner, KeyInputHdmi1, KeyInputHdmi2, KeyInputHdmi3, KeyInputHdmi4, KeyInputAv1:
		return true
	default:
		return k.IsLiteral()
	}
}

// KeyService sends remote keys. Every method refuses a key that isn't valid before sending anything, and
// Limited mode refuses them all with ErrControlDisabled.
type KeyService interface {
	Press(ctx context.Context, key Key) error

	// Hold keeps key down, and the device repeating it, until Release.
	Hold(ctx context.Context, key Key) error
	Release(ctx context.Context, key Key) error

	// Type presses one literal key per character of text. Only an on-screen keyboard that is open takes
	// them, and a failure stops at the character that failed.
	Type(ctx context.Context, text string) error
}

type keyService struct {
	transport transport
}

func newKeyService(transport transport) KeyService {
	return keyService{
		transport: transport,
	}
}

func (s keyService) Press(ctx context.Context, key Key) error {
	return s.send(ctx, keypressPath, key)
}

func (s keyService) Hold(ctx context.Context, key Key) error {
	return s.send(ctx, keydownPath, key)
}

func (s keyService) Release(ctx context.Context, key Key) error {
	return s.send(ctx, keyupPath, key)
}

func (s keyService) Type(ctx context.Context, text string) error {
	if text == "" {
		return fmt.Errorf("text is required")
	}

	for _, char := range text {
		if err := s.Press(ctx, LiteralKey(char)); err != nil {
			return fmt.Errorf("failed to type %q: %w", char, err)
		}
	}

	return nil
}

func (s keyService) send(ctx context.Context, path string, key Key) error {
	if !key.IsValid() {
		return fmt.Errorf("invalid key: %q", key)
	}

	if err := s.transport.command(ctx, fmt.Sprintf(path, url.PathEscape(key.String())), nil); err != nil {
		return fmt.Errorf("failed to send key %s: %w", key, err)
	}

	return nil
}
