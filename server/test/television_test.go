package test

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"

	"github.com/lrnxzz/rokubar/server/api"
)

func Test_Integration_Television_RefusesCommandsBeforePairing(t *testing.T) {
	backend, _ := startServer(t)

	if status, body := send(t, backend, fiber.MethodPost, "/v1/television/keys/Home", ""); status != fiber.StatusConflict {
		t.Errorf("Expected 409 pressing a key with no TV paired, got %d %s", status, body)
	}

	if status, body := send(t, backend, fiber.MethodGet, "/v1/television", ""); status != fiber.StatusOK || !strings.Contains(body, `"paired":false`) {
		t.Errorf("Expected no TV paired, got %d %s", status, body)
	}

	if status, body := send(t, backend, fiber.MethodPost, "/v1/televisions/X04000AJS65H/pair", ""); status == fiber.StatusOK || body != "TV not found" {
		t.Errorf("Expected pairing a TV no search found refused, got %d %s", status, body)
	}
}

func Test_Integration_Television_PairsAndCommandsTheTelevision(t *testing.T) {
	device := startBrsNode(t)
	backend, _ := startServer(t)

	if status, body := send(t, backend, fiber.MethodGet, "/v1/televisions", ""); status != fiber.StatusOK || !strings.Contains(body, device.Serial) {
		t.Fatalf("Expected %s in the search, got %d %s", device.Serial, status, body)
	}

	if status, body := send(t, backend, fiber.MethodPost, "/v1/televisions/"+device.Serial+"/pair", ""); status != fiber.StatusOK {
		t.Fatalf("Expected %s paired, got %d %s", device.Serial, status, body)
	}

	if status, body := send(t, backend, fiber.MethodGet, "/v1/television", ""); status != fiber.StatusOK || !strings.Contains(body, `"paired":true`) {
		t.Errorf("Expected %s paired, got %d %s", device.Serial, status, body)
	}

	status, body := send(t, backend, fiber.MethodGet, "/v1/television/apps", "")
	if status != fiber.StatusOK {
		t.Fatalf("Expected the apps, got %d %s", status, body)
	}

	var apps []api.App
	if err := json.Unmarshal([]byte(body), &apps); err != nil || len(apps) == 0 {
		t.Errorf("Expected brs-node to list its channel, got %s (%v)", body, err)
	}

	if status, body := send(t, backend, fiber.MethodPost, "/v1/television/keys/Home", ""); status != fiber.StatusOK {
		t.Errorf("Expected Home pressed, got %d %s", status, body)
	}

	if status, body := send(t, backend, fiber.MethodPost, "/v1/television/text", `{"text":""}`); status != fiber.StatusBadRequest {
		t.Errorf("Expected 400 typing no text, got %d %s", status, body)
	}

	if status, body := send(t, backend, fiber.MethodPut, "/v1/television/volume", `{"level":101}`); status != fiber.StatusBadRequest {
		t.Errorf("Expected 400 for a volume above 100, got %d %s", status, body)
	}

	if status, body := send(t, backend, fiber.MethodDelete, "/v1/television", ""); status != fiber.StatusOK {
		t.Errorf("Expected the TV forgotten, got %d %s", status, body)
	}

	if status, body := send(t, backend, fiber.MethodGet, "/v1/television", ""); !strings.Contains(body, `"paired":false`) {
		t.Errorf("Expected no TV paired after forgetting, got %d %s", status, body)
	}
}

func Test_Integration_Television_PublishesItsStateOnEveryChange(t *testing.T) {
	device := startBrsNode(t)
	backend, events := startServer(t)

	if status, body := send(t, backend, fiber.MethodGet, "/v1/televisions", ""); status != fiber.StatusOK {
		t.Fatalf("Expected the search, got %d %s", status, body)
	}

	if status, body := send(t, backend, fiber.MethodPost, "/v1/televisions/"+device.Serial+"/pair", ""); status != fiber.StatusOK {
		t.Fatalf("Expected %s paired, got %d %s", device.Serial, status, body)
	}

	timeout := time.After(10 * time.Second)

	for {
		select {
		case television := <-events:
			if television.Reachable && television.Serial == device.Serial {
				return
			}
		case <-timeout:
			t.Fatalf("Expected %s published reachable before the timeout", device.Serial)
		}
	}
}
