"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

// The default view direction (elevation ~40°) looking down at the target,
// preserved regardless of how far out the camera has to sit to fit everything.
const VIEW_DIRECTION = [0, 0.6459, 0.7635] as const;

export function SceneCanvas({
  children,
  target = [0, 0, 0],
  distance = 17,
  floorSize = [40, 26],
}: {
  children: React.ReactNode;
  target?: [number, number, number];
  distance?: number;
  floorSize?: [number, number];
}) {
  const cameraPosition: [number, number, number] = [
    target[0] + VIEW_DIRECTION[0] * distance,
    VIEW_DIRECTION[1] * distance,
    target[2] + VIEW_DIRECTION[2] * distance,
  ];

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-lg border border-hairline bg-parchment">
      <Canvas shadows dpr={[1, 1.5]}>
        <PerspectiveCamera makeDefault position={cameraPosition} fov={45} />
        <OrbitControls
          target={target}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={4}
          maxDistance={Math.max(26, distance + 20)}
        />
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[target[0] + 6, 10, target[2] + 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <mesh position={[target[0], 0, target[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={floorSize} />
          <meshStandardMaterial color="#f3f1ea" />
        </mesh>
        {children}
      </Canvas>
    </div>
  );
}
