"use client";

import { motion } from "@/lib/motion";
import { sampleCamera } from "@/lib/three/path";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

function Rig() {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const position = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    const fov = sampleCamera(motion.progress, position, look);
    if (!motion.reduced && motion.mode === "live") {
      look.x += state.pointer.x * 0.08;
      look.y += state.pointer.y * 0.05;
    }
    camera.position.copy(position);
    camera.lookAt(look);
    if (Math.abs(camera.fov - fov) > 0.04) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}

export function World() {
  return (
    <>
      <color attach="background" args={["#0B0A08"]} />
      <fog attach="fog" args={["#0B0A08", 8, 36]} />
      <ambientLight intensity={0.25} color="#3a2c24" />
      <spotLight position={[0.4, 4.2, 3.2]} angle={0.55} penumbra={0.85} intensity={6} color="#ffd7b0" />
      <Rig />
    </>
  );
}
