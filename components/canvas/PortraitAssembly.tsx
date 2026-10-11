"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Block, Inscription } from "./SpatialPrimitives";
import { useContent } from "@/lib/cms/context";
import { sceneName, roleLines } from "@/lib/cms/display";

// Trace the supplied photograph's outer contour; UVs retain its original pixels.
// These are real cutout meshes, not five copies of a rectangular photograph.
const outline = [[.056,1],[.07,.80],[.09,.75],[.16,.71],[.29,.66],[.345,.61],[.335,.55],[.29,.52],[.255,.46],[.233,.36],[.225,.24],[.24,.18],[.31,.13],[.40,.102],[.48,.102],[.565,.125],[.62,.175],[.657,.24],[.657,.30],[.682,.315],[.68,.37],[.653,.40],[.643,.49],[.672,.513],[.735,.53],[.805,.585],[.91,.62],[1,.646],[1,1]];

function cutout(part: "all" | "head" | "robe") {
  let points = outline;
  if (part !== "all") {
    points = [];
    const inside = (p: number[]) => part === "head" ? p[1] <= .62 : p[1] >= .62;
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i], b = outline[(i + 1) % outline.length];
      if (inside(a)) points.push(a);
      if (inside(a) !== inside(b)) points.push([a[0] + (b[0] - a[0]) * (.62 - a[1]) / (b[1] - a[1]), .62]);
    }
  }
  const shape = new THREE.Shape(points.map(([x,y]) => new THREE.Vector2((x-.5)*3.8, (.5-y)*5.39)));
  const geometry = new THREE.ShapeGeometry(shape);
  const positions = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i=0;i<positions.count;i++) uv.setXY(i, positions.getX(i)/3.8+.5, positions.getY(i)/5.39+.5);
  return geometry;
}

