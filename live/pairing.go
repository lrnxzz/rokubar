package live

import (
	"context"
	"slices"
	"sync"

	"github.com/lrnxzz/rokubar/roku"
)

func (c *connection) Search(ctx context.Context) ([]State, error) {
	devices, err := roku.Discover(ctx)
	if err != nil {
		return nil, err
	}

	found := make([]State, len(devices))

	var lookups sync.WaitGroup

	for index, device := range devices {
		found[index].Device = device

		lookups.Go(func() {
			if candidate, err := newLink(device); err == nil {
				found[index] = candidate.describe(ctx)
			}
		})
	}

	lookups.Wait()

	c.mu.Lock()
	defer c.mu.Unlock()

	c.found = make(map[string]roku.Device, len(devices))

	for _, device := range devices {
		c.found[device.Serial] = device
	}

	return found, nil
}

func (c *connection) Pair(serial string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	device, ok := c.found[serial]
	if !ok {
		return ErrNotFound
	}

	paired, err := newLink(device)
	if err != nil {
		return err
	}

	if err := c.config.Store.Save(device); err != nil {
		return err
	}

	c.pair(paired)

	return nil
}

func (c *connection) Forget() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if err := c.config.Store.Clear(); err != nil {
		return err
	}

	c.paired = nil
	c.state.Set(State{})

	return nil
}

func (c *connection) Client() (roku.Client, error) {
	paired, err := c.current()
	if err != nil {
		return nil, err
	}

	return paired.client, nil
}

func (c *connection) TurnOn(ctx context.Context) error {
	paired, err := c.current()
	if err != nil {
		return err
	}

	defer c.Refresh()

	device, err := roku.TurnOn(ctx, paired.device)
	if err != nil {
		return err
	}

	return c.follow(paired, device)
}

func (c *connection) recall() (*link, error) {
	device, err := c.config.Store.Load()
	if err != nil {
		return nil, err
	}

	return newLink(device)
}

// pair makes paired the TV this connection follows. The caller holds mu.
func (c *connection) pair(paired *link) {
	c.paired = paired
	c.state.Set(State{
		Device:     paired.device,
		Connecting: true,
	})
	c.Refresh()
}

func (c *connection) current() (*link, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.paired == nil {
		return nil, ErrNotPaired
	}

	return c.paired, nil
}

// find searches the network for the paired TV and follows it to the address it answers on.
func (c *connection) find(paired *link) (*link, error) {
	devices, err := roku.Discover(c.ctx)
	if err != nil {
		return nil, err
	}

	index := slices.IndexFunc(devices, paired.is)
	if index < 0 {
		return nil, ErrNotFound
	}

	if err := c.follow(paired, devices[index]); err != nil {
		return nil, err
	}

	return c.current()
}

func (c *connection) follow(paired *link, device roku.Device) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.paired != paired {
		return ErrNotPaired
	}

	moved, err := paired.moveTo(device)
	if err != nil {
		return err
	}

	c.paired = moved

	if err := c.config.Store.Save(moved.device); err != nil {
		c.logger.Error("Failed to remember the TV's new address", "host", device.Host, "error", err)
	}

	return nil
}
