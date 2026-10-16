import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

/** The picture on the panel, from the canvas useScreen draws. */
export function usePicture(screen: HTMLCanvasElement | null): THREE.CanvasTexture | null {
  const invalidate = useThree((state) => state.invalidate);

  const picture = useMemo(() => {
    if (!screen) {
      return null;
    }

    const texture = new THREE.CanvasTexture(screen);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;

    return texture;
  }, [screen]);

  useEffect(() => {
    invalidate();

    return () => picture?.dispose();
  }, [picture, invalidate]);

  return picture;
}
