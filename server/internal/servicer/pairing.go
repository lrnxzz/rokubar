package servicer

import (
	"context"
	"iter"

	"github.com/lrnxzz/rokubar/server/api"
)

func (s *televisionServicer) Television() api.Television {
	return newTelevision(s.connection.State())
}

func (s *televisionServicer) Watch(ctx context.Context) iter.Seq[api.Television] {
	return func(yield func(api.Television) bool) {
		for state := range s.connection.Watch(ctx) {
			if !yield(newTelevision(state)) {
				break
			}
		}
	}
}

func (s *televisionServicer) Search(ctx context.Context) ([]api.Television, error) {
	found, err := s.connection.Search(ctx)
	if err != nil {
		return nil, err
	}

	televisions := make([]api.Television, 0, len(found))

	for _, state := range found {
		televisions = append(televisions, newTelevision(state))
	}

	return televisions, nil
}

func (s *televisionServicer) Pair(serial string) error {
	return s.connection.Pair(serial)
}

func (s *televisionServicer) Forget() error {
	return s.connection.Forget()
}
