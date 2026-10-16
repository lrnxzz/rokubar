import type * as THREE from "three";

import { Part } from "../assembly";
import { materials as m } from "../materials";
import { Box, Cylinder } from "../shapes";
import { bottom, H, hdmiRows, vesa, W } from "./dimensions";

const heatsinkFins = Array.from(
  {
    length: 8,
  },
  (_, index) => 40 - 17.5 + index * 5,
);

type InsideProps = {
  /** The input on screen, whose port lights in the accent color. */
  activeInput: string | null;
  port: THREE.Material;
};

/** What sits behind the panel: the chassis, the boards with their ports, and the speakers. */
export function Inside({ activeInput, port }: InsideProps) {
  return (
    <>
      <Part id="chassis">
        <Box size={[W - 8, H - 8, 0.8]} at={[0, 0, -19.4]} material={m.steel} />
        <Box size={[260, 14, 1.4]} at={[-300, 120, -20.5]} material={m.steel} />
        <Box size={[260, 14, 1.4]} at={[-300, -120, -20.5]} material={m.steel} />
        <Box size={[14, 300, 1.4]} at={[360, 0, -20.5]} material={m.steel} />
        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sy) => (
            <Cylinder
              key={`${sx} ${sy}`}
              radius={4.5}
              length={6}
              axis="z"
              at={[vesa.x + sx * 100, vesa.y + sy * 100, -23]}
              material={m.steel}
            />
          )),
        )}
        {[
          [-78, -68],
          [86, -68],
          [-78, 124],
          [86, 124],
          [106, -174],
          [226, -174],
          [106, 144],
          [226, 144],
        ].map(([x = 0, y = 0]) => (
          <Cylinder key={`${x} ${y}`} radius={2.4} length={7} axis="z" at={[x, y, -23.3]} material={m.aluminum} />
        ))}
      </Part>

      <Part id="mainboard" offset={[0, 0, -118]}>
        <Box size={[176, 205, 1.6]} at={[4, 27.5, -27.6]} material={m.pcb} />
        <Box size={[42, 42, 3]} at={[20, 40, -29.9]} material={m.aluminum} />
        {heatsinkFins.map((y) => (
          <Box key={y} size={[42, 2, 10]} at={[20, y, -36.4]} material={m.aluminum} />
        ))}
        <Box size={[14, 12, 1.2]} at={[62, 62, -29]} material={m.chip} />
        <Box size={[14, 12, 1.2]} at={[62, 32, -29]} material={m.chip} />
        <Box size={[13, 11, 1.2]} at={[62, 4, -29]} material={m.chip} />
        <Box size={[30, 5, 4]} at={[20, 124, -30.4]} material={m.white} />
        <Box size={[8, 5, 5]} at={[70, -68, -30.9]} material={m.white} />
        {[
          [-10, -42],
          [6, -42],
          [40, -52],
          [-40, -58],
        ].map(([x = 0, y = 0]) => (
          <Cylinder key={`${x} ${y}`} radius={3} length={6} axis="z" at={[x, y, -31.4]} material={m.aluminum} />
        ))}

        <Part id="wifi">
          <Box size={[24, 18, 3]} at={[-30, 100, -29.9]} material={m.aluminum} />
          <Cylinder radius={0.9} length={44} axis="y" at={[-36, 131, -31.6]} material={m.cable} />
          <Cylinder radius={0.9} length={44} axis="y" at={[-24, 131, -31.6]} material={m.cable} />
          <Box size={[20, 6, 1]} at={[-36, 154, -21]} material={m.chip} />
        </Part>

        <Part id="tuner">
          <Box size={[36, 28, 9]} at={[-52, 22, -33]} material={m.aluminum} />
        </Part>

        <Part id="lan">
          <Box size={[16, 14, 16]} at={[-88, 118, -36]} material={m.steel} />
          <Box size={[0.6, 9, 11]} at={[-96.3, 117, -36]} material={m.recess} />
        </Part>
        <Part id="optical">
          <Box size={[14, 9, 9]} at={[-89, 96, -36]} material={m.chip} />
          <Box size={[0.6, 4.5, 4.5]} at={[-96.3, 96, -36]} material={m.recess} />
        </Part>
        <Part id="headphone">
          <Cylinder radius={3.6} length={14} axis="x" at={[-89, 81, -36]} material={m.chip} />
          <Cylinder radius={1.8} length={0.6} axis="x" at={[-96.2, 81, -36]} material={m.recess} />
        </Part>
        <Part id="av">
          <Cylinder radius={3.6} length={14} axis="x" at={[-89, 68, -36]} material={m.chip} />
          <Cylinder radius={1.8} length={0.6} axis="x" at={[-96.2, 68, -36]} material={m.recess} />
        </Part>
        <Part id="usb">
          <Box size={[14, 6.5, 13.5]} at={[-89, 49, -36]} material={m.steel} />
          <Box size={[10, 1.8, 11]} at={[-90.5, 48.2, -36]} material={m.usb} />
        </Part>
        <Part id="rf">
          <Cylinder radius={6} length={3} axis="x" segments={6} at={[-83.5, 22, -36]} material={m.aluminum} />
          <Cylinder radius={4.8} length={12} axis="x" at={[-91, 22, -36]} material={m.aluminum} />
          <Cylinder radius={0.6} length={2} axis="x" at={[-97.5, 22, -36]} material={m.gold} />
          {activeInput === "tvinput.dtv" && <Cylinder radius={6.2} length={0.4} axis="x" at={[-97.3, 22, -36]} material={port} />}
        </Part>
        {Object.entries(hdmiRows).map(([id, y]) => (
          <Part key={id} id={id}>
            <Box size={[14, 6, 15.5]} at={[-89, y, -36]} material={m.steel} />
            <Box size={[0.6, 4.4, 13.5]} at={[-96.1, y, -36]} material={m.recess} />
            <Box size={[9, 1.4, 11]} at={[-91.5, y, -36]} material={m.chip} />
            {activeInput === `tvinput.${id}` && <Box size={[0.4, 7.6, 17.2]} at={[-96.6, y, -36]} material={port} />}
          </Part>
        ))}
      </Part>

      <Part id="power" offset={[0, 0, -118]}>
        <Box size={[132, 330, 1.6]} at={[166, -15, -27.6]} material={m.pcb} />
        {[140, 194].map((x) => (
          <group key={x}>
            <Cylinder radius={9} length={26} axis="z" at={[x, 60, -41.4]} material={m.chip} />
            <Cylinder radius={8.4} length={0.6} axis="z" at={[x, 60, -54.7]} material={m.aluminum} />
          </group>
        ))}
        <Box size={[26, 22, 20]} at={[166, 0, -38.4]} material={m.ferrite} />
        <Box size={[27, 11, 20.4]} at={[166, 0, -38.4]} material={m.tape} />
        <Box size={[18, 18, 16]} at={[200, 118, -36.4]} material={m.ferrite} />
        <Box size={[3, 60, 26]} at={[120, -60, -41.4]} material={m.aluminum} />
        <Box size={[10, 15, 4]} at={[126, -45, -36]} material={m.chip} />
        <Box size={[10, 15, 4]} at={[126, -76, -36]} material={m.chip} />
        {[
          [210, -30],
          [210, -58],
          [150, -112],
          [190, -112],
        ].map(([x = 0, y = 0]) => (
          <Cylinder key={`${x} ${y}`} radius={4} length={12} axis="z" at={[x, y, -34.4]} material={m.chip} />
        ))}
        <Cylinder radius={2.5} length={16} axis="y" at={[206, 144, -31]} material={m.aluminum} />
        <Box size={[14, 10, 8]} at={[214, -166, -32.4]} material={m.white} />
        <Box size={[12, 8, 6]} at={[120, 140, -31.4]} material={m.white} />
      </Part>

      <Part id="speakers" offset={[0, -45, -150]}>
        {[-330, 330].map((x) => (
          <group key={x}>
            <Box size={[120, 34, 44]} at={[x, bottom + 21, -50]} material={m.plastic} />
            {[-24, 24].map((dx) => (
              <group key={dx}>
                <Cylinder radius={14} length={1.4} axis="y" at={[x + dx, bottom + 3.5, -50]} material={m.rubber} />
                <Cylinder radius={9.5} length={1.6} axis="y" at={[x + dx, bottom + 3.3, -50]} material={m.ferrite} />
              </group>
            ))}
          </group>
        ))}
      </Part>
    </>
  );
}
