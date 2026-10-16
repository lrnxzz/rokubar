import { openApp, useApps } from "../../apps/apps";
import { useFavorites } from "../../apps/favorites";
import { press, usePower } from "../../television/commands";
import { type Direction, Key } from "../../television/keys";
import { useTelevision } from "../../television/television";
import { ButtonRow, PanelButton } from "../../ui/Button";
import { Icon } from "../../ui/Icon";
import { KeyboardCard } from "./KeyboardCard";
import { RokuRemote } from "./RokuRemote";

type RemotePageProps = {
  lit: Direction | null;
  onDirection: (direction: Direction) => void;
};

export function RemotePage({ lit, onDirection }: RemotePageProps) {
  const state = useTelevision();
  const power = usePower();
  const { launchable } = useApps();
  const favorites = useFavorites();

  if (!state) {
    return null;
  }

  // The remote's four app keys: favorites first, then the apps in the TV's order.
  const shortcuts = [...launchable.filter((app) => favorites.includes(app.id)), ...launchable.filter((app) => !favorites.includes(app.id))];

  return (
    <>
      <RokuRemote
        lit={lit}
        shortcuts={shortcuts}
        waking={power.waking}
        onPress={press}
        onDirection={onDirection}
        onPower={power.toggle}
        onLaunch={(app) => void openApp(app)}
      />

      {state.isTv && (
        <ButtonRow>
          <PanelButton label="Channel down" onPress={() => press(Key.ChannelDown)} repeat>
            <Icon name="chevron_down" size={16} />
            Channel −
          </PanelButton>
          <PanelButton label="Channel up" onPress={() => press(Key.ChannelUp)} repeat>
            <Icon name="chevron_up" size={16} />
            Channel +
          </PanelButton>
        </ButtonRow>
      )}

      <KeyboardCard />
    </>
  );
}
