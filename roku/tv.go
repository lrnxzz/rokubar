package roku

import (
	"context"
	"fmt"
)

const (
	tvChannelsPath      = "/query/tv-channels"
	tvActiveChannelPath = "/query/tv-active-channel"
)

// Channel is a channel of the TV's tuner.
type Channel struct {
	Number     string `xml:"number"`
	Name       string `xml:"name"`
	Type       string `xml:"type"`
	UserHidden bool   `xml:"user-hidden"`
}

// ActiveChannel is the channel the tuner is on, with its signal and the program airing.
type ActiveChannel struct {
	Channel

	ActiveInput   bool   `xml:"active-input"`
	SignalMode    string `xml:"signal-mode"`
	SignalQuality string `xml:"signal-quality"`

	ProgramTitle       string `xml:"program-title"`
	ProgramDescription string `xml:"program-description"`
	ProgramRatings     string `xml:"program-ratings"`
}

// TvService reads the tuner of a Roku TV. Streaming players answer it with ErrNotFound.
type TvService interface {
	Channels(ctx context.Context) ([]Channel, error)
	ActiveChannel(ctx context.Context) (ActiveChannel, error)
}

type channelsResponse struct {
	Channels []Channel `xml:"channel"`
}

type activeChannelResponse struct {
	Channel ActiveChannel `xml:"channel"`
}

type tvService struct {
	transport transport
}

func newTvService(transport transport) TvService {
	return tvService{
		transport: transport,
	}
}

func (s tvService) Channels(ctx context.Context) ([]Channel, error) {
	var result channelsResponse
	if err := s.transport.query(ctx, tvChannelsPath, &result); err != nil {
		return nil, fmt.Errorf("failed to get tv channels: %w", err)
	}

	return result.Channels, nil
}

func (s tvService) ActiveChannel(ctx context.Context) (ActiveChannel, error) {
	var result activeChannelResponse
	if err := s.transport.query(ctx, tvActiveChannelPath, &result); err != nil {
		return ActiveChannel{}, fmt.Errorf("failed to get active tv channel: %w", err)
	}

	return result.Channel, nil
}
