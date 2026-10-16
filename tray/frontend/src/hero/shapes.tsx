import type * as THREE from "three";

export type Vector = [number, number, number];

type MeshProps = {
  at: Vector;
  material: THREE.Material;
  rotation?: Vector;
};

export function Box({ size, at, material, rotation }: MeshProps & { size: Vector }) {
  return (
    <mesh position={at} rotation={rotation} material={material}>
      <boxGeometry args={size} />
    </mesh>
  );
}

const axes: Record<"x" | "y" | "z", Vector> = {
  x: [0, 0, Math.PI / 2],
  y: [0, 0, 0],
  z: [Math.PI / 2, 0, 0],
};

type CylinderProps = MeshProps & {
  radius: number;
  length: number;
  axis: "x" | "y" | "z";
  segments?: number;
};

export function Cylinder({ radius, length, axis, at, material, segments = 24 }: CylinderProps) {
  return (
    <mesh position={at} rotation={axes[axis]} material={material}>
      <cylinderGeometry args={[radius, radius, length, segments]} />
    </mesh>
  );
}
