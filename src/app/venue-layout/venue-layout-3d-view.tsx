"use client";

import type { LayoutItemType, SeatingTable, VenueLayoutItem } from "@/lib/supabase/types";
import { SceneCanvas } from "@/components/three/scene-canvas";
import {
  Chair,
  RoundTable,
  RectTable,
  Stage,
  DanceFloor,
  Bar,
  DjBooth,
  CakeTable,
  GiftTable,
  EntranceArch,
  GenericBlock,
} from "@/components/three/furniture";
import { tableDimensions, ITEM_TYPE_DIMENSIONS } from "./venue-layout-manager";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 520;
const SCALE = 45;

function toWorld(pixelX: number, pixelY: number): [number, number] {
  return [(pixelX - CANVAS_WIDTH / 2) / SCALE, (pixelY - CANVAS_HEIGHT / 2) / SCALE];
}

function TableScene({ table }: { table: SeatingTable }) {
  const { width, height } = tableDimensions(table.shape, table.capacity);
  const [x, z] = toWorld(table.position_x + width / 2, table.position_y + height / 2);
  const seats = Math.min(Math.max(table.capacity ?? 8, 2), 14);

  if (table.shape === "round") {
    const radius = width / 2 / SCALE;
    return (
      <group position={[x, 0, z]}>
        <RoundTable radius={radius} />
        {Array.from({ length: seats }).map((_, i) => {
          const angle = (i / seats) * Math.PI * 2;
          const cx = Math.sin(angle) * (radius + 0.55);
          const cz = Math.cos(angle) * (radius + 0.55);
          return <Chair key={i} position={[cx, 0, cz]} rotation={[0, angle + Math.PI, 0]} />;
        })}
      </group>
    );
  }

  const worldWidth = width / SCALE;
  const worldDepth = height / SCALE;
  const perSide = Math.max(1, Math.ceil(seats / 2));
  const chairs: React.ReactElement[] = [];
  for (let i = 0; i < seats; i++) {
    const side = i < perSide ? -1 : 1;
    const indexOnSide = i < perSide ? i : i - perSide;
    const countOnSide = i < perSide ? perSide : seats - perSide;
    const t = countOnSide === 1 ? 0.5 : indexOnSide / (countOnSide - 1);
    const cx = (t - 0.5) * (worldWidth - 0.4);
    const cz = side * (worldDepth / 2 + 0.55);
    chairs.push(
      <Chair
        key={i}
        position={[cx, 0, cz]}
        rotation={[0, side === -1 ? Math.PI : 0, 0]}
      />,
    );
  }

  return (
    <group position={[x, 0, z]}>
      <RectTable width={worldWidth} depth={worldDepth} />
      {chairs}
    </group>
  );
}

function ItemScene({ item }: { item: VenueLayoutItem }) {
  const { width, height } = ITEM_TYPE_DIMENSIONS[item.item_type];
  const [x, z] = toWorld(item.position_x + width / 2, item.position_y + height / 2);
  const worldWidth = width / SCALE;
  const worldDepth = height / SCALE;
  const position: [number, number, number] = [x, 0, z];

  switch (item.item_type as LayoutItemType) {
    case "chairs": {
      const count = 5;
      return (
        <group position={position}>
          {Array.from({ length: count }).map((_, i) => (
            <Chair
              key={i}
              position={[(i - (count - 1) / 2) * 0.55, 0, 0]}
              rotation={[0, Math.PI, 0]}
            />
          ))}
        </group>
      );
    }
    case "stage":
      return <Stage position={position} width={worldWidth} depth={worldDepth} />;
    case "dance_floor":
      return <DanceFloor position={position} size={Math.min(worldWidth, worldDepth)} />;
    case "bar":
      return <Bar position={position} width={worldWidth} />;
    case "dj_booth":
      return <DjBooth position={position} />;
    case "buffet":
      return <RectTable position={position} width={worldWidth} depth={worldDepth} />;
    case "cake_table":
      return <CakeTable position={position} />;
    case "gift_table":
      return <GiftTable position={position} />;
    case "entrance":
      return <EntranceArch position={position} />;
    default:
      return <GenericBlock position={position} />;
  }
}

export default function VenueLayout3DView({
  tables,
  items,
}: {
  tables: SeatingTable[];
  items: VenueLayoutItem[];
}) {
  return (
    <SceneCanvas>
      {items.map((item) => (
        <ItemScene key={item.id} item={item} />
      ))}
      {tables.map((table) => (
        <TableScene key={table.id} table={table} />
      ))}
    </SceneCanvas>
  );
}
