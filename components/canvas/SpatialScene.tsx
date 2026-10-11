"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { cameraAt, chapterAt, doorAngle } from "@/lib/three/spatial-path";
import { PortraitAssembly } from "./PortraitAssembly";
import { SacredAssembly } from "./SacredAssembly";
import { ContentProvider, useContent } from "@/lib/cms/context";
import { sceneName, nameLines, roleLines } from "@/lib/cms/display";

import { Block, Inscription, SpatialMaterials } from "./SpatialPrimitives";
import { RoomShells, MinistryRoom, WordRoom, LeadershipRoom, InvitationRoom, rooms } from "./SpatialRooms";
type SceneProps = { combined: boolean; onOpeningStage?: (stage: "portrait" | "sacred") => void; portraitOpening: boolean; sacred: boolean; jump: RefObject<number>; progress: RefObject<number>; video?: HTMLVideoElement; onReady: () => void; onFailure: () => void; onChapter: (chapter: number) => void; onMedia: (index: number) => void; onMinistry: (index: number) => void; onInvite: () => void; onGallery: () => void };
const smooth = THREE.MathUtils.smoothstep;

function Door({ z, x = 0, number, title, color }: { z: number; x?: number; number: string; title: string; color: string }) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const label = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  useFrame(() => {
    const angle = doorAngle(camera.position.z, z);
    if (left.current) left.current.rotation.y = angle;
    if (right.current) right.current.rotation.y = -angle;
    if (label.current) label.current.visible = camera.position.z - z < 28;
    gl.domElement.dataset[`door${number}`] = angle.toFixed(3);
  });
  const half = 2.05;
  return <group position={[x, 0, z]}>
    <Block at={[-(6 + x + half) / 2, 3.5, 0]} size={[6 + x - half, 7, 0.65]} color={color} />
    <Block at={[(6 - x + half) / 2, 3.5, 0]} size={[6 - x - half, 7, 0.65]} color={color} />
    <Block at={[0, 6.3, 0]} size={[4.1, 1.4, 0.65]} color={color} />
    {[-1, 1].map(side => <group key={side}><Block at={[side * 2.17, 2.85, 0.27]} size={[0.25, 5.7, 0.85]} color="#b6a583" /><Block at={[side * 2.35, 2.85, 0.1]} size={[0.1, 5.9, 1]} color="#d8ccb2" /></group>)}
    <Block at={[0, 5.7, 0.27]} size={[4.6, 0.27, 0.85]} color="#b6a583" />
    <Block at={[0, 0.025, 0]} size={[4.3, 0.05, 1.6]} color="#a28e65" />
    <Block at={[0, 0.018, -0.9]} size={[4.6, 0.036, 0.12]} color="#ccb989" metal />
    {[-1, 1].map(side => <Block key={side} at={[side * 2.17, 2.85, -0.65]} size={[0.25, 5.7, 0.28]} color="#cbbb97" />)}
    <group ref={label}><Inscription lines={[`${number}   /   ${title.toUpperCase()}`]} at={[0, 6.22, 0.4]} width={3.6} height={0.6} /></group>
    {[-1, 1].map(side => <group key={side} ref={side === -1 ? left : right} position={[side * half, 0, 0]}>
      <Block at={[-side * 1.015, 2.78, 0]} size={[2.03, 5.5, 0.16]} color={number === "02" ? "#58614a" : "#877052"} wood />
      <Block at={[-side * 1.015, 2.85, 0.095]} size={[1.66, 4.88, 0.08]} color={number === "01" ? "#857350" : "#677256"} />
      <Block at={[-side * 1.015, 2.85, 0.15]} size={[1.43, 4.6, 0.02]} color={number === "02" ? "#566448" : "#8c7354"} wood />
      <Block at={[-side * 1.82, 2.65, 0.24]} size={[0.055, 0.64, 0.07]} color="#c9b77b" metal />
      {[0.6, 4.9].map(y => <Block key={y} at={[-side * 0.08, y, 0.14]} size={[0.13, 0.3, 0.12]} color="#b09b67" metal />)}
    </group>)}
  </group>;
}

