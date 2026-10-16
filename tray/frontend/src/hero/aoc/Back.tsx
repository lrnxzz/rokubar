import { useMemo } from "react";

import { Part } from "../assembly";
import { materials as m } from "../materials";
import { Box, Cylinder } from "../shapes";
import { label } from "../textures";
import { barTop, bottom, bulge, deep, floor, halfW, top, vesa, W } from "./dimensions";

const screws = [
  [-440, 250, -24.3],
  [-440, -160, -24.3],
  [440, 250, -24.3],
  [440, -160, -24.3],
  [-200, 250, -24.3],
  [300, 250, -24.3],
  [-70, 150, bulge.back - 0.3],
  [225, 150, bulge.back - 0.3],
  [-70, -176, bulge.back - 0.3],
  [225, -176, bulge.back - 0.3],
];

/** The rear cover with its bulge, vents and rating plate, and the stand. */
export function Back({ modelNumber }: { modelNumber: string }) {
  const rating = useMemo(
    () =>
      label(["ΛOC  LED TV · Roku TV", `Model ${modelNumber}`, '43" · 1920 × 1080', "100–240 V~ 50/60 Hz"], 110, 52, {
        font: "500 7px 'Segoe UI', sans-serif",
        color: "#2a2a2c",
        align: "left",
        background: "#d9d9d6",
      }),
    [modelNumber],
  );

  return (
    <>
      <Part id="cover" offset={[0, 0, -285]}>
        <Box size={[390.95, top - 1 - barTop, 2]} at={[(-halfW + 1 + bulge.left) / 2, (top - 1 + barTop) / 2, -23]} material={m.plastic} />
        <Box
          size={[halfW - 1 - bulge.right, top - 1 - barTop, 2]}
          at={[(halfW - 1 + bulge.right) / 2, (top - 1 + barTop) / 2, -23]}
          material={m.plastic}
        />
        <Box size={[bulge.right - bulge.left, top - 1 - bulge.top, 2]} at={[vesa.x, (top - 1 + bulge.top) / 2, -23]} material={m.plastic} />
        <Box size={[W, 2, 18]} at={[0, top - 1, -14]} material={m.plastic} />
        <Box size={[2, top - barTop, 18]} at={[-halfW + 1, (top + barTop) / 2, -14]} material={m.plastic} />
        <Box size={[2, top - barTop, 18]} at={[halfW - 1, (top + barTop) / 2, -14]} material={m.plastic} />

        <Box size={[bulge.right - bulge.left, bulge.top - bulge.bottom, 2]} at={[vesa.x, vesa.y, bulge.back + 1]} material={m.plastic} />
        <Box size={[bulge.right - bulge.left, 2, 44]} at={[vesa.x, bulge.top - 1, -46]} material={m.plastic} />
        <Box size={[bulge.right - bulge.left, 2, 44]} at={[vesa.x, bulge.bottom + 1, -46]} material={m.plastic} />
        <Box size={[2, bulge.top - bulge.bottom, 44]} at={[bulge.right - 1, vesa.y, -46]} material={m.plastic} />
        <Box size={[2, bulge.top - 128, 44]} at={[bulge.left + 1, (bulge.top + 128) / 2, -46]} material={m.plastic} />
        <Box size={[2, -62 - bulge.bottom, 44]} at={[bulge.left + 1, (-62 + bulge.bottom) / 2, -46]} material={m.plastic} />
        <Box size={[2, 190, 3]} at={[bulge.left + 1, 33, -25.5]} material={m.plastic} />
        <Box size={[2, 190, 21]} at={[bulge.left + 1, 33, -57.5]} material={m.plastic} />

        <Box size={[W - 2, barTop - bottom, 2]} at={[0, (bottom + barTop) / 2, -deep + 1]} material={m.plastic} />
        <Box size={[W - 2, 2, deep - 24]} at={[0, barTop, -(deep + 24) / 2]} material={m.plastic} />
        <Box size={[W - 2, 2, deep - 5]} at={[0, bottom + 1, -(deep + 5) / 2]} material={m.plastic} />
        <Box size={[2, barTop - bottom, deep - 5]} at={[-halfW + 1, (bottom + barTop) / 2, -(deep + 5) / 2]} material={m.plastic} />
        <Box size={[2, barTop - bottom, deep - 5]} at={[halfW - 1, (bottom + barTop) / 2, -(deep + 5) / 2]} material={m.plastic} />

        {[-1, 1].flatMap((sx) =>
          [-1, 1].map((sy) => (
            <Cylinder
              key={`${sx} ${sy}`}
              radius={5}
              length={0.6}
              axis="z"
              at={[vesa.x + sx * 100, vesa.y + sy * 100, bulge.back - 0.1]}
              material={m.recess}
            />
          )),
        )}
        {[50, 100].map((x) => (
          <group key={x}>
            <Box size={[40, 46, 0.6]} at={[x, 118, bulge.back - 0.1]} material={m.recess} />
            {[-15, -5, 5, 15].map((dy) => (
              <Box key={dy} size={[40, 3, 1]} at={[x, 118 + dy, bulge.back - 0.3]} material={m.plastic} />
            ))}
          </group>
        ))}
        <Box size={[140, 50, 0.6]} at={[35, -125, bulge.back - 0.1]} material={m.recess} />

        {[
          [-255, -400, -110],
          [332, 255, 410],
        ].map(([x = 0, left = 0, right = 0]) => (
          <group key={x}>
            <Box size={[right - left, 4, 3]} at={[x, 130, -25.5]} material={m.plastic} />
            <Box size={[right - left, 4, 3]} at={[x, -180, -25.5]} material={m.plastic} />
            <Box size={[4, 310, 3]} at={[left, -25, -25.5]} material={m.plastic} />
            <Box size={[4, 310, 3]} at={[right, -25, -25.5]} material={m.plastic} />
          </group>
        ))}

        {screws.map(([x = 0, y = 0, z = 0]) => (
          <Cylinder key={`${x} ${y}`} radius={2.6} length={0.8} axis="z" at={[x, y, z]} material={m.steel} />
        ))}

        <mesh position={[340, 30, -24.15]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[110, 52]} />
          <meshStandardMaterial map={rating} roughness={0.8} />
        </mesh>

        <Box size={[0.6, 14, 9]} at={[-halfW - 0.3, -240, -50]} material={m.recess} />
        {[-380, 380].map((x) => (
          <Cylinder key={x} radius={5} length={0.6} axis="z" at={[x, -235, -deep - 0.1]} material={m.recess} />
        ))}
        {[-330, 330].map((x) => (
          <Box key={x} size={[100, 0.5, 22]} at={[x, bottom - 0.1, -50]} material={m.recess} />
        ))}
        <Box size={[36, 10, 12]} at={[90, bottom + 8, -deep - 6]} material={m.plastic} />
      </Part>

      <Part id="stand" offset={[0, -150, 0]}>
        {[-372, 372].map((x) => (
          <group key={x}>
            <Box size={[46, 16, 36]} at={[x, bottom - 8, -43]} material={m.plasticGloss} />
            <Box size={[12, 8, 116]} at={[x, -309.6, 13]} rotation={[0.22, 0, 0]} material={m.plasticGloss} />
            <Box size={[12, 8, 116]} at={[x, -309.6, -99]} rotation={[-0.22, 0, 0]} material={m.plasticGloss} />
            <Cylinder radius={6} length={3} axis="y" at={[x, floor + 1.5, 68]} material={m.rubber} />
            <Cylinder radius={6} length={3} axis="y" at={[x, floor + 1.5, -154]} material={m.rubber} />
            <Cylinder radius={2.2} length={14} axis="y" at={[x - 12, bottom - 2, -43]} material={m.steel} />
            <Cylinder radius={2.2} length={14} axis="y" at={[x + 12, bottom - 2, -43]} material={m.steel} />
          </group>
        ))}
      </Part>
    </>
  );
}
