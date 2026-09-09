"use client";

import type { LayoutItemType, VenueLayoutItem } from "@/lib/supabase/types";
import { SceneCanvas } from "@/components/three/scene-canvas";
import {
  Chair,
  Stage,
  DanceFloor,
  Bar,
  DjBooth,
  RectTable,
  CakeTable,
  GiftTable,
  EntranceArch,
  GenericBlock,
} from "@/components/three/furniture";
import { ITEM_TYPE_DIMENSIONS } from "./floor-plan-manager";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 520;
const SCALE = 45;

function toWorld(pixelX: number, pixelY: number): [number, number] {
  return [(pixelX - CANVAS_WIDTH / 2) / SCALE, (pixelY - CANVAS_HEIGHT / 2) / SCALE];
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

export default function FloorPlan3DView({ items }: { items: VenueLayoutItem[] }) {
  return (
    <SceneCanvas>
      {items.map((item) => (
        <ItemScene key={item.id} item={item} />
      ))}
    </SceneCanvas>
  );
}
