package server

import (
	"context"
	"fmt"
	"net/http"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/adaptor"

	"github.com/lrnxzz/rokubar/live"
	"github.com/lrnxzz/rokubar/server/internal/servicer"
	"github.com/lrnxzz/rokubar/server/internal/transporter"
)

type Server interface {
	// Handler answers the panel's requests under /v1. Wails hands the webview's requests over as net/http,
	// so the server is a net/http handler even though Fiber answers them.
	http.Handler

	Paired() bool
	Close() error
}

type Config struct {
	// Store remembers the paired TV between runs.
	Store live.Store

	// Events reaches the panel with the TV's state on every change, like Wails' app.Event.
	Events transporter.Emitter
}

func (c Config) Validate() error {
	if c.Store == nil {
		return fmt.Errorf("store is required")
	}

	if c.Events == nil {
		return fmt.Errorf("events are required")
	}

	return nil
}

type server struct {
	connection live.Connection
	handler    http.Handler
	publishing sync.WaitGroup
}

func NewServer(config Config) (Server, error) {
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("invalid server configuration: %w", err)
	}

	connection, err := live.Connect(live.Config{
		Store: config.Store,
	})
	if err != nil {
		return nil, err
	}

	televisionServicer := servicer.NewTelevisionServicer(connection)

	app := fiber.New(fiber.Config{
		AppName: "rokubar",
	})

	transporter.NewTelevisionTransporter(televisionServicer).Initialize(app)

	s := &server{
		connection: connection,
		handler:    adaptor.FiberApp(app),
	}

	s.publishing.Go(func() {
		transporter.NewEventTransporter(televisionServicer).Publish(context.Background(), config.Events)
	})

	return s, nil
}

func (s *server) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	s.handler.ServeHTTP(writer, request)
}

func (s *server) Paired() bool {
	return s.connection.State().Paired()
}

func (s *server) Close() error {
	err := s.connection.Close()
	s.publishing.Wait()

	return err
}
