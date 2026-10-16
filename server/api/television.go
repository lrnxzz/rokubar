package api

type Television struct {
	Paired     bool     `json:"paired"`
	Connecting bool     `json:"connecting"`
	Reachable  bool     `json:"reachable"`
	Serial     string   `json:"serial"`
	Host       string   `json:"host"`
	Name       string   `json:"name"`
	Model      string   `json:"model"`
	IsTv       bool     `json:"isTv"`
	Power      string   `json:"power"`
	Limited    bool     `json:"limited"`
	Hardware   Hardware `json:"hardware"`
	App        App      `json:"app"`
	Player     Player   `json:"player"`

	// Audio is zero when the TV doesn't answer audio-device: at volume 0 a TV reports itself muted.
	Audio Audio `json:"audio,omitzero"`
}

type Hardware struct {
	Vendor      string `json:"vendor"`
	ModelNumber string `json:"modelNumber"`
	ScreenSize  int    `json:"screenSize"`
	Software    string `json:"software"`
	Network     string `json:"network"`
	NetworkName string `json:"networkName"`
	Language    string `json:"language"`
}

type App struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Type string `json:"type"`
}

type Player struct {
	State    string `json:"state"`
	Position int64  `json:"position"`
	Duration int64  `json:"duration"`
	Live     bool   `json:"live"`
}

type Audio struct {
	Volume int  `json:"volume"`
	Muted  bool `json:"muted"`
}
