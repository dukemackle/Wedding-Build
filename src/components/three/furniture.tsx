"use client";

const FOREST = "#0b4a3a";
const BRASS = "#c79a2e";
const CARD = "#ffffff";
const INK = "#1b1f1c";
const PARCHMENT_DARK = "#e5e0d0";
const ASPHALT = "#4a4a48";
const LINE = "#f3f1ea";

type Vec3 = [number, number, number];

export function Chair({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  position?: Vec3;
  rotation?: Vec3;
}) {
  const legPositions: [number, number][] = [
    [-0.17, -0.17],
    [0.17, -0.17],
    [-0.17, 0.17],
    [0.17, 0.17],
  ];
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.42, 0.07, 0.42]} />
        <meshStandardMaterial color={FOREST} />
      </mesh>
      <mesh position={[0, 0.74, -0.18]} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.07]} />
        <meshStandardMaterial color={FOREST} />
      </mesh>
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.44, 8]} />
          <meshStandardMaterial color={BRASS} />
        </mesh>
      ))}
    </group>
  );
}

export function RoundTable({
  position = [0, 0, 0],
  radius = 0.9,
}: {
  position?: Vec3;
  radius?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.06, 32]} />
        <meshStandardMaterial color={CARD} />
      </mesh>
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.72, 12]} />
        <meshStandardMaterial color={BRASS} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[radius * 0.55, radius * 0.6, 0.04, 32]} />
        <meshStandardMaterial color={BRASS} />
      </mesh>
    </group>
  );
}

export function RectTable({
  position = [0, 0, 0],
  width = 1.6,
  depth = 0.8,
}: {
  position?: Vec3;
  width?: number;
  depth?: number;
}) {
  const legInsetX = width / 2 - 0.08;
  const legInsetZ = depth / 2 - 0.08;
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.06, depth]} />
        <meshStandardMaterial color={CARD} />
      </mesh>
      {[
        [-legInsetX, -legInsetZ],
        [legInsetX, -legInsetZ],
        [-legInsetX, legInsetZ],
        [legInsetX, legInsetZ],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.37, z]}>
          <cylinderGeometry args={[0.04, 0.04, 0.72, 10]} />
          <meshStandardMaterial color={BRASS} />
        </mesh>
      ))}
    </group>
  );
}

export function Stage({
  position = [0, 0, 0],
  width = 2.4,
  depth = 1.6,
}: {
  position?: Vec3;
  width?: number;
  depth?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.4, depth]} />
        <meshStandardMaterial color={PARCHMENT_DARK} />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <boxGeometry args={[width + 0.05, 0.02, depth + 0.05]} />
        <meshStandardMaterial color={BRASS} />
      </mesh>
    </group>
  );
}

export function DanceFloor({
  position = [0, 0, 0],
  size = 2.2,
}: {
  position?: Vec3;
  size?: number;
}) {
  const tiles = 6;
  const tileSize = size / tiles;
  const cells = [];
  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      cells.push({ i, j, dark: (i + j) % 2 === 0 });
    }
  }
  return (
    <group position={position}>
      {cells.map(({ i, j, dark }, idx) => (
        <mesh
          key={idx}
          position={[(i - (tiles - 1) / 2) * tileSize, 0.015, (j - (tiles - 1) / 2) * tileSize]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[tileSize * 0.96, tileSize * 0.96]} />
          <meshStandardMaterial color={dark ? INK : CARD} />
        </mesh>
      ))}
    </group>
  );
}

