package servicer

import (
	"github.com/lrnxzz/rokubar/live"
	"github.com/lrnxzz/rokubar/roku"
	"github.com/lrnxzz/rokubar/server/api"
)

func newTelevision(state live.State) api.Television {
	if !state.Paired() {
		return api.Television{}
	}

	return api.Television{
		Paired:     true,
		Connecting: state.Connecting,
		Reachable:  state.Reachable,
		Serial:     state.Device.Serial,
		Host:       state.Device.Host,
		Name:       state.Info.Name(),
		Model:      state.Info.FriendlyModelName,
		IsTv:       state.Info.IsTv,
		Power:      state.Info.PowerMode.String(),
		Limited:    state.Info.ControlMode == roku.ControlModeLimited,
		Hardware: api.Hardware{
			Vendor:      state.Info.VendorName,
			ModelNumber: state.Info.ModelName,
			ScreenSize:  state.Info.ScreenSize,
			Software:    state.Info.SoftwareVersion,
			Network:     state.Info.NetworkType,
			NetworkName: state.Info.NetworkName,
			Language:    state.Info.Language,
		},
		App: newApp(state.Active.App),
		Player: api.Player{
			State:    state.Player.State.String(),
			Position: state.Player.Position.Duration().Milliseconds(),
			Duration: state.Player.Duration.Duration().Milliseconds(),
			Live:     state.Player.IsLive,
		},
		Audio: api.Audio{
			Volume: state.Audio.Volume,
			Muted:  state.Audio.Muted,
		},
	}
}

func newApp(app roku.App) api.App {
	return api.App{
		Id:   app.Id,
		Name: app.Name,
		Type: app.Type.String(),
	}
}
