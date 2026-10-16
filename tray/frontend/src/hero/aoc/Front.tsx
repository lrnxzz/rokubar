import type * as THREE from "three";

import { Part } from "../assembly";
import { materials as m } from "../materials";
import { Box, Cylinder } from "../shapes";
import { label } from "../textures";
import { active, bottom, cell, chin, H, halfW, ledColumns, ledRows, lip, top, W } from "./dimensions";

const logo = label(["ΛOC"], 36, 7, {
  font: "700 6.2px 'Segoe UI Variable Display', 'Segoe UI', sans-serif",
  color: "#d4d4d8",
});

const roku = label(["Roku TV"], 26, 4.4, {
  font: "600 3.6px 'Segoe UI Variable Display', 'Segoe UI', sans-serif",
  color: "#c8c8cc",
});

const driverColumns = Array.from(
  {
    length: 8,
  },
  (_, index) => -385 + index * 110,
);

/** The face of the TV and the layers behind it, from the frame to the LED backlight. */
export function Front({ on, picture }: { on: boolean; picture: THREE.Texture | null }) {
  return (
    <>
      <Part id="bezel" offset={[0, 0, 300]}>
        <Box size={[W, lip, 8]} at={[0, top - lip / 2, -3.5]} material={m.plasticGloss} />
        <Box size={[lip, H - chin, 8]} at={[-halfW + lip / 2, chin / 2, -3.5]} material={m.plasticGloss} />
        <Box size={[lip, H - chin, 8]} at={[halfW - lip / 2, chin / 2, -3.5]} material={m.plasticGloss} />
        <Box size={[W, chin, 10]} at={[0, bottom + chin / 2, -4]} material={m.plasticGloss} />
        <mesh position={[0, bottom + chin / 2, 1.05]}>
          <planeGeometry args={[36, 7]} />
          <meshBasicMaterial map={logo} transparent />
        </mesh>
        <mesh position={[halfW - 40, bottom + chin / 2, 1.05]}>
          <planeGeometry args={[26, 4.4]} />
          <meshBasicMaterial map={roku} transparent />
        </mesh>

        <Part id="ir" offset={[0, -40, 0]}>
          <Box size={[52, 10, 18]} at={[277, bottom - 5, -7]} material={m.plasticGloss} />
          <Box size={[18, 5, 0.6]} at={[270, bottom - 5, 2.1]} material={m.glass} />
          <Cylinder radius={1.1} length={0.6} axis="z" at={[292, bottom - 5, 2.1]} material={on ? m.recess : m.standby} />
          <Cylinder radius={4} length={5} axis="y" at={[277, bottom - 12.5, -7]} material={m.rubber} />
          <Box size={[44, 1.2, 14]} at={[277, bottom - 3, -7]} material={m.pcb} />
        </Part>
      </Part>

      <Part id="panel" offset={[0, 0, 225]}>
        <Box size={[cell.w, cell.h, 1.6]} at={[0, cell.y, -1.3]} material={m.glass} />
        {picture && (
          <mesh position={[0, active.y, -0.45]}>
            <planeGeometry args={[active.w, active.h]} />
            <meshBasicMaterial map={picture} toneMapped={false} />
          </mesh>
        )}
        {driverColumns.map((x) => (
          <group key={x}>
            <Box size={[28, 10, 0.3]} at={[x, top - lip - 6.5, -2.3]} material={m.kapton} />
            <Box size={[12, 2.2, 0.6]} at={[x, top - lip - 6.5, -2.7]} material={m.chip} />
          </group>
        ))}
        <Box size={[880, 12, 1.4]} at={[0, top - lip - 18, -3.1]} material={m.pcb} />
        <Box size={[16, 8, 1]} at={[-150, top - lip - 18, -4.3]} material={m.chip} />
        <Box size={[16, 8, 1]} at={[150, top - lip - 18, -4.3]} material={m.chip} />
        <Box size={[22, 5, 3]} at={[0, top - lip - 18, -5.3]} material={m.white} />
      </Part>

      <Part id="frame" offset={[0, 0, 170]}>
        <Box size={[cell.w, 7, 4]} at={[0, cell.y + cell.h / 2 - 3.5, -4.5]} material={m.plastic} />
        <Box size={[cell.w, 7, 4]} at={[0, cell.y - cell.h / 2 + 3.5, -4.5]} material={m.plastic} />
        <Box size={[7, cell.h - 14, 4]} at={[-cell.w / 2 + 3.5, cell.y, -4.5]} material={m.plastic} />
        <Box size={[7, cell.h - 14, 4]} at={[cell.w / 2 - 3.5, cell.y, -4.5]} material={m.plastic} />
      </Part>

      <Part id="films" offset={[0, 0, 135]}>
        <Box size={[active.w + 6, active.h + 6, 0.25]} at={[0, active.y, -7.2]} material={m.film} />
        <Box size={[active.w + 6, active.h + 6, 0.25]} at={[0, active.y, -7.8]} material={m.film} />
      </Part>

      <Part id="diffuser" offset={[0, 0, 105]}>
        <Box size={[active.w + 8, active.h + 8, 1.5]} at={[0, active.y, -9.2]} material={m.diffuser} />
      </Part>

      <Part id="reflector" offset={[0, 0, 66]}>
        <Box size={[active.w + 8, active.h + 8, 0.3]} at={[0, active.y, -13.6]} material={m.white} />
        {ledRows.flatMap((row) =>
          ledColumns.map((column) => (
            <mesh key={`${row} ${column}`} position={[column, active.y + row, -13.4]} material={m.recess}>
              <circleGeometry args={[6.8, 20]} />
            </mesh>
          )),
        )}
      </Part>

      <Part id="backlight" offset={[0, 0, 34]}>
        {ledRows.map((row) => (
          <group key={row}>
            <Box size={[880, 10, 1]} at={[0, active.y + row, -17.6]} material={m.aluminum} />
            <Box size={[9, 8, 4]} at={[-446, active.y + row, -16.5]} material={m.white} />
            {ledColumns.map((column) => (
              <group key={column}>
                <Box size={[5, 5, 1.2]} at={[column, active.y + row, -16.5]} material={on ? m.led : m.white} />
                <mesh position={[column, active.y + row, -15.6]} scale={[1, 1, 0.55]} material={on ? m.led : m.lens}>
                  <sphereGeometry args={[6.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      </Part>
    </>
  );
}
