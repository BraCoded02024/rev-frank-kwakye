"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Block, Inscription } from "./SpatialPrimitives";

type Point = [number, number, number];
const pieces: { at: Point; size: Point; offset: Point; gold?: boolean }[] = [
  ...[-1, 1].flatMap(side => [
    ...[0, 1, 2].map(i => ({ at: [side * 2.4, 1 + i * 1.85, 0] as Point, size: [0.65, 1.8, 0.9] as Point, offset: [side * (1.2 + i * 0.4), (i - 1) * 1.1, 1.5 + i * 0.65] as Point })),
    { at: [side * 2.05, 2.85, 0.5] as Point, size: [0.09, 5.65, 0.12] as Point, offset: [side * 2, 0.6, 3] as Point, gold: true },
    { at: [side * 2.85, 2.85, -0.1] as Point, size: [0.13, 5.9, 0.5] as Point, offset: [side * 1.5, -0.5, -1.5] as Point, gold: true },
    { at: [side * 1.4, 5.9, 0] as Point, size: [2.75, 0.5, 0.9] as Point, offset: [side * 1.6, 1.35, 1] as Point },
  ]),
  { at: [0, 6.25, 0.12], size: [5.9, 0.12, 1], offset: [0.4, 1.8, -1], gold: true },
  { at: [0, 0.05, 0.2], size: [5.9, 0.1, 1.5], offset: [-0.5, 0.6, 2], gold: true },
];

/** Scroll is the only animation clock: reversing scroll cleanly disassembles the portal. */
export function SacredAssembly() {
  const root = useRef<THREE.Group>(null);
  const fragments = useRef<(THREE.Group | null)[]>([]);
  const leaves = useRef<(THREE.Group | null)[]>([]);
  const aura = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef<THREE.PointLight>(null);
  const veil = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ scene, gl }) => {
    const p = scene.userData.travel ?? 0;
    if (root.current) root.current.visible = p < 0.16;
    if (p > 0.16) return;
    pieces.forEach((piece, index) => {
      const group = fragments.current[index];
      if (!group) return;
      const t = THREE.MathUtils.smootherstep(p, 0.004 + (index % 4) * 0.002, 0.042 + (index % 4) * 0.002);
      const remaining = 1 - t;
      group.position.set(piece.at[0] + piece.offset[0] * remaining, piece.at[1] + piece.offset[1] * remaining, piece.at[2] + piece.offset[2] * remaining);
      group.rotation.set(remaining * 0.16 * Math.sin(index), remaining * 0.24 * Math.cos(index), remaining * 0.12 * Math.sin(index * 2));
    });
    const assembly = THREE.MathUtils.smootherstep(p, 0.008, 0.048);
    const opening = THREE.MathUtils.smootherstep(p, 0.052, 0.079);
    if (veil.current) veil.current.opacity = 1 - THREE.MathUtils.smoothstep(p, 0.052, 0.078);
    leaves.current.forEach((leaf, index) => {
      if (!leaf) return;
      const side = index === 0 ? -1 : 1;
      leaf.position.set(side * (2 + (1 - assembly) * 0.75), (1 - assembly) * 0.4, -(1 - assembly) * 2);
      // Hinges swing into positive Z, toward the approaching camera.
      leaf.rotation.y = side * opening * Math.PI * 0.48;
    });
    const pulse = Math.exp(-Math.pow((p - 0.049) / 0.008, 2));
    if (aura.current) aura.current.opacity = 0.025 + pulse * 0.13;
    if (glow.current) glow.current.intensity = 12 + pulse * 35;
    gl.domElement.dataset.assembly = assembly.toFixed(3);
    gl.domElement.dataset.portalOpen = opening.toFixed(3);
  });
  return <group ref={root} position={[0, 0, -6]}>
    <mesh position={[0, 4, -2.5]}><planeGeometry args={[32, 20]} /><meshBasicMaterial ref={veil} color="#17130e" transparent depthWrite={false} toneMapped={false} /></mesh>
    <Block at={[0, -0.16, 5]} size={[22, 0.2, 30]} color="#272017" />
    {pieces.map((piece, index) => <group key={index} ref={node => { fragments.current[index] = node; }}>
      <Block at={[0, 0, 0]} size={piece.size} color={piece.gold ? "#d7b56b" : "#71604a"} metal={piece.gold} />
      {piece.gold && <mesh position={[0, 0, piece.size[2] / 2 + 0.01]}><planeGeometry args={[piece.size[0], piece.size[1]]} /><meshBasicMaterial color="#ffe0a0" toneMapped={false} /></mesh>}
    </group>)}
    {[-1, 1].map((side, index) => <group key={side} ref={node => { leaves.current[index] = node; }}>
      <Block at={[-side, 2.85, 0]} size={[1.98, 5.55, 0.22]} color="#3d3629" wood />
      <Block at={[-side, 2.85, 0.13]} size={[1.7, 5.24, 0.045]} color="#b69a60" metal />
      <Block at={[-side, 2.85, 0.17]} size={[1.57, 5.08, 0.04]} color="#22281e" />
      {[0, 1, 2, 3, 4].map(i => <Block key={i} at={[-side * (0.42 + i * 0.28), 2.85, 0.22]} size={[0.025, 4.8, 0.04]} color="#a78b51" metal />)}
      <Block at={[-side * 1.78, 2.8, 0.3]} size={[0.065, 0.75, 0.09]} color="#f2d594" metal />
    </group>)}
    <mesh position={[0, 3, -0.6]}><planeGeometry args={[7.2, 7.5]} /><meshBasicMaterial ref={aura} color="#ffca6e" transparent opacity={0.03} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    {[-1, 1].map(side => <mesh key={side} position={[side * 2.4, 3, 1]} rotation={[0, 0, side * 0.2]}><coneGeometry args={[1.4, 7, 4, 1, true]} /><meshBasicMaterial color="#ffdc99" transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>)}
    <pointLight ref={glow} position={[0, 4, 3]} color="#ffd291" distance={20} decay={2} />
    <Inscription lines={["01 / PROFILE"]} at={[0, 6.8, -0.8]} width={4.5} height={0.65} color="#e4c991" />
  </group>;
}

