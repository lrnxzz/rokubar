package roku

import (
	"context"
	"fmt"
)

const audioDevicePath = "/query/audio-device"

// Audio is the volume of the outputs that play now, from query/audio-device.
type Audio struct {
	// Volume runs from 0 to 100.
	Volume int `xml:"global>volume"`

	// Muted is also true at volume 0.
	Muted bool `xml:"global>muted"`
}

// AudioService reads and sets the volume through query/audio-device, which the ECP documentation leaves
// out but Roku OS 15 answers.
type AudioService interface {
	Volume(ctx context.Context) (Audio, error)

	// SetVolume brings the volume to level, clamped to 0 through 100, pressing a volume key once per step
	// since ECP has no command that takes a level.
	SetVolume(ctx context.Context, level int) error
}

type audioService struct {
	transport transport
	keys      KeyService
}

func newAudioService(transport transport, keys KeyService) AudioService {
	return audioService{
		transport: transport,
		keys:      keys,
	}
}

func (s audioService) Volume(ctx context.Context) (Audio, error) {
	var result Audio
	if err := s.transport.query(ctx, audioDevicePath, &result); err != nil {
		return Audio{}, fmt.Errorf("failed to get audio device: %w", err)
	}

	return result, nil
}

func (s audioService) SetVolume(ctx context.Context, level int) error {
	audio, err := s.Volume(ctx)
	if err != nil {
		return err
	}

	key, steps := KeyVolumeUp, min(max(level, 0), 100)-audio.Volume
	if steps < 0 {
		key, steps = KeyVolumeDown, -steps
	}

	for range steps {
		if err := s.keys.Press(ctx, key); err != nil {
			return fmt.Errorf("failed to set volume: %w", err)
		}
	}

	return nil
}
