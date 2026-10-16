package roku

import (
	"testing"
)

func Test_LaunchRequest_Validate(t *testing.T) {
	invalid := map[string]LaunchRequest{
		"no app": {
			ContentId: "tt1",
			MediaType: MediaTypeMovie,
		},
		"deep link without media type": {
			AppId:     "12",
			ContentId: "tt1",
		},
		"unknown media type": {
			AppId:     "12",
			ContentId: "tt1",
			MediaType: "podcast",
		},
	}

	for name, request := range invalid {
		if err := request.Validate(); err == nil {
			t.Errorf("Expected %s to be refused", name)
		}
	}
}

func Test_LaunchRequest_ToParams(t *testing.T) {
	tests := map[string]LaunchRequest{
		"contentId=tt1&mediaType=movie&profile=kids": {
			AppId:     "12",
			ContentId: "tt1",
			MediaType: MediaTypeMovie,
			Params: map[string]string{
				"profile":   "kids",
				"contentId": "ignored",
			},
		},
		"": {
			AppId:     "12",
			MediaType: MediaTypeMovie,
		},
	}

	for expected, request := range tests {
		if got := request.toParams().Encode(); got != expected {
			t.Errorf("Expected %q, got %q", expected, got)
		}
	}
}

func Test_ActiveApp_IsHome(t *testing.T) {
	tests := map[AppType]bool{
		AppTypeHome:        true,
		AppTypeApplication: false,
		AppTypeTvInput:     false,
		"":                 false,
	}

	for appType, expected := range tests {
		active := ActiveApp{
			App: App{
				Type: appType,
			},
		}

		if got := active.IsHome(); got != expected {
			t.Errorf("Expected IsHome() = %t for type %q, got %t", expected, appType, got)
		}
	}
}
