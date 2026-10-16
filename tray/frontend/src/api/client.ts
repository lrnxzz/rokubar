import type { Key } from "../television/keys";
import type { GetTelevisionResponse, ListAppsResponse, SearchTelevisionsResponse, SetVolumeRequest, TypeTextRequest } from "./requests.gen";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const answer = await response.text();
  if (!response.ok) {
    throw new Error(answer || response.statusText);
  }

  return (answer ? JSON.parse(answer) : undefined) as T;
}

const segment = encodeURIComponent;

export const api = {
  television: () => request<GetTelevisionResponse>("GET", "/television"),
  search: () => request<SearchTelevisionsResponse>("GET", "/televisions"),
  pair: (serial: string) => request<void>("POST", `/televisions/${segment(serial)}/pair`),
  forget: () => request<void>("DELETE", "/television"),

  press: (key: Key) => request<void>("POST", `/television/keys/${segment(key)}`),
  type: (text: string) => request<void>("POST", "/television/text", { text } satisfies TypeTextRequest),
  setVolume: (level: number) => request<void>("PUT", "/television/volume", { level } satisfies SetVolumeRequest),
  turnOn: () => request<void>("POST", "/television/power/on"),
  turnOff: () => request<void>("POST", "/television/power/off"),

  apps: () => request<ListAppsResponse>("GET", "/television/apps"),
  launch: (appId: string) => request<void>("POST", `/television/apps/${segment(appId)}/launch`),
};

export function iconUrl(appId: string): string {
  return `/v1/television/apps/${segment(appId)}/icon`;
}
