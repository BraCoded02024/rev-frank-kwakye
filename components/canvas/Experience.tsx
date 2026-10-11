"use client";

import { motion } from "@/lib/motion";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { World } from "./World";

export default function Experience() {
  const quality = motion.quality;
  return (
    <Canvas
      dpr={quality === "high" ? [1, 1.5] : quality === "medium" ? [1, 1.25] : 1}
      camera={{ position: [0.1, 1.7, 7.2], fov: 38, near: 0.1, far: 80 }}
      gl={{ antialias: quality !== "low", alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor("#0B0A08")}
    >
      <Suspense fallback={null}>
        <World />
      </Suspense>
    </Canvas>
  );
}
