import * as THREE from "three";

export type View = {
  position: THREE.Vector3;
  target: THREE.Vector3;
};

// Straight on while assembled; from the front left and a little above while apart, so the layers and the port side show.
export const views: Record<"front" | "apart", View> = {
  front: {
    position: new THREE.Vector3(0, -0.06, 5.8),
    target: new THREE.Vector3(0, -0.06, 0),
  },
  apart: {
    position: new THREE.Vector3(-4.6, 2.2, 5.9),
    target: new THREE.Vector3(0, -0.06, 0),
  },
};

// Moving sideways keeps the point the camera looks at on the TV, so it can't drift off into empty space.
export const reach = new THREE.Box3(new THREE.Vector3(-1.6, -1.1, -1), new THREE.Vector3(1.6, 0.9, 1));

export type CameraCommand =
  | {
      kind: "reset";
    }
  | {
      kind: "zoom";
      factor: number;
    }
  | {
      kind: "focus";
      part: string;
    }
  | {
      kind: "move";
      right: number;
      up: number;
    }
  | {
      kind: "turn";
      angle: number;
    };

/** Where a command takes the camera from a view, or null when it names a part the scene doesn't have. */
export function aim(command: CameraCommand, from: View, rest: View, up: THREE.Vector3, scene: THREE.Scene): View | null {
  const offset = from.position.clone().sub(from.target);

  switch (command.kind) {
    case "reset":
      return rest;
    case "zoom":
      offset.setLength(THREE.MathUtils.clamp(offset.length() * command.factor, 0.5, 9));

      return {
        position: from.target.clone().add(offset),
        target: from.target.clone(),
      };
    case "move": {
      // A step is a fifth of the distance to the TV, so it feels the same zoomed in or out.
      const right = new THREE.Vector3().crossVectors(up, offset).normalize();
      const above = new THREE.Vector3().crossVectors(offset, right).normalize();
      const target = from.target
        .clone()
        .addScaledVector(right, command.right * offset.length() * 0.2)
        .addScaledVector(above, command.up * offset.length() * 0.2);
      reach.clampPoint(target, target);

      return {
        position: target.clone().add(offset),
        target,
      };
    }
    case "turn": {
      const azimuth = Math.atan2(offset.x, offset.z) + command.angle;
      const flat = Math.hypot(offset.x, offset.z);
      offset.set(flat * Math.sin(azimuth), offset.y, flat * Math.cos(azimuth));

      return {
        position: from.target.clone().add(offset),
        target: from.target.clone(),
      };
    }
    case "focus": {
      const part = scene.getObjectByName(command.part);
      if (!part) {
        return null;
      }

      // Close enough that a port fills a good share of the view, never closer than half a unit.
      const box = new THREE.Box3().setFromObject(part);
      const center = reach.clampPoint(box.getCenter(new THREE.Vector3()), new THREE.Vector3());
      const distance = THREE.MathUtils.clamp(box.getSize(new THREE.Vector3()).length() * 2.5, 0.5, 3);

      return {
        position: center.clone().add(offset.setLength(distance)),
        target: center,
      };
    }
  }
}
