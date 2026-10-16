import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { createContext, type ReactNode, type RefObject, use, useEffect, useRef } from "react";
import * as THREE from "three";

import type { Vector } from "./shapes";

type AssemblyState = {
  /** How far apart the parts are, from 0 assembled to 1 exploded; read every frame. */
  apart: RefObject<number>;
  onHover?: (id: string | null) => void;
};

const AssemblyContext = createContext<AssemblyState>({
  apart: {
    current: 0,
  },
});

type AssemblyProps = {
  apart: boolean;
  onHover?: (id: string | null) => void;
  children: ReactNode;
};

/** Eases the parts apart or back together, rendering frames only while they move. */
export function Assembly({ apart, onHover, children }: AssemblyProps) {
  const amount = useRef(0);
  const invalidate = useThree((state) => state.invalidate);

  // Frames only render on demand, so a new pose asks for the first one and useFrame keeps asking until it's reached.
  // biome-ignore lint/correctness/useExhaustiveDependencies: apart is what changes the pose.
  useEffect(() => {
    invalidate();
  }, [apart, invalidate]);

  useFrame((_, delta) => {
    const target = apart ? 1 : 0;
    amount.current = THREE.MathUtils.damp(amount.current, target, 5, delta);

    if (Math.abs(amount.current - target) > 0.001) {
      invalidate();
    } else {
      amount.current = target;
    }
  });

  return (
    <AssemblyContext
      value={{
        apart: amount,
        onHover,
      }}
    >
      {children}
    </AssemblyContext>
  );
}

type PartProps = {
  id: string;
  /** Where the part moves, in the model's units, once the assembly is fully apart. */
  offset?: Vector;
  children: ReactNode;
};

/** A part that can be pointed at and that moves out by its offset as the assembly comes apart. */
export function Part({ id, offset = [0, 0, 0], children }: PartProps) {
  const { apart, onHover } = use(AssemblyContext);
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    group.current?.position.set(offset[0] * apart.current, offset[1] * apart.current, offset[2] * apart.current);
  });

  const hover = (event: ThreeEvent<PointerEvent>, part: string | null) => {
    event.stopPropagation();
    onHover?.(part);
  };

  return (
    <group
      ref={group}
      name={id}
      onPointerOver={onHover && ((event) => hover(event, id))}
      onPointerOut={onHover && ((event) => hover(event, null))}
    >
      {children}
    </group>
  );
}