function Architecture({ sacred, portraitOpening }: { sacred: boolean; portraitOpening: boolean }) {
  return <>
    <RoomShells sacred={sacred || portraitOpening} portraitOpening={portraitOpening} />
    {!portraitOpening && (sacred ? <SacredAssembly /> : <Door z={-6} number="01" title="Profile" color="#e7deca" />)}
    <Door z={-27} x={1.5} number="02" title="Ministry" color="#b9c3ac" />
    <Door z={-59} number="03" title="Messages" color="#c7b59a" />
    <Door z={-88} x={-1.3} number="04" title="Leadership" color="#ded2bd" />
    <Door z={-119} number="05" title="Contact" color="#eee5cf" />
  </>;
}
function Prologue({ video }: { video: HTMLVideoElement }) {
  const { profile } = useContent();
  const group = useRef<THREE.Group>(null);
  const texture = useMemo(() => {
    const map = new THREE.VideoTexture(video);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [video]);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(({ scene }) => {
    if (!group.current) return;
    const p = scene.userData.travel ?? 0;
    group.current.visible = p < 0.043;
    // Detached video elements may not receive compositor frame callbacks in Chromium.
    // Explicitly upload decoded frames while this world-space screen is in view.
    if (p < 0.043 && video.readyState >= 2) texture.needsUpdate = true;
  });
  return <group ref={group}>
    <Block at={[0, 3.25, -0.9]} size={[8.3, 6.2, 0.24]} color="#354333" wood />
    {[-1, 1].map(side => <group key={side}>
      <Block at={[side * 4.05, 3.2, -0.7]} size={[0.18, 6.3, 0.32]} color="#bca579" metal />
      {[0, 1, 2, 3].map(i => <Block key={i} at={[side * (3.25 + i * 0.19), 3.2, -0.65]} size={[0.06, 5.65, 0.15]} color="#8a7959" wood />)}
      <pointLight position={[side * 3.1, 4.6, 0.3]} color="#ffe0a4" intensity={8} distance={5} />
    </group>)}
    <Inscription lines={["THE JOURNEY OF A CALLING"]} at={[0, 5.72, -0.4]} width={4.7} height={0.3} color="#d4c099" small />
    <Inscription lines={[sceneName(profile)]} at={[0, 5.17, -0.4]} width={5.8} height={0.65} color="#f4ebd6" />
    <Block at={[0, 3.35, -0.57]} size={[5.76, 3.27, 0.11]} color="#bca579" metal />
    <Block at={[0, 3.35, -0.5]} size={[5.58, 3.1, 0.035]} color="#111910" />
    <mesh position={[0, 3.35, -0.47]}><planeGeometry args={[5.44, 3.06]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    <Inscription lines={["ROMANS 8:31"]} at={[0, 1.34, -0.4]} width={2.6} height={0.32} color="#d4c099" small />
    <Block at={[0, 0.12, -0.05]} size={[8.7, 0.24, 2.3]} color="#847453" wood />
    <Block at={[0, 0.04, 1.3]} size={[9.3, 0.08, 0.5]} color="#bca579" metal />
  </group>;
}

function Calling({ sacred }: { sacred: boolean }) {
  const { profile } = useContent();
  const compact = useThree(state => state.size.width / state.size.height < 0.8);
  const portrait = useTexture("/pastor/pastor.jpg");
  const identity = useRef<THREE.Group>(null);
  const second = useRef<THREE.Group>(null);
  const portraitLayers = useRef<THREE.Group>(null);
  useEffect(() => { portrait.colorSpace = THREE.SRGBColorSpace; }, [portrait]);
  useFrame(({ scene }) => {
    const p = scene.userData.travel ?? 0;
    if (identity.current) identity.current.visible = p > 0.095 && p < 0.2;
    if (second.current) second.current.visible = p > 0.125 && p < 0.2;
    if (sacred) {
      const reveal = 1 - smooth(p, 0.087, 0.125);
      if (portraitLayers.current) {
        portraitLayers.current.children.forEach((layer, index) => {
          layer.position.z = reveal * (index + 1) * 0.8;
          layer.position.x = -reveal * (index + 1) * 0.2;
        });
      }
      if (identity.current) { identity.current.position.z = (1 - smooth(p, 0.1, 0.14)) * 2; identity.current.position.x = (1 - smooth(p, 0.1, 0.14)) * 1.2; }
      if (second.current) second.current.position.y = -(1 - smooth(p, 0.125, 0.16)) * 0.8;
    }
  });
  return <group>
    <group ref={portraitLayers}>
    <group>
    <Block at={[-2.05, 2.7, -19.25]} size={[3.26, 5.08, 0.3]} color="#ae9d79" />
    </group><group>
    <Block at={[-2.05, 2.7, -19.06]} size={[3.02, 4.8, 0.09]} color="#eee6d6" />
    </group><group>
    <mesh position={[-2.05, 2.78, -18.99]}><planeGeometry args={[2.88, 4.085]} /><meshBasicMaterial map={portrait} toneMapped={false} /></mesh>
    </group></group>
    <Block at={[-2.05, 0.13, -19]} size={[3.55, 0.26, 0.9]} color="#b6a889" />
    <group ref={identity} visible={!compact}>
      {!compact && <>
      <Inscription lines={["REVEREND"]} at={[1.3, 4.43, -18.1]} width={2.9} height={0.3} small align="left" />
      <Inscription lines={nameLines(profile)} at={[1.4, 3.45, -18.05]} width={3.2} height={1.65} align="left" />
      </>}
      {compact && <Inscription lines={[sceneName(profile)]} at={[-2.05, 5.55, -18.9]} width={3.5} height={0.5} />}
    </group>
    <group ref={second}>
      {!compact && <>
      <Inscription lines={roleLines(profile.descriptor)} at={[1.25, 2.02, -17.7]} width={2.8} height={0.85} small align="left" />
      <Inscription lines={[profile.church, profile.location]} at={[1.25, 1.17, -17.5]} width={2.8} height={0.48} small align="left" />
      </>}
    </group>
    <Inscription lines={["Rooted in Scripture.", "Given to service."]} at={[-5.85, 3.3, -14]} width={4.5} height={1.6} rotation={[0, Math.PI / 2, 0]} />
    {!compact && <Inscription lines={["THE CALLING"]} at={[-2.05, 5.67, -19.1]} width={2.6} height={0.35} small />}
  </group>;
}

function Rig({ combined, onOpeningStage, portraitOpening, sacred, jump, progress, video, onReady, onChapter }: Omit<SceneProps, "onFailure">) {
  const current = useRef(progress.current);
  const lastJump = useRef(jump.current);
  const { camera, scene, gl, invalidate, size } = useThree();
  const atmosphere = useMemo(() => rooms.map(room => new THREE.Color(room.color)), []);
  const reported = useRef(-1);
  const reportedStage = useRef("");
  const sun = useRef<THREE.DirectionalLight>(null);
  const sky = useRef<THREE.HemisphereLight>(null);
  const sunTarget = useMemo(() => new THREE.Object3D(), []);
  const dark = useMemo(() => new THREE.Color("#17130e"), []);
  const timing = useRef({ frames: 0, seconds: 0, slow: 0 });
  useEffect(() => {
    onReady();
    const redraw = () => invalidate();
    addEventListener("scroll", redraw, { passive: true });
    video?.addEventListener("play", redraw);
    video?.addEventListener("loadeddata", redraw);
    document.addEventListener("visibilitychange", redraw);
    return () => { removeEventListener("scroll", redraw); video?.removeEventListener("play", redraw); video?.removeEventListener("loadeddata", redraw); document.removeEventListener("visibilitychange", redraw); };
  }, [invalidate, video, onReady]);
  useFrame((_, delta) => {
    const mapped = combined ? Math.max(0, (progress.current - .12) / .88) : progress.current;
    const readingMessages = size.width < 700 && mapped >= 0.4 && mapped <= 0.62;
    if (lastJump.current !== jump.current) {
      current.current = progress.current;
      lastJump.current = jump.current;
    } else if (readingMessages || delta > 0.05) {
      current.current = progress.current;
    } else {
      current.current = THREE.MathUtils.damp(current.current, progress.current, 5.5, delta);
    }
    const raw = current.current;
    const p = combined ? Math.max(0, (raw - .12) / .88) : raw;
    scene.userData.openingTravel = raw;
    if (combined) {
      const stage = raw < .12 ? "portrait" : "sacred";
      if (reportedStage.current !== stage) { reportedStage.current = stage; onOpeningStage?.(stage); }
    }
    const pos = cameraAt(p);
    if (sacred && p < 0.09) {
      // Hold back for the lock, then cross only after both leaves are clear.
      pos.z = p < 0.05 ? THREE.MathUtils.lerp(12, 4, smooth(p, 0, 0.05)) : THREE.MathUtils.lerp(4, -8, smooth(p, 0.05, 0.09));
      if (size.width / size.height < 0.8) pos.z += 6 * (1 - smooth(p, 0, 0.055));
      pos.lookY = THREE.MathUtils.lerp(3.25, pos.lookY, smooth(p, 0.075, 0.09));
    }
    if (portraitOpening && p < .205) {
      const pass = smooth(p, .105, .205);
      pos.z = p < .105 ? THREE.MathUtils.lerp(10, 7, smooth(p, 0, .066)) : THREE.MathUtils.lerp(7, -25, pass);
      if (size.width / size.height < .8) pos.z += 5*(1-smooth(p,.10,.18));
      pos.x = 1.5*smooth(p,.105,.15);
      pos.lookX = pos.x;
      pos.lookY = THREE.MathUtils.lerp(3.7, 2.8, pass);
    }
    if (combined && raw < .12) {
      pos.z = THREE.MathUtils.lerp(26, 12, smooth(raw, 0, .12));
      if (size.width / size.height < .8) pos.z += 6;
      pos.x = 0;
      pos.lookX = 0;
      pos.lookY = THREE.MathUtils.lerp(3.7,3.25,smooth(raw,.085,.12));
    }
    if (readingMessages) {
      pos.x = THREE.MathUtils.clamp(pos.lookX * 0.35, -1.1, 1.1);
      pos.z += 1.4;
    }
    camera.position.set(pos.x, pos.y, pos.z);
    const attention = portraitOpening ? 0 : smooth(p, 0.095, 0.13) * (1 - smooth(p, 0.17, 0.205));
    const lookZ = THREE.MathUtils.lerp(pos.z - 9, -19, attention);
    const compact = size.width / size.height < 0.8;
    const portraitAttention = attention;
    camera.lookAt(compact ? THREE.MathUtils.lerp(pos.lookX, -2.05, portraitAttention) : pos.lookX, pos.lookY, lookZ);
    const lens = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const fov = size.width < 700 ? Math.min(100, Math.max(68, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(65 / 2)) / aspect)))) : 49;
    if (lens.fov !== fov) { lens.fov = fov; lens.updateProjectionMatrix(); }
    scene.userData.travel = p;
    const roomIndex = Math.max(0, rooms.findIndex(room => pos.z <= room.start && pos.z >= room.end));
    const fade = smooth(rooms[roomIndex].start - pos.z, 0, 6);
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(atmosphere[Math.max(0, roomIndex - 1)]).lerp(atmosphere[roomIndex], fade);
    if ((sacred || portraitOpening) && scene.fog instanceof THREE.Fog) scene.fog.color.lerp(dark, 1 - smooth(p, portraitOpening ? .14 : .073, portraitOpening ? .205 : .105));
    if (scene.background instanceof THREE.Color && scene.fog) scene.background.copy(scene.fog.color);
    if (sky.current) sky.current.intensity = roomIndex === 3 ? 1.8 : roomIndex === 5 ? 3 : 2.5;
    if (sun.current) {
      sun.current.position.set(pos.x + 5, 6.5, pos.z + 3);
      sunTarget.position.set(pos.x - 1, 0, pos.z - 9);
      sunTarget.updateMatrixWorld();
      sun.current.intensity = roomIndex === 3 ? 1.25 : roomIndex === 5 ? 2.8 : 2;
      if (sacred || portraitOpening) sun.current.intensity *= 0.45 + 0.55 * smooth(p, 0.07, 0.105);
    }
    if ((sacred || portraitOpening) && sky.current) sky.current.intensity *= 0.15 + 0.85 * smooth(p, 0.07, 0.105);
    const chapter = portraitOpening && p < .2 ? (p < .066 ? 0 : 1) : sacred && p < .09 ? 0 : chapterAt(p);
    if (reported.current !== chapter) { reported.current = chapter; onChapter(chapter); }
    gl.domElement.dataset.cameraZ = pos.z.toFixed(3);
    gl.domElement.dataset.cameraX = pos.x.toFixed(3);
    gl.domElement.dataset.travel = p.toFixed(4);
    gl.domElement.dataset.openingTravel = raw.toFixed(4);
    if (video) {
      gl.domElement.dataset.filmTime = video.currentTime.toFixed(2);
      gl.domElement.dataset.filmPaused = String(video.paused);
    }
    gl.domElement.dataset.room = rooms[roomIndex].title;
    if (Math.abs(raw - progress.current) > 0.00001 && delta < 0.25) {
      timing.current.frames++;
      timing.current.seconds += delta;
      if (delta > 0.025) timing.current.slow++;
      if (timing.current.frames % 30 === 0) {
        gl.domElement.dataset.motionFps = (timing.current.frames / timing.current.seconds).toFixed(1);
        gl.domElement.dataset.slowFrames = String(timing.current.slow);
        gl.domElement.dataset.motionFrames = String(timing.current.frames);
      }
    }
    const filmPlaying = !!video && !video.paused && !video.ended;
    if (!document.hidden && (Math.abs(raw - progress.current) > 0.00001 || filmPlaying)) invalidate();
  });
  return <><primitive object={sunTarget} /><hemisphereLight ref={sky} args={["#fff8ed", "#bdb29c", 2.5]} /><directionalLight ref={sun} target={sunTarget} intensity={2} color="#fff1db" castShadow={!sacred && !portraitOpening} shadow-mapSize={[1024, 1024]} shadow-camera-left={-11} shadow-camera-right={11} shadow-camera-top={11} shadow-camera-bottom={-8} shadow-camera-far={40} shadow-bias={-0.0005} shadow-normalBias={0.03} shadow-radius={3} /></>;
}

