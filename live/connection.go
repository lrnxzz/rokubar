package live

import (
	"cmp"
	"context"
	"errors"
	"fmt"
	"iter"
	"log/slog"
	"sync"
	"time"

	"github.com/lrnxzz/rokubar/roku"
)

const (
	pollInterval = time.Second
	lostInterval = 10 * time.Second
)

var (
	// ErrNotPaired is returned by the methods that need a paired TV when there is none.
	ErrNotPaired = errors.New("no TV is paired")

	// ErrNotFound is returned by Pair for a serial the last Search didn't find.
	ErrNotFound = errors.New("TV not found")
)

// Connection is the link to the paired TV. It is safe for concurrent use.
type Connection interface {
	// State returns the paired TV's latest state, the zero State when no TV is paired.
	State() State

	// Watch yields the state now and then each change, until ctx ends or the connection closes. A slow
	// reader skips the states it missed and gets the latest.
	Watch(ctx context.Context) iter.Seq[State]

	// Refresh reads the TV's state at once instead of at the next poll, as after a command.
	Refresh()

	// Search finds the Rokus on the network, each with its state. Pair takes its serials.
	Search(ctx context.Context) ([]State, error)

	// Pair makes the TV the last Search found with serial the paired one, and saves it in the Store.
	Pair(serial string) error

	// Forget clears the Store and unpairs the TV.
	Forget() error

	// Client returns a client for the paired TV at the address it answers on now. Take a new one for each
	// command, since the TV may move.
	Client() (roku.Client, error)

	// TurnOn turns the paired TV on with [roku.TurnOn], and follows it if it wakes on another address.
	TurnOn(ctx context.Context) error

	// Close stops reading the TV and ends every Watch.
	Close() error
}

// Store remembers the paired TV between runs, wherever the application keeps it. A connection never
// calls its Store concurrently.
type Store interface {
	// Load returns the remembered TV, and any error when there is none.
	Load() (roku.Device, error)

	// Save remembers device, replacing the one remembered. It's called on Pair and whenever the TV moves.
	Save(device roku.Device) error

	// Clear forgets the remembered TV, and does nothing when there is none.
	Clear() error
}

type Config struct {
	Store  Store
	Logger *slog.Logger
}

// Validate returns an error when Store is nil.
func (c Config) Validate() error {
	if c.Store == nil {
		return fmt.Errorf("store is required")
	}

	return nil
}

// State is what a TV is doing, as last read.
type State struct {
	Device roku.Device

	// Connecting is true from Pair or Connect until the TV is first read.
	Connecting bool

	// Reachable reports whether the TV answered the last read. When it didn't, only Device is set.
	Reachable bool

	Info roku.DeviceInfo

	// Active, Player and Audio are read only while the TV is on, and stay zero when the TV refuses
	// them, as in Limited mode.
	Active roku.ActiveApp
	Player roku.MediaPlayer

	// Audio is zero when the TV doesn't answer audio-device, since a TV at volume 0 reports itself muted.
	Audio roku.Audio
}

// Paired reports whether the state has a TV, unlike the zero State of a connection with none paired.
func (s State) Paired() bool {
	return s.Device.Serial != ""
}

type connection struct {
	config Config
	logger *slog.Logger
	ctx    context.Context
	cancel context.CancelFunc
	loop   sync.WaitGroup
	timer  *time.Timer
	state  *latest[State]

	mu     sync.Mutex
	paired *link
	found  map[string]roku.Device
}

// Connect starts a connection with the TV config.Store remembers, or with none when it remembers none.
// It returns at once and reads the TV in the background, until Close.
func Connect(config Config) (Connection, error) {
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("invalid connection configuration: %w", err)
	}

	ctx, cancel := context.WithCancel(context.Background())

	c := &connection{
		config: config,
		logger: cmp.Or(config.Logger, slog.Default()),
		ctx:    ctx,
		cancel: cancel,
		timer:  time.NewTimer(0),
		state:  newLatest(ctx, State{}),
	}

	if paired, err := c.recall(); err == nil {
		c.pair(paired)
	}

	c.loop.Go(c.run)

	return c, nil
}

func (c *connection) State() State {
	return c.state.Get()
}

func (c *connection) Watch(ctx context.Context) iter.Seq[State] {
	return c.state.Watch(ctx)
}

func (c *connection) Refresh() {
	c.timer.Reset(0)
}

func (c *connection) Close() error {
	c.cancel()
	c.loop.Wait()

	return nil
}

func (c *connection) run() {
	defer c.timer.Stop()

	for c.wait() {
		c.timer.Reset(c.poll())
	}
}

func (c *connection) wait() bool {
	select {
	case <-c.timer.C:
		return true
	case <-c.ctx.Done():
		return false
	}
}

// poll publishes the paired TV's state and says when to poll again: at once if the TV changed meanwhile.
func (c *connection) poll() time.Duration {
	paired, state := c.describe()
	if !c.publish(paired, state) {
		return 0
	}

	if state.Reachable {
		return pollInterval
	}

	return lostInterval
}

// describe asks the paired TV for its state, and follows it when it no longer answers where it was.
func (c *connection) describe() (*link, State) {
	paired, err := c.current()
	if err != nil {
		return nil, State{}
	}

	state := paired.describe(c.ctx)
	if state.Reachable {
		return paired, state
	}

	if moved, err := c.find(paired); err == nil {
		return moved, moved.describe(c.ctx)
	}

	return paired, state
}

func (c *connection) publish(paired *link, state State) bool {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.paired != paired {
		return false
	}

	c.state.Set(state)

	return true
}
