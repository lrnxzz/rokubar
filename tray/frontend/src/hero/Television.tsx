import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

import { accentColor } from "./materials";
import { gradientTexture } from "./textures";
import { usePicture } from "./usePicture";

const width = 3.2;
const height = 1.72;

const sheen = gradientTexture(
  512,
  276,
  [
    [0, "rgba(190, 205, 235, 0.42)"],
    [0.42, "rgba(120, 135, 165, 0.1)"],
    [0.43, "rgba(80, 90, 110, 0.03)"],
    [1, "rgba(0, 0, 0, 0)"],
  ],
  [0.55, 1],
);

const glint = gradientTexture(
  256,
  4,
  [
    [0, "rgba(255, 255, 255, 0)"],
    [0.5, "rgba(255, 255, 255, 1)"],
    [1, "rgba(255, 255, 255, 0)"],
  ],
  [1, 0],
);

type TelevisionProps = {
  accent: string;
  lit: boolean;
  screen: HTMLCanvasElement | null;
};

/** The TV drawn for models Rokubar has no template of. */
export function Television({ accent, lit, screen }: TelevisionProps) {
  const picture = usePicture(screen);
  const metal = <meshStandardMaterial color="#3b4049" metalness={0.85} roughness={0.32} envMapIntensity={1.1} />;

  return (
    <group>
      <RoundedBox args={[width, height, 0.06]} radius={0.012} smoothness={4}>
        {metal}
      </RoundedBox>

      <mesh position={[0, 0, 0.031]}>
        <planeGeometry args={[width - 0.05, height - 0.05]} />
        <meshPhysicalMaterial color="#020306" roughness={0.18} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={0.6} />
      </mesh>

      {picture && (
        <mesh position={[0, 0, 0.0315]}>
          <planeGeometry args={[width - 0.05, height - 0.05]} />
          <meshBasicMaterial map={picture} toneMapped={false} />
        </mesh>
      )}

      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[width - 0.05, height - 0.05]} />
        <meshBasicMaterial map={sheen} transparent depthWrite={false} />
      </mesh>

      {/* The accent strip under the screen, lit in the open app's color. */}
      <mesh position={[0, -height / 2 + 0.032, 0.033]}>
        <planeGeometry args={[1.5, 0.014]} />
        <meshBasicMaterial
          map={glint}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          color={accentColor(accent)}
          opacity={lit ? 1 : 0.25}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.38, -height / 2 - 0.07, -0.02]} rotation={[0, 0, side * 0.5]}>
          <boxGeometry args={[0.34, 0.028, 0.1]} />
          {metal}
        </mesh>
      ))}
    </group>
  );
}
