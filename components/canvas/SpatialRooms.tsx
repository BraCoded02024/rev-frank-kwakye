"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Block, Inscription } from "./SpatialPrimitives";
import { messageHighlights } from "@/lib/content/media";
import { profile as defaults } from "@/lib/content/profile";
import { useContent } from "@/lib/cms/context";
import { sceneName, roleLines, wrapCopy } from "@/lib/cms/display";
import { churchPhotos } from "@/lib/content/church-photos";

export const rooms = [
  { start: 14, end: -6, color: "#e9dfcc", trim: "#c1ae88", light: "#fff0d0", title: "Prologue" },
  { start: -6, end: -27, color: "#e8e1d4", trim: "#c7b995", light: "#ffe8c0", title: "Calling" },
  { start: -27, end: -59, color: "#c6ceba", trim: "#8d9e7e", light: "#eef3d8", title: "Ministry" },
  { start: -59, end: -88, color: "#ac977f", trim: "#776049", light: "#ffd79e", title: "The Word" },
  { start: -88, end: -119, color: "#ded3c1", trim: "#b19870", light: "#fff0d5", title: "Leadership" },
  { start: -119, end: -150, color: "#f0eadb", trim: "#d8cbaa", light: "#fff9e8", title: "Invitation" },
] as const;

function NearRoom({ start, end, children }: { start: number; end: number; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ camera }) => { if (group.current) group.current.visible = camera.position.z < start + 25 && camera.position.z > end - 4; });
  return <group ref={group}>{children}</group>;
}

export function RoomShells({ sacred = false, portraitOpening = false }: { sacred?: boolean; portraitOpening?: boolean }) {
  return <>{rooms.map((room, index) => {
    if ((sacred && index === 0) || (portraitOpening && index === 1)) return null;
    const width = index === 5 ? 18 : 12;
    const length = room.start - room.end;
    const mid = (room.start + room.end) / 2;
    const stud = Array.from({ length: Math.ceil(length / 5) }, (_, i) => room.start - 2 - i * 5);
    return <NearRoom key={room.title} start={room.start} end={room.end}>
      <Block at={[0, -0.1, mid]} size={[width, 0.2, length]} color={index === 3 ? "#8d755b" : "#d8cfbd"} wood={index === 3} />
      {[-1, 1].map(side => <group key={side}>
        <Block at={[side * (width / 2 + 0.12), 3.5, mid]} size={[0.24, 7, length]} color={room.color} />
        <Block at={[side * (width / 2 - 0.04), 0.25, mid]} size={[0.16, 0.5, length]} color={room.trim} wood />
        <Block at={[side * (width / 2 - 0.04), 6.65, mid]} size={[0.2, 0.22, length]} color={room.trim} />
      </group>)}
      <Block at={[0, 7.1, mid]} size={[width + 0.4, 0.2, length]} color={index === 3 ? "#8b745b" : "#f1ecdf"} wood={index === 3} />
      {stud.map((z, i) => <group key={z}>
        <Block at={[0, 0.009, z]} size={[width, 0.008, 0.018]} color={room.trim} />
        {[-1, 1].map(side => <Block key={side} at={[side * (width / 2 - 0.3), 3.5, z]} size={[0.23, 7, 0.3]} color={room.trim} wood={index === 3} />)}
        <Block at={[0, 6.88, z]} size={[width, 0.2, 0.28]} color={room.trim} wood={index === 3} />
        {i % 2 === 0 && <>
          <mesh position={[width / 2 - 0.15, 4.35, z - 1.8]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[2.1, 3.5]} /><meshBasicMaterial color={room.light} /></mesh>
          <Block at={[width / 2 - 0.25, 4.35, z - 1.8]} size={[0.18, 3.7, 0.065]} color={room.trim} />
          <Block at={[width / 2 - 0.25, 4.35, z - 1.8]} size={[0.18, 0.065, 2.3]} color={room.trim} />
          {/* Low-opacity geometry gives the window light visible atmospheric depth. */}
          <mesh position={[width / 2 - 2.3, 2.6, z - 0.8]} rotation={[0, 0, -0.85]}><coneGeometry args={[2.05, 6.5, 4, 1, true]} /><meshBasicMaterial color={room.light} transparent opacity={0.025} side={THREE.DoubleSide} depthWrite={false} /></mesh>
          <mesh position={[width / 2 - 3.2, 0.025, z - 0.5]} rotation={[-Math.PI / 2, 0, -0.45]}><planeGeometry args={[5, 1.65]} /><meshBasicMaterial color={room.light} transparent opacity={0.19} depthWrite={false} /></mesh>
        </>}
      </group>)}
      {[-2, 0, 2].map(x => <Block key={x} at={[x, 0.007, mid]} size={[0.018, 0.009, length]} color={room.trim} />)}
      <pointLight position={[0, 5.8, mid]} intensity={index === 5 ? 90 : 40} distance={24} decay={2} color={room.light} />
    </NearRoom>;
  })}</>;
}

