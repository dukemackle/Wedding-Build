"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

export function SceneCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[520px] w-full overflow-hidden rounded-lg border border-hairline bg-parchment">
      <Canvas shadows dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={[0, 11, 13]} fov={45} />
        <OrbitControls
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={4}
          maxDistance={26}
        />
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[6, 10, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 26]} />
          <meshStandardMaterial color="#f3f1ea" />
        </mesh>
        {children}
      </Canvas>
    </div>
  );
}
