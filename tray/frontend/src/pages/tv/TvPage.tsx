import { useState } from "react";

import { useApps } from "../../apps/apps";
import { useFavorites } from "../../apps/favorites";
import { readAocPart } from "../../hero/aoc/readouts";
import { Hero } from "../../hero/Hero";
import { useScreen } from "../../hero/screen";
import { isOn, useTelevision } from "../../television/television";
import { FavoritesCard } from "./FavoritesCard";
import { HeroStatus } from "./HeroStatus";
import { heroStatus } from "./heroStatus";
import { InputsCard } from "./InputsCard";
import { LimitedBanner } from "./LimitedBanner";
import { PlaybackCard } from "./PlaybackCard";
import { VolumeCard } from "./VolumeCard";

export function TvPage({ accent, onApps }: { accent: string; onApps: () => void }) {
  const state = useTelevision();
  const { launchable, inputs } = useApps();
  const favorites = useFavorites();
  const [hovered, setHovered] = useState<string | null>(null);
  const screen = useScreen(state, [...inputs, ...launchable]);

  if (!state) {
    return null;
  }

  const on = isOn(state);
  const home = !state.app.id || state.app.type === "home";
  const playing = on && !home && ["play", "pause", "buffer"].includes(state.player.state);

  // The part under the pointer takes over the lines under the TV.
  const part = hovered ? readAocPart(hovered, state, inputs) : null;
  const status = part
    ? {
        live: true,
        label: part.name,
        source: "",
        line: part.detail,
      }
    : heroStatus(state);

  return (
    <>
      <div>
        <Hero accent={accent} lit={on} screen={screen} state={state} onHover={setHovered} />
        <HeroStatus status={status} />
      </div>

      {state.limited && <LimitedBanner />}
      {playing && <PlaybackCard player={state.player} />}
      <VolumeCard />
      <FavoritesCard apps={launchable} favorites={favorites} onSeeAll={onApps} />
      <InputsCard inputs={inputs} />
    </>
  );
}
