package http

import (
	"fmt"

	"github.com/lrnxzz/rokubar/server/api"
)

type TypeTextRequest struct {
	Text string `json:"text"`
}

func (r TypeTextRequest) Validate() error {
	if r.Text == "" {
		return fmt.Errorf("text is required")
	}

	return nil
}

type SetVolumeRequest struct {
	Level int `json:"level"`
}

func (r SetVolumeRequest) Validate() error {
	if r.Level < 0 || r.Level > 100 {
		return fmt.Errorf("level must be between 0 and 100")
	}

	return nil
}

type (
	GetTelevisionResponse     api.Television
	SearchTelevisionsResponse []api.Television
	ListAppsResponse          []api.App
)
