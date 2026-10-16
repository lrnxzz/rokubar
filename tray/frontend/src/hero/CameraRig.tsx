import { useFrame, useThree } from "@react-three/fiber";
import { type Ref, useEffect, useImperativeHandle, useRef } from "react";
import type * as THREE from "three";

import { aim, type CameraCommand, reach, type View, views } from "./camera";

export type Camera = {
  send(command: CameraCommand): void;
};

type Controls = {
  target: THREE.Vector3;
  update(): void;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
};

type CameraRigProps = {
  apart: boolean;
  still: boolean;
  ref: Ref<Camera>;
};

/** Glides the camera and the point it turns around to where commands send it; dragging takes over at any time. */
export function CameraRig({ apart, still, ref }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const controls = useThree((state) => state.controls) as unknown as Controls | null;
  const invalidate = useThree((state) => state.invalidate);
  const goal = useRef<View | null>(null);
  const placed = useRef(false);
  const rest = views[apart ? "apart" : "front"];

  useEffect(() => {
    if (!controls) {
      return;
    }

    if (placed.current) {
      goal.current = rest;
    } else {
      camera.position.copy(rest.position);
      controls.target.copy(rest.target);
      controls.update();
      placed.current = true;
    }

    invalidate();
  }, [rest, controls, camera, invalidate]);

  useImperativeHandle(
    ref,
    () => ({
      send: (command) => {
        if (!controls) {
          return;
        }

        // Steps start from where a glide in progress is heading, so held buttons add up instead of falling short.
        const from = goal.current ?? {
          position: camera.position.clone(),
          target: controls.target.clone(),
        };

        goal.current = aim(command, from, rest, camera.up, scene) ?? goal.current;
        invalidate();
      },
    }),
    [controls, camera, scene, rest, invalidate],
  );

  useEffect(() => {
    if (!controls) {
      return;
    }

    const stop = () => {
      goal.current = null;
    };

    const clamp = () => {
      reach.clampPoint(controls.target, controls.target);
    };

    controls.addEventListener("start", stop);
    controls.addEventListener("change", clamp);

    return () => {
      controls.removeEventListener("start", stop);
      controls.removeEventListener("change", clamp);
    };
  }, [controls]);

  useFrame((_, delta) => {
    if (!goal.current || !controls) {
      return;
    }

    const step = still ? 1 : 1 - Math.exp(-4 * delta);
    camera.position.lerp(goal.current.position, step);
    controls.target.lerp(goal.current.target, step);
    controls.update();

    if (camera.position.distanceTo(goal.current.position) < 0.002 && controls.target.distanceTo(goal.current.target) < 0.002) {
      goal.current = null;
    } else {
      invalidate();
    }
  });

  return null;
}