function World(props: Omit<SceneProps, "onFailure">) {
  return <>
    <color attach="background" args={["#d4c7ab"]} />
    <fog attach="fog" args={["#d4c7ab", 15, 48]} />
    <Rig {...props} />
    <Architecture sacred={props.sacred} portraitOpening={props.portraitOpening} />
    {props.video && !props.sacred && !props.portraitOpening && <Prologue video={props.video} />}
    {props.combined && <PortraitAssembly combined />}
    {props.portraitOpening ? <PortraitAssembly /> : <Calling sacred={props.sacred} />}
    <MinistryRoom onOpen={props.onMinistry} />
    <WordRoom onMedia={props.onMedia} />
    <LeadershipRoom />
    <InvitationRoom onInvite={props.onInvite} onGallery={props.onGallery} />
  </>;
}

function ContextLossGuard({ onFailure }: { onFailure: () => void }) {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onFailure);
    return () => canvas.removeEventListener("webglcontextlost", onFailure);
  }, [gl, onFailure]);
  return null;
}
export default function SpatialScene(props: SceneProps) {
  const content = useContent();
  const narrow = window.matchMedia("(max-width: 699px)").matches;
  return <Canvas shadows={narrow ? false : (!props.sacred || props.combined ? { type: THREE.PCFShadowMap } : false)} frameloop="demand" dpr={narrow || props.sacred || props.portraitOpening ? 1 : [1, 1.5]} camera={{ position: [0, 2.65, 9], fov: 49, near: 0.08, far: 75 }} gl={{ antialias: !narrow, alpha: false, powerPreference: "high-performance" }}>
    <ContextLossGuard onFailure={props.onFailure} />
    <Suspense fallback={null}><ContentProvider content={content}><SpatialMaterials><World {...props} /></SpatialMaterials></ContentProvider></Suspense>
  </Canvas>;
}











