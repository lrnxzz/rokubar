package roku

import (
	"context"
	"fmt"
	"net/url"

	"github.com/valyala/fasthttp"
)

const (
	appsPath      = "/query/apps"
	activeAppPath = "/query/active-app"
	appIconPath   = "/query/icon/%s"
	launchPath    = "/launch/%s"

	contentIdParam = "contentId"
	mediaTypeParam = "mediaType"
)

// AppType is what kind of app an [App] is.
type AppType string

const (
	AppTypeApplication AppType = "appl"

	// AppTypeHome is the home screen, which Roku OS 15 reports as the active app.
	AppTypeHome AppType = "home"
	AppTypeMenu AppType = "menu"

	// AppTypeTvInput is a TV input, like "tvinput.hdmi1" or "tvinput.dtv", launched like any app.
	AppTypeTvInput     AppType = "tvin"
	AppTypeScreensaver AppType = "ssvr"
)

func (t AppType) String() string {
	return string(t)
}

// App is an app installed on the device, or one of a TV's inputs.
type App struct {
	Id      string  `xml:"id,attr"`
	Type    AppType `xml:"type,attr"`
	Subtype string  `xml:"subtype,attr"`
	Version string  `xml:"version,attr"`

	// Name is the name as the device lists it, which may carry stray spaces.
	Name string `xml:",chardata"`
}

// ActiveApp is the answer to query/active-app.
type ActiveApp struct {
	// App is what's on screen. An App without Id is a system screen, like Settings.
	App App `xml:"app"`

	// Screensaver is nil unless a screensaver runs on top of App.
	Screensaver *App `xml:"screensaver"`
}

// IsHome reports whether the home screen is on screen.
func (a ActiveApp) IsHome() bool {
	return a.App.Type == AppTypeHome
}

// Icon is an app's image, in the format ContentType names.
type Icon struct {
	ContentType string
	Data        []byte
}

// MediaType says what kind of content a deep link opens.
type MediaType string

const (
	MediaTypeMovie          MediaType = "movie"
	MediaTypeEpisode        MediaType = "episode"
	MediaTypeSeason         MediaType = "season"
	MediaTypeSeries         MediaType = "series"
	MediaTypeShortFormVideo MediaType = "shortFormVideo"
	MediaTypeLive           MediaType = "live"
)

func (t MediaType) String() string {
	return string(t)
}

// IsValid reports whether t is one of the MediaType constants.
func (t MediaType) IsValid() bool {
	switch t {
	case MediaTypeMovie, MediaTypeEpisode, MediaTypeSeason, MediaTypeSeries, MediaTypeShortFormVideo, MediaTypeLive:
		return true
	default:
		return false
	}
}

// LaunchRequest says which app to open and, optionally, what to open in it.
type LaunchRequest struct {
	// AppId is an [App.Id], an app's or a TV input's.
	AppId string

	// ContentId deep links into the app, and needs MediaType to say what it is.
	ContentId string
	MediaType MediaType

	// Params reach the app as query parameters. ContentId and MediaType win over entries of their names.
	Params map[string]string
}

// Validate returns an error when AppId is empty, or when ContentId comes without a valid MediaType.
func (r LaunchRequest) Validate() error {
	if r.AppId == "" {
		return fmt.Errorf("app id is required")
	}

	if r.ContentId != "" && !r.MediaType.IsValid() {
		return fmt.Errorf("invalid media type for deep link: %q", r.MediaType)
	}

	return nil
}

func (r LaunchRequest) toParams() url.Values {
	query := url.Values{}
	for key, value := range r.Params {
		query.Set(key, value)
	}

	if r.ContentId != "" {
		query.Set(contentIdParam, r.ContentId)
		query.Set(mediaTypeParam, r.MediaType.String())
	}

	return query
}

// AppService lists, inspects and launches apps.
type AppService interface {
	// List returns the installed apps, and a TV's inputs among them.
	List(ctx context.Context) ([]App, error)
	Active(ctx context.Context) (ActiveApp, error)

	// Icon returns the app's poster.
	Icon(ctx context.Context, appId string) (Icon, error)

	// Launch opens the app, or switches the TV to the input, after checking request with Validate.
	Launch(ctx context.Context, request LaunchRequest) error
}

type appsResponse struct {
	Apps []App `xml:"app"`
}

type appService struct {
	transport transport
}

func newAppService(transport transport) AppService {
	return appService{
		transport: transport,
	}
}

func (s appService) List(ctx context.Context) ([]App, error) {
	var result appsResponse
	if err := s.transport.query(ctx, appsPath, &result); err != nil {
		return nil, fmt.Errorf("failed to get apps: %w", err)
	}

	return result.Apps, nil
}

func (s appService) Active(ctx context.Context) (ActiveApp, error) {
	var result ActiveApp
	if err := s.transport.query(ctx, activeAppPath, &result); err != nil {
		return ActiveApp{}, fmt.Errorf("failed to get active app: %w", err)
	}

	return result, nil
}

func (s appService) Icon(ctx context.Context, appId string) (Icon, error) {
	if appId == "" {
		return Icon{}, fmt.Errorf("app id is required")
	}

	data, contentType, err := s.transport.do(ctx, fasthttp.MethodGet, fmt.Sprintf(appIconPath, url.PathEscape(appId)), nil)
	if err != nil {
		return Icon{}, fmt.Errorf("failed to get app icon: %w", err)
	}

	return Icon{
		ContentType: contentType,
		Data:        data,
	}, nil
}

func (s appService) Launch(ctx context.Context, request LaunchRequest) error {
	if err := request.Validate(); err != nil {
		return err
	}

	if err := s.transport.command(ctx, fmt.Sprintf(launchPath, url.PathEscape(request.AppId)), request.toParams()); err != nil {
		return fmt.Errorf("failed to launch app: %w", err)
	}

	return nil
}
