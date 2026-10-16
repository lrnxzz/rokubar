import { useMemo } from "react";
import * as THREE from "three";

import { accentColor } from "../materials";
import { usePicture } from "../usePicture";
import { Back } from "./Back";
import { Front } from "./Front";
import { Inside } from "./Inside";

type AocProps = {
  screen: HTMLCanvasElement | null;
  on: boolean;
  accent: string;
  activeInput: string | null;
  modelNumber: string;
};

export function Aoc43S5155({ screen, on, accent, activeInput, modelNumber }: AocProps) {
  const picture = usePicture(screen);
  const port = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: accentColor(accent),
      }),
    [accent],
  );

  return (
    <group>
      <Front on={on} picture={picture} />
      <Inside activeInput={activeInput} port={port} />
      <Back modelNumber={modelNumber} />
    </group>
  );
}