export function Bar({
  position = [0, 0, 0],
  width = 2.6,
}: {
  position?: Vec3;
  width?: number;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[width, 1, 0.4]} />
        <meshStandardMaterial color={FOREST} />
      </mesh>
      <mesh position={[0, 1.02, -0.3]}>
        <boxGeometry args={[width + 0.06, 0.05, 0.46]} />
        <meshStandardMaterial color={BRASS} />
      </mesh>
      <mesh position={[0, 0.9, -0.75]} castShadow>
        <boxGeometry args={[width * 0.9, 0.8, 0.15]} />
        <meshStandardMaterial color={PARCHMENT_DARK} />
      </mesh>
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x * width, 1.15, -0.75]}>
          <cylinderGeometry args={[0.03, 0.05, 0.3, 8]} />
          <meshStandardMaterial color={CARD} />
        </mesh>
      ))}
      {[-0.6, 0, 0.6].map((x, i) => (
        <group key={i} position={[x, 0, 0.5]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.06, 16]} />
            <meshStandardMaterial color={FOREST} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
            <meshStandardMaterial color={BRASS} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function DjBooth({ position = [0, 0, 0] }: { position?: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1, 0.6]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      <mesh position={[-0.45, 1.1, -0.15]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.3]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      <mesh position={[0.45, 1.1, -0.15]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.3]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={CARD} metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function CakeTable({ position = [0, 0, 0] }: { position?: Vec3 }) {
  return (
    <group position={position}>
      <RoundTable radius={0.55} />
      <mesh position={[0, 0.86, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.34, 0.18, 24]} />
        <meshStandardMaterial color={CARD} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.16, 24]} />
        <meshStandardMaterial color={CARD} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.14, 24]} />
        <meshStandardMaterial color={CARD} />
      </mesh>
      <mesh position={[0, 1.24, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={BRASS} />
      </mesh>
    </group>
  );
}

export function GiftTable({ position = [0, 0, 0] }: { position?: Vec3 }) {
  const gifts: { pos: Vec3; color: string; size: number }[] = [
    { pos: [-0.3, 0, -0.1], color: FOREST, size: 0.26 },
    { pos: [0.05, 0, 0.1], color: BRASS, size: 0.2 },
    { pos: [0.32, 0, -0.05], color: FOREST, size: 0.22 },
  ];
  return (
    <group position={position}>
      <RectTable width={1.3} depth={0.7} />
      {gifts.map((g, i) => (
        <group key={i} position={[g.pos[0], 0.78 + g.size / 2, g.pos[2]]}>
          <mesh castShadow>
            <boxGeometry args={[g.size, g.size, g.size]} />
            <meshStandardMaterial color={g.color} />
          </mesh>
          <mesh>
            <boxGeometry args={[g.size * 1.05, g.size * 0.16, g.size * 0.16]} />
            <meshStandardMaterial color={CARD} />
          </mesh>
          <mesh>
            <boxGeometry args={[g.size * 0.16, g.size * 0.16, g.size * 1.05]} />
            <meshStandardMaterial color={CARD} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function EntranceArch({ position = [0, 0, 0] }: { position?: Vec3 }) {
  return (
    <group position={position}>
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 1, 0]} castShadow>
          <boxGeometry args={[0.12, 2, 0.12]} />
          <meshStandardMaterial color={BRASS} />
        </mesh>
      ))}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[1.32, 0.12, 0.12]} />
        <meshStandardMaterial color={BRASS} />
      </mesh>
    </group>
  );
}

export function GenericBlock({ position = [0, 0, 0] }: { position?: Vec3 }) {
  return (
    <mesh position={[position[0], 0.4, position[2]]} castShadow receiveShadow>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color={PARCHMENT_DARK} />
    </mesh>
  );
}

export function House({
  position = [0, 0, 0],
  width = 3.6,
  depth = 2.8,
}: {
  position?: Vec3;
  width?: number;
  depth?: number;
}) {
  const wallHeight = 1.2;
  const roofHeight = 0.7;
  return (
    <group position={position}>
      <mesh position={[0, wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, wallHeight, depth]} />
        <meshStandardMaterial color={CARD} />
      </mesh>
      <mesh
        position={[0, wallHeight + roofHeight / 2, 0]}
        rotation={[0, Math.PI / 4, 0]}
        castShadow
      >
        <coneGeometry args={[Math.max(width, depth) * 0.72, roofHeight, 4]} />
        <meshStandardMaterial color={BRASS} />
      </mesh>
      <mesh position={[0, wallHeight * 0.35, depth / 2 + 0.01]}>
        <boxGeometry args={[0.5, wallHeight * 0.7, 0.02]} />
        <meshStandardMaterial color={FOREST} />
      </mesh>
    </group>
  );
}

export function ParkingArea({
  position = [0, 0, 0],
  width = 5.5,
  depth = 3.2,
}: {
  position?: Vec3;
  width?: number;
  depth?: number;
}) {
  const spaces = 4;
  const spaceWidth = width / spaces;
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={ASPHALT} />
      </mesh>
      {Array.from({ length: spaces - 1 }).map((_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-width / 2 + spaceWidth * (i + 1), 0.02, 0]}
        >
          <planeGeometry args={[0.04, depth * 0.8]} />
          <meshStandardMaterial color={LINE} />
        </mesh>
      ))}
    </group>
  );
}
