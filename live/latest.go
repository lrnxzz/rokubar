package live

import (
	"context"
	"iter"
	"reflect"
	"sync"
)

// latest is a value that changes over time, for anyone watching it until ctx ends.
type latest[T any] struct {
	ctx     context.Context
	mu      sync.Mutex
	value   T
	changed chan struct{}
}

func newLatest[T any](ctx context.Context, value T) *latest[T] {
	return &latest[T]{
		ctx:     ctx,
		value:   value,
		changed: make(chan struct{}),
	}
}

func (l *latest[T]) Get() T {
	value, _ := l.subscribe()

	return value
}

func (l *latest[T]) Set(value T) {
	l.Update(func(T) T {
		return value
	})
}

func (l *latest[T]) Update(change func(current T) T) {
	l.mu.Lock()
	defer l.mu.Unlock()

	if next := change(l.value); !reflect.DeepEqual(next, l.value) {
		l.value = next

		close(l.changed)
		l.changed = make(chan struct{})
	}
}

// Watch yields the value, then each new one. A slow reader skips the ones it missed.
func (l *latest[T]) Watch(ctx context.Context) iter.Seq[T] {
	return func(yield func(T) bool) {
		value, changed := l.subscribe()

		for yield(value) && l.wait(ctx, changed) {
			value, changed = l.subscribe()
		}
	}
}

func (l *latest[T]) wait(ctx context.Context, changed <-chan struct{}) bool {
	select {
	case <-changed:
		return true
	case <-ctx.Done():
		return false
	case <-l.ctx.Done():
		return false
	}
}

func (l *latest[T]) subscribe() (T, <-chan struct{}) {
	l.mu.Lock()
	defer l.mu.Unlock()

	return l.value, l.changed
}