function PortraitPlate({ x, z, secondary = false }: { x: number; z: number; secondary?: boolean }) {
  const { profile } = useContent();
  const texture = useTexture(secondary ? "/pastor/portrait-secondary.jpg" : "/pastor/pastor.jpg");
  const w = secondary ? 1.3 : 2.1;
  const h = secondary ? 1.3 : 2.98;
  return <group position={[x, 3.3, z]}>
    <Block at={[0, 0, -0.06]} size={[w + 0.14, h + 0.14, 0.12]} color="#b79f71" metal />
    <mesh position={[0, 0, 0.015]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    <Inscription lines={[sceneName(profile).toUpperCase()]} at={[0, -h / 2 - 0.2, 0.02]} width={w} height={0.2} small />
  </group>;
}

export function MinistryRoom({ onOpen }: { onOpen: (index: number) => void }) {
  const { stations: ministryStations } = useContent();
  const places = [
    { x: -3.4, z: -36 },
    { x: 3.4, z: -43 },
    { x: -3.4, z: -50 },
    { x: 3.4, z: -56 },
  ];
  return <NearRoom start={-27} end={-59}>
    {ministryStations.map((s, i) => {
      const place = places[i];
      return <group key={s.id} position={[place.x, 0, place.z]} rotation={[0, place.x < 0 ? 0.25 : -0.25, 0]} onClick={event => { event.stopPropagation(); onOpen(i); }} onPointerOver={event => { event.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
        <Block at={[0, 2.95, -0.12]} size={[3.7, 5.7, 0.25]} color="#dbe0cd" />
        <Block at={[0, 0.15, 0]} size={[3.95, 0.3, 0.8]} color="#8d9c7e" />
        <Inscription lines={[`0${i + 1} / MINISTRY`]} at={[0, 5.35, 0.025]} width={2.6} height={0.25} small />
        <Inscription lines={[s.title]} at={[0, 4.58, 0.03]} width={3.25} height={0.6} />
        <Inscription lines={[...s.lines]} at={[0, 3.75, 0.035]} width={3.2} height={0.62} small />
        <Inscription lines={["TAP TO READ"]} at={[0, 1.15, 0.05]} width={2.4} height={0.28} small />
        {i === 0 && <PortraitPlate x={0} z={0.06} secondary />}
        {i === 2 && <Inscription lines={["“If God be for us,", "who can be against us?”", "Romans 8:31"]} at={[0, 2.25, 0.04]} width={3.1} height={1.3} />}
      </group>;
    })}
  </NearRoom>;
}

function wrap(text: string, limit = 23) {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    if (!lines.length || lines[lines.length - 1].length + word.length > limit) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  return lines;
}

export function WordRoom({ onMedia }: { onMedia: (index: number) => void }) {
  const scripture = useRef<THREE.Group>(null);
  useFrame(({ camera }) => { if (scripture.current) scripture.current.position.z = -84 + THREE.MathUtils.smoothstep(-camera.position.z, 64, 78) * 0.25; });
  return <NearRoom start={-59} end={-88}>
    {messageHighlights.map((message, i) => {
      const x = i % 2 === 0 ? -3.6 : 3.6;
      return <group key={message.title} position={[x, 0, -68 - i * 3.3]} rotation={[0, x < 0 ? 0.28 : -0.28, 0]} onClick={e => { e.stopPropagation(); onMedia(i); }} onPointerOver={e => { e.stopPropagation(); document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
        <Block at={[0, 3.25, -0.2]} size={[3.9, 3.2, 0.5]} color="#624d38" wood />
        <Block at={[0, 3.25, 0.07]} size={[3.6, 2.9, 0.06]} color="#ad9368" metal />
        <Block at={[0, 3.25, 0.115]} size={[3.43, 2.74, 0.04]} color="#e6ddc9" />
        <Inscription lines={wrap(message.title)} at={[0, 3.53, 0.15]} width={3.08} height={1.15} />
        <Inscription lines={[message.src ? "OPEN RECORDING" : "RECORDING FORTHCOMING", "Explore this topic ↗"]} at={[0, 2.52, 0.16]} width={2.9} height={0.45} small />
        <Block at={[0, 1.58, 0.2]} size={[4.05, 0.14, 0.7]} color="#715a40" wood />
        <Block at={[0, 4.92, 0.03]} size={[0.9, 0.065, 0.25]} color="#c7b181" metal />
        <pointLight position={[0, 4.7, 0.6]} color="#ffdfb3" intensity={3} distance={3} />
      </group>;
    })}
    <group ref={scripture} position={[0, 0, -84]}>
      <Block at={[0, 4.45, 0]} size={[7.6, 2.7, 0.2]} color="#dbceb4" />
      <Inscription lines={["“If God be for us,", "who can be against us?”"]} at={[0, 4.65, 0.12]} width={6.8} height={1.45} />
      <Inscription lines={["ROMANS 8:31 · KJV"]} at={[0, 3.58, 0.13]} width={3.5} height={0.3} small />
    </group>
    {/* An open study table stays outside the walking path. */}
    <Block at={[-4.3, 1.2, -83]} size={[2.8, 0.18, 2]} color="#745c40" wood />
    {[-5.3, -3.3].map(x => <Block key={x} at={[x, 0.6, -83]} size={[0.18, 1.2, 1.5]} color="#745c40" wood />)}
  </NearRoom>;
}

export function LeadershipRoom() {
  const { profile } = useContent();
  const entries = [
    { x: -3.5, z: -98, kicker: "FORMATION", title: profile.education === defaults.education ? ["Master of Arts", "in Biblical Studies"] : wrapCopy(profile.education.split(",")[0]), detail: profile.education === defaults.education ? ["Global University"] : wrapCopy(profile.education.split(",").slice(1).join(",")) },
    { x: 3.5, z: -105, kicker: "PASTORAL SERVICE", title: [roleLines(profile.descriptor)[0]], detail: [profile.church, profile.location] },
    { x: -3.5, z: -112, kicker: "DISTRICT LEADERSHIP", title: profile.districtRole === defaults.districtRole ? ["Secretary", "Adenta District"] : wrapCopy(profile.districtRole.split(" of ")[0]), detail: profile.districtRole === defaults.districtRole ? ["Assemblies of God, Ghana", "Greater Accra West Region"] : wrapCopy(profile.districtRole.split(" of ").slice(1).join(" of ")) },
  ];
  return <NearRoom start={-88} end={-119}>
    {entries.map(e => <group key={e.kicker} position={[e.x, 0, e.z]} rotation={[0, e.x < 0 ? 0.22 : -0.22, 0]}>
      <Block at={[0, 3, -0.14]} size={[3.85, 5.55, 0.22]} color="#bba57e" metal />
      <Block at={[0, 3, 0]} size={[3.66, 5.35, 0.11]} color="#e9dfcd" />
      <Inscription lines={[e.kicker]} at={[0, 5.15, 0.08]} width={3.1} height={0.3} small />
      <Inscription lines={e.title} at={[0, 3.95, 0.085]} width={3.25} height={1.3} />
      <Inscription lines={e.detail} at={[0, 2.65, 0.09]} width={3.2} height={0.75} small />
      <Inscription lines={["Ministry & service"]} at={[0, 1.2, 0.09]} width={2.8} height={0.35} />
    </group>)}
    <Inscription lines={[profile.works[0].title, ...(profile.works[0].description === defaults.works[0].description ? ["A book project on character,", "integrity and servant leadership"] : wrapCopy(profile.works[0].description))]} at={[3.5, 3.8, -116]} width={3.5} height={1.6} />
    <PortraitPlate x={3.5} z={-116} secondary />
  </NearRoom>;
}

function ChurchPhotoFrames({ onGallery }: { onGallery: () => void }) {
  const textures = useTexture(churchPhotos.map(photo => photo.image.src));
  return <>{churchPhotos.map((photo, index) => {
    const height = 3.6;
    const width = height * photo.image.width / photo.image.height;
    return <group key={photo.title} position={[-4.2, 3.15, -129 - index * 6]} rotation={[0, 0.32, 0]} onClick={event => { event.stopPropagation(); onGallery(); }}>
      <Block at={[0, 0, -0.12]} size={[width + 0.34, height + 0.34, 0.18]} color="#b49a64" metal />
      <Block at={[0, 0, -0.015]} size={[width + 0.18, height + 0.18, 0.04]} color="#f1e7d2" />
      <mesh position={[0, 0, 0.02]}><planeGeometry args={[width, height]} /><meshBasicMaterial map={textures[index]} toneMapped={false} /></mesh>
      <Inscription lines={[photo.title, "VIEW CHURCH GALLERY"]} at={[0, -2.25, 0.03]} width={width + 0.2} height={0.55} small />
    </group>;
  })}</>;
}

export function InvitationRoom({ onInvite, onGallery }: { onInvite: () => void; onGallery: () => void }) {
  const { profile } = useContent();
  const logo = useTexture("/church/assemblies-of-god.png");
  return <NearRoom start={-119} end={-150}>
    <ChurchPhotoFrames onGallery={onGallery} />
    <Block at={[0, 3.5, -149.7]} size={[18, 7, 0.4]} color="#eee8d8" />
    <Block at={[0, 3.3, -149.35]} size={[10, 6.5, 0.25]} color="#fff8e8" />
    <Inscription lines={["May the work continue."]} at={[0, 5.7, -149.16]} width={8} height={0.8} />
    <Inscription lines={[profile.church, profile.location]} at={[0, 4.25, -149.14]} width={7.3} height={1.05} />
    <mesh position={[0, 2.55, -149.12]}><planeGeometry args={[1.6, 1.55]} /><meshBasicMaterial map={logo} transparent toneMapped={false} /></mesh>
    <group position={[4.8, 0, -145]} onClick={e => { e.stopPropagation(); onInvite(); }} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
      <Block at={[0, 1.45, 0]} size={[4.6, 0.2, 1.8]} color="#bea883" wood />
      {[-1.8, 1.8].map(x => <Block key={x} at={[x, 0.72, 0]} size={[0.18, 1.44, 1.2]} color="#a18b66" wood />)}
      <Block at={[0, 2.32, -0.35]} size={[3.9, 1.5, 0.12]} color="#f2ead9" />
      <Inscription lines={["Write an invitation", "Speaking · Teaching · Leadership training"]} at={[0, 2.37, -0.275]} width={3.5} height={0.8} />
      <Block at={[0, 1.59, 0.15]} size={[1.3, 0.035, 0.75]} color="#fff9ec" />
      <Block at={[0.9, 1.6, 0.15]} size={[0.03, 0.03, 0.5]} color="#bca474" metal />
    </group>
    {[-6.8, 6.8].map(x => <group key={x}><Block at={[x, 0.58, -139]} size={[2.2, 0.16, 6]} color="#c2b391" wood /><Block at={[x, 0.27, -139]} size={[1.8, 0.54, 5.4]} color="#d8c9aa" /></group>)}
  </NearRoom>;
}
