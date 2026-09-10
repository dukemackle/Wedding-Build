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
  House,
  ParkingArea,
  GenericBlock,
} from "@/components/three/furniture";
import { tableDimensions, ITEM_TYPE_DIMENSIONS } from "./venue-layout-manager";

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 520;
const SCALE = 45;

function toWorld(pixelX: number, pixelY: number): [number, number] {
  return [(pixelX - CANVAS_WIDTH / 2) / SCALE, (pixelY - CANVAS_HEIGHT / 2) / SCALE];
}

// A layout can grow taller/wider than the fixed 2D canvas as couples add
// more tables and items, so the camera frames the actual content bounds
// instead of a fixed area — otherwise anything placed further out just
// falls outside the fixed default view and looks like it's missing.
function computeBounds(tables: SeatingTable[], items: VenueLayoutItem[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  function include(pixelX: number, pixelY: number, widthPx: number, heightPx: number, margin: number) {
    const [x, z] = toWorld(pixelX + widthPx / 2, pixelY + heightPx / 2);
    const halfWidth = widthPx / 2 / SCALE + margin;
    const halfDepth = heightPx / 2 / SCALE + margin;
    minX = Math.min(minX, x - halfWidth);
    maxX = Math.max(maxX, x + halfWidth);
    minZ = Math.min(minZ, z - halfDepth);
    maxZ = Math.max(maxZ, z + halfDepth);
  }

  for (const table of tables) {
    const { width, height } = tableDimensions(table.shape, table.capacity);
    // Chairs extend past the table itself, so pad the footprint for them.
    include(table.position_x, table.position_y, width, height, 1.2);
  }
  for (const item of items) {
    const { width, height } = ITEM_TYPE_DIMENSIONS[item.item_type];
    include(item.position_x, item.position_y, width, height, 0.3);
  }

  if (!Number.isFinite(minX)) {
    return { centerX: 0, centerZ: 0, spanX: 8, spanZ: 6 };
  }

  return {
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
    spanX: Math.max(maxX - minX, 4),
    spanZ: Math.max(maxZ - minZ, 4),
  };
}

function TableScene({ table }: { table: SeatingTable }) {
  const { width, height } = tableDimensions(table.shape, table.capacity);
  const [x, z] = toWorld(table.position_x + width / 2, table.position_y + height / 2);
  const rotationRad = (table.rotation * Math.PI) / 180;
  const seats = Math.min(Math.max(table.capacity ?? 8, 2), 14);

  if (table.shape === "round") {
    const radius = width / 2 / SCALE;
    return (
      <group position={[x, 0, z]} rotation={[0, rotationRad, 0]}>
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
    <group position={[x, 0, z]} rotation={[0, rotationRad, 0]}>
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
  const rotationRad = (item.rotation * Math.PI) / 180;

  let content: React.ReactElement;
  switch (item.item_type as LayoutItemType) {
    case "chairs": {
      const count = 5;
      content = (
        <>
          {Array.from({ length: count }).map((_, i) => (
            <Chair
              key={i}
              position={[(i - (count - 1) / 2) * 0.55, 0, 0]}
              rotation={[0, Math.PI, 0]}
            />
          ))}
        </>
      );
      break;
    }
    case "stage":
      content = <Stage width={worldWidth} depth={worldDepth} />;
      break;
    case "dance_floor":
      content = <DanceFloor size={Math.min(worldWidth, worldDepth)} />;
      break;
    case "bar":
      content = <Bar width={worldWidth} />;
      break;
    case "dj_booth":
      content = <DjBooth />;
      break;
    case "buffet":
      content = <RectTable width={worldWidth} depth={worldDepth} />;
      break;
    case "cake_table":
      content = <CakeTable />;
      break;
    case "gift_table":
      content = <GiftTable />;
      break;
    case "entrance":
      content = <EntranceArch />;
      break;
    case "house":
      content = <House width={worldWidth} depth={worldDepth} />;
      break;
    case "parking":
      content = <ParkingArea width={worldWidth} depth={worldDepth} />;
      break;
    default:
      content = <GenericBlock />;
  }

  return (
    <group position={[x, 0, z]} rotation={[0, rotationRad, 0]}>
      {content}
    </group>
  );
}

export default function VenueLayout3DView({
  tables,
  items,
}: {
  tables: SeatingTable[];
  items: VenueLayoutItem[];
}) {
  const { centerX, centerZ, spanX, spanZ } = computeBounds(tables, items);
  // Fit both dimensions of the bounding box in view, with headroom for the
  // camera's downward angle, then keep a sensible floor under a small layout.
  const distance = Math.max(spanX, spanZ) * 0.85 + 8;
  const floorSize: [number, number] = [Math.max(40, spanX + 16), Math.max(26, spanZ + 16)];

  return (
    <SceneCanvas target={[centerX, 0, centerZ]} distance={distance} floorSize={floorSize}>
      {items.map((item) => (
        <ItemScene key={item.id} item={item} />
      ))}
      {tables.map((table) => (
        <TableScene key={table.id} table={table} />
      ))}
    </SceneCanvas>
  );
}
