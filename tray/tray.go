package tray

import (
	_ "embed"
	"net/http"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"

	"github.com/lrnxzz/rokubar/server"
)

// Windows takes the image in the .ico that matches its tray size: 16 px at 100% scaling up to 48 at 300%.
//
//go:embed icons/tray.ico
var trayIcon []byte

type Config struct {
	// Show opens the panel at start and keeps it open.
	Show bool

	// Page is the page the panel opens on: tv, remote, apps or settings.
	Page string
}

// Run starts Rokubar in the tray and returns when it quits.
func Run(config Config) error {
	directory, err := os.UserConfigDir()
	if err != nil {
		return err
	}

	directory = filepath.Join(directory, "rokubar")

	if err := os.MkdirAll(directory, os.ModePerm); err != nil {
		return err
	}

	routes := http.NewServeMux()
	routes.Handle("/", application.AssetFileServerFS(assets))

	app := application.New(application.Options{
		Name:        "Rokubar",
		Description: "A Roku remote in the Windows tray",
		Assets: application.AssetOptions{
			Handler: routes,
		},
		SingleInstance: &application.SingleInstanceOptions{
			UniqueID: "com.lrnxzz.rokubar",
		},
		Windows: application.WindowsOptions{
			DisableQuitOnLastWindowClosed: true,
			WebviewUserDataPath:           filepath.Join(directory, "webview"),
		},
	})

	backend, err := server.NewServer(server.Config{
		Store: televisionStore{
			path: filepath.Join(directory, "tv.json"),
		},
		Events: app.Event,
	})
	if err != nil {
		return err
	}
	defer backend.Close()

	routes.Handle("/v1/", backend)

	panel := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:            "panel",
		Title:           "Rokubar",
		Width:           360,
		Height:          640,
		Frameless:       true,
		AlwaysOnTop:     true,
		URL:             "/#" + config.Page,
		Hidden:          true,
		DisableResize:   true,
		HideOnFocusLost: !config.Show,
		BackgroundType:  application.BackgroundTypeTranslucent,
		Windows: application.WindowsWindow{
			BackdropType:    application.Acrylic,
			Theme:           application.Dark,
			HiddenOnTaskbar: true,
		},
	})

	panel.RegisterHook(events.Common.WindowClosing, func(event *application.WindowEvent) {
		panel.Hide()
		event.Cancel()
	})

	menu := application.NewMenu()
	menu.Add("Open Rokubar").OnClick(func(*application.Context) {
		panel.Show().Focus()
	})
	menu.AddSeparator()
	menu.Add("Quit Rokubar").OnClick(func(*application.Context) {
		app.Quit()
	})

	icon := app.SystemTray.New()
	icon.SetIcon(trayIcon)
	icon.SetTooltip("Rokubar")
	icon.SetMenu(menu)
	icon.AttachWindow(panel).WindowOffset(8)

	app.Event.OnApplicationEvent(events.Common.ApplicationStarted, func(*application.ApplicationEvent) {
		// The first run opens the panel at the tray, where pairing starts.
		if config.Show || !backend.Paired() {
			icon.ShowWindow()
		}
	})

	return app.Run()
}
