import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { type ReactNode, useRef, useState } from "react";

import type { Television as State } from "../api/types.gen";
import { Aoc43S5155 } from "./aoc/Aoc43S5155";
import { isAoc43S5155 } from "./aoc/dimensions";
import { Assembly } from "./assembly";
import { CameraPad } from "./CameraPad";
import { type Camera, CameraRig } from "./CameraRig";
import { type CameraCommand, views } from "./camera";
import { glow } from "./glow";
import { Highlight } from "./Highlight";
import { Studio } from "./Studio";
import { Television } from "./Television";
import styles from "./TvHero.module.css";

export type TvHeroProps = {
  accent: string;
  lit: boolean;
  screen?: HTMLCanvasElement | null;
  state?: State;
  onHover?: (part: string | null) => void;
  controls?: boolean;
  children?: ReactNode;
};

/** The TV, turned by dragging and zoomed by scrolling; a TV Rokubar has a model of also comes apart into its parts. */
export function TvHero({ accent, lit, screen = null, state, onHover, controls = true, children }: TvHeroProps) {
  const still = useReducedMotion() ?? false;
  const [apart, setApart] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const camera = useRef<Camera>(null);
  const aoc = state && isAoc43S5155(state.hardware) ? state : null;

  const hover = (part: string | null) => {
    setHovered(part);
    onHover?.(part);
  };

  const send = (command: CameraCommand) => camera.current?.send(command);

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: double-click is a pointer shortcut; the camera pad does the same from the keyboard. */}
      <div
        className={styles.hero}
        style={glow(lit)}
        title="Drag to turn · Right-drag to move · Scroll to zoom · Double-click a part to look at it"
        onDoubleClick={() =>
          send(
            hovered
              ? {
                  kind: "focus",
                  part: hovered,
                }
              : {
                  kind: "reset",
                },
          )
        }
      >
        <div className={styles.glow} />
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
          }}
          camera={{
            position: views.front.position.toArray(),
            fov: 20,
            near: 0.05,
            far: 60,
          }}
          onPointerMissed={() => hover(null)}
        >
          <Studio />
          {aoc ? (
            <Assembly apart={apart} onHover={hover}>
              {/* The AOC is modelled in millimetres; 0.003 makes it as wide as the generic TV and centres it with its feet. */}
              <group scale={0.003} position={[0, 0.066, 0]}>
                <Aoc43S5155
                  screen={screen}
                  on={lit}
                  accent={accent}
                  activeInput={aoc.app.type === "tvin" ? aoc.app.id : null}
                  modelNumber={aoc.hardware.modelNumber}
                />
              </group>
            </Assembly>
          ) : (
            <Television accent={accent} lit={lit} screen={screen} />
          )}
          <Highlight part={hovered} accent={accent} />
          {/* Left drag turns all the way around, right drag (or Shift + drag) moves, the wheel zooms. */}
          <OrbitControls
            makeDefault
            screenSpacePanning
            rotateSpeed={0.5}
            panSpeed={0.8}
            zoomSpeed={0.8}
            dampingFactor={0.12}
            minDistance={0.5}
            maxDistance={9}
          />
          <CameraRig ref={camera} apart={apart} still={still} />
        </Canvas>
        {children && <div className={styles.screen}>{children}</div>}
      </div>
      {state && controls && <CameraPad apart={aoc ? apart : null} onApart={() => setApart((current) => !current)} onCamera={send} />}
    </>
  );
}
