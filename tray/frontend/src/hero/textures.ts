import * as THREE from "three";

function canvasTexture(width: number, height: number, draw: (context: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (context) {
    draw(context);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

export function gradientTexture(
  width: number,
  height: number,
  stops: [number, string][],
  direction: [number, number],
): THREE.CanvasTexture {
  return canvasTexture(width, height, (context) => {
    const gradient = context.createLinearGradient(0, 0, width * direction[0], height * direction[1]);
    for (const [offset, color] of stops) {
      gradient.addColorStop(offset, color);
    }

    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  });
}

type LabelStyle = {
  font: string;
  color: string;
  align?: CanvasTextAlign;
  background?: string;
};

/** Text printed on the body, drawn at eight pixels per model unit so it stays sharp up close. */
export function label(lines: string[], width: number, height: number, style: LabelStyle): THREE.CanvasTexture {
  const scale = 8;
  const texture = canvasTexture(Math.round(width * scale), Math.round(height * scale), (context) => {
    if (style.background) {
      context.fillStyle = style.background;
      context.fillRect(0, 0, width * scale, height * scale);
    }

    context.scale(scale, scale);
    context.fillStyle = style.color;
    context.font = style.font;
    context.textAlign = style.align ?? "center";
    context.textBaseline = "middle";

    const x = style.align === "left" ? 2 : width / 2;
    lines.forEach((line, index) => {
      context.fillText(line, x, (height / lines.length) * (index + 0.5));
    });
  });
  texture.anisotropy = 4;

  return texture;
}