export function PortraitAssembly({ combined = false }: { combined?: boolean }) {
  const { profile } = useContent();
  const roles = roleLines(profile.descriptor);
  const photo = useTexture("/pastor/pastor.jpg");
  const { size } = useThree();
  const compact = size.width / size.height < .8;
  const root = useRef<THREE.Group>(null);
  const stack = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Group | null)[]>([]);
  const identity = useRef<THREE.Group>(null);
  const gateway = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const pulseMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const veil = useRef<THREE.MeshBasicMaterial>(null);
  const lock = useRef({ triggered: false, at: -Infinity });
  const geometries = useMemo(() => ({ all:cutout("all"), head:cutout("head"), robe:cutout("robe") }), []);
  const lightTarget = useMemo(() => { const target = new THREE.Object3D(); target.position.set(0,3.5,-4); return target; }, []);
  useEffect(() => { photo.colorSpace = THREE.SRGBColorSpace; return () => Object.values(geometries).forEach(g=>g.dispose()); }, [photo, geometries]);
  useFrame(({ scene, clock, pointer, invalidate, gl }) => {
    const raw = scene.userData.openingTravel ?? 0;
    const p = combined ? raw / .12 * .21 : scene.userData.travel ?? 0;
    if (root.current) root.current.visible = p < .21;
    if (p >= .21) return;
    const assembled = THREE.MathUtils.smootherstep(p, .006, .066);
    const apart = 1-assembled;
    const passage = THREE.MathUtils.smootherstep(p, .10, .185);
    const time = clock.elapsedTime;
    layers.current.forEach((layer, i) => {
      if (!layer) return;
      const offsets = [-.85,-.4,.8,0,.65];
      layer.position.set(apart*(offsets[i]+pointer.x*.12*(i+1)), apart*Math.sin(time*.6+i)*.045, apart*(-3.6+i*1.8)+(i===2 ? .135 : i*.045));
      layer.rotation.y = apart*(-.12+i*.045+pointer.x*.018);
    });
    if (stack.current) { stack.current.position.x = -passage*5.4; stack.current.rotation.y = passage*.28; }
    if (identity.current) { identity.current.visible = !combined && !compact && p >= .066 && p < .155; identity.current.position.y = -(1-THREE.MathUtils.smootherstep(p,.066,.083))*.55; }
    if (gateway.current) { const scale = .7+.3*THREE.MathUtils.smootherstep(p,.075,.13); gateway.current.scale.set(scale,scale,1); }
    if (veil.current) veil.current.opacity = 1-THREE.MathUtils.smoothstep(p,.105,.16);
    if (p < .064) lock.current.triggered = false;
    if (p >= .066 && !lock.current.triggered) { lock.current.triggered = true; lock.current.at = time; }
    const burst = THREE.MathUtils.clamp((time-lock.current.at)/.85,0,1);
    if (pulse.current) { pulse.current.visible = p>=.066 && burst<1; pulse.current.scale.setScalar(1+burst*5); }
    if (pulseMaterial.current) pulseMaterial.current.opacity = (1-burst)*.7;
    gl.domElement.dataset.portraitAssembly = assembled.toFixed(3);
    gl.domElement.dataset.portraitPassage = passage.toFixed(3);
    if (!document.hidden && (apart>.001 || burst<1)) invalidate();
  });
  return <group ref={root} position={[0,0,combined ? 16 : 0]}>
    <Block at={[0,-.15,-5]} size={[28,.2,50]} color="#211a14" />
    <mesh position={[0,5,-20]}><planeGeometry args={[38,22]} /><meshBasicMaterial ref={veil} color="#17130e" transparent depthWrite={false} toneMapped={false} /></mesh>
    <group ref={gateway} visible={!combined} position={[1.5,0,-18]}>
      {[-1,1].map(side=><group key={side}><Block at={[side*3,3.4,0]} size={[.35,6.8,.6]} color="#aa8750" metal /><mesh position={[side*2.8,3.4,.32]}><planeGeometry args={[.045,6.8]} /><meshBasicMaterial color="#ffdc95" /></mesh></group>)}
      <Block at={[0,6.9,0]} size={[6.35,.25,.6]} color="#bf9b59" metal />
      <Inscription lines={["02 / MINISTRY"]} at={[0,7.35,.1]} width={4.8} height={.35} color="#e8cb94" small />
    </group>
    <group ref={stack} position={[0,0,-4]}>
      <group position={[0,3.5,0]}>
        <group ref={node=>{layers.current[0]=node;}}>
          <mesh position={[0,0,-.1]}><planeGeometry args={[4.7,6.4]} /><meshStandardMaterial color="#70542f" roughness={.95} /></mesh>
          <mesh position={[0,0,0]}><ringGeometry args={[2.65,2.69,80]} /><meshBasicMaterial color="#d9b66f" /></mesh>
        </group>
        <group ref={node=>{layers.current[1]=node;}}><mesh geometry={geometries.all} scale={1.035} castShadow receiveShadow><meshStandardMaterial color="#392e21" roughness={1} /></mesh></group>
        <group ref={node=>{layers.current[2]=node;}}><mesh geometry={geometries.robe} castShadow receiveShadow><meshStandardMaterial map={photo} roughness={.9} emissive="#ffffff" emissiveMap={photo} emissiveIntensity={.22} /></mesh></group>
        <group ref={node=>{layers.current[3]=node;}}><mesh geometry={geometries.head} castShadow receiveShadow><meshStandardMaterial map={photo} roughness={.95} emissive="#ffffff" emissiveMap={photo} emissiveIntensity={.22} /></mesh></group>
        <group visible={!compact} ref={node=>{layers.current[4]=node;}}>
          <Inscription lines={["“If God be for us,", "who can be against us?”"]} at={[0,-2.95,.1]} width={4.8} height={.65} color="#f3d7a1" />
          <Inscription lines={["ROMANS 8:31"]} at={[0,-3.45,.1]} width={2.4} height={.25} color="#c5a673" small />
        </group>
        <mesh ref={pulse} position={[0,0,.35]} visible={false}><ringGeometry args={[2.7,2.78,96]} /><meshBasicMaterial ref={pulseMaterial} color="#ffe4aa" transparent depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      </group>
    </group>
    <group ref={identity} visible={false} position={[0,0,0]}>
      <Inscription lines={[sceneName(profile).toUpperCase()]} at={[compact?0:4.3,compact?7:4.8,-4]} width={compact?5.8:4.3} height={.5} color="#f4dfb9" />
      <Inscription lines={[roles.slice(0,2).join(" · "), ...roles.slice(2), profile.church, profile.location]} at={[compact?0:4.3,compact?6.1:3.65,-4]} width={compact?5.7:4.2} height={1.3} color="#dfcbaa" small />
    </group>
    <primitive object={lightTarget} />
    <spotLight target={lightTarget} position={[2,8,6]} angle={.6} penumbra={1} intensity={100} color="#ffe5b7" castShadow shadow-mapSize={[512,512]} shadow-camera-near={.5} shadow-camera-far={26} shadow-bias={-.0004} shadow-radius={5} />
    {[-1,1].map(side=><mesh key={side} position={[side*4,3,-6]} rotation={[0,0,side*.3]}><coneGeometry args={[2.3,12,24,1,true]} /><meshBasicMaterial color="#ffd38a" transparent opacity={.025} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} /></mesh>)}
  </group>;
}


