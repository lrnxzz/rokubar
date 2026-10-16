import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { accentColor } from "./materials";

/** A box around the part under the pointer, following it while the assembly moves. */
export function Highlight({ part, accent }: { part: string | null; accent: string }) {
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);
  const helper = useMemo(() => new THREE.Box3Helper(new THREE.Box3(), accentColor(accent)), [accent]);
  const drawn = useRef<THREE.Box3Helper>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new part needs a frame to draw its box.
  useEffect(() => {
    invalidate();
  }, [part, invalidate]);

  useFrame(() => {
    const object = part ? scene.getObjectByName(part) : undefined;

    if (drawn.current) {
      drawn.current.visible = Boolean(object);
    }

    if (drawn.current && object) {
      drawn.current.box.setFromObject(object);
    }
  });

  return <primitive ref={drawn} object={helper} />;
}
