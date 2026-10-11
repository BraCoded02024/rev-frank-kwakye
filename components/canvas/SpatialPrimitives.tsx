"use client";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import * as THREE from "three";
type Point = [number, number, number];
const Materials = createContext<{ plaster: THREE.Texture; wood: THREE.Texture } | null>(null);

export function SpatialMaterials({ children }: { children: ReactNode }) {
  const textures = useMemo(() => {
    function make(wood: boolean) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext("2d")!;
      const pixels = ctx.createImageData(256, 256);
      let seed = 731;
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const noise = (seed / 4294967296 - 0.5) * (wood ? 9 : 16);
        const grain = wood ? Math.sin(x * 0.6 + Math.sin(y * 0.026) * 1.3) * 12 : Math.sin(x * 0.06) * Math.cos(y * 0.04) * 4;
        const shade = 235 + noise + grain;
        const i = (y * 256 + x) * 4;
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = shade;
        pixels.data[i + 3] = 255;
      }
      ctx.putImageData(pixels, 0, 0);
      const map = new THREE.CanvasTexture(canvas);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(wood ? 2 : 3, wood ? 1 : 3);
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 4;
      return map;
    }
    return { plaster: make(false), wood: make(true) };
  }, []);
  useEffect(() => () => { textures.plaster.dispose(); textures.wood.dispose(); }, [textures]);
  return <Materials.Provider value={textures}>{children}</Materials.Provider>;
}

export function Block({ at, size, color = "#e4ded2", rotation = [0, 0, 0], metal = false, wood = false }: { at: Point; size: Point; color?: string; rotation?: Point; metal?: boolean; wood?: boolean }) {
  const textures = useContext(Materials);
  const map = metal ? undefined : wood ? textures?.wood : textures?.plaster;
  return <mesh position={at} rotation={rotation} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={wood ? 0.018 : 0.025} roughness={metal ? 0.32 : wood ? 0.68 : 0.93} metalness={metal ? 0.65 : 0} /></mesh>;
}

/** Lettering is a texture on a real world-space plane, with perspective and occlusion. */
export function Inscription({ lines, at, width = 4, height = 1.5, color = "#3f4633", small = false, align = "center", rotation = [0, 0, 0] }: { lines: string[]; at: Point; width?: number; height?: number; color?: string; small?: boolean; align?: CanvasTextAlign; rotation?: Point }) {
  const text = lines.join("\n");
  const texture = useMemo(() => {
    const lines = text.split("\n");
    const canvas = document.createElement("canvas");
    canvas.width = 1536;
    canvas.height = Math.round(1536 * height / width);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    const row = canvas.height / (lines.length + 0.4);
    const fontSize = Math.min(row * (small ? 0.52 : 0.85), canvas.width / Math.max(...lines.map(l => l.length)) * (small ? 1.65 : 1.85));
    ctx.font = `${small ? "400" : "500"} ${fontSize}px ${small ? 'Arial, sans-serif' : 'Georgia, serif'}`;
    const x = align === "left" ? 10 : canvas.width / 2;
    lines.forEach((line, i) => ctx.fillText(line, x, canvas.height / 2 + (i - (lines.length - 1) / 2) * row, canvas.width - 20));
    const result = new THREE.CanvasTexture(canvas);
    result.colorSpace = THREE.SRGBColorSpace;
    result.anisotropy = 4;
    return result;
  }, [text, width, height, color, small, align]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={at} rotation={rotation}><planeGeometry args={[width, height]} /><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} /></mesh>;
}



