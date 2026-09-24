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
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  WORLD_SCALE as SCALE,
  itemDimensions,
  tableFootprint,
} from "@/lib/venue-layout-geometry";

/**
 * How each item type fills the footprint the 2D editor gives it.
 *
 * "stretch" items are areas -- a dance floor or a parking bay is whatever
 * shape you draw it. "contain" items are objects with fixed proportions; a
 * cake stretched to a long thin box would just look broken, so it scales up
 * or down inside the footprint instead.
 *
 * The intrinsic size is the mesh's own width and depth in metres, which is
 * what the scale factors are measured against.
 */
const ITEM_FIT: Record<string, { mode: "stretch" | "contain"; intrinsic: [number, number] }> = {
  dj_booth: { mode: "contain", intrinsic: [1.2, 0.6] },
  cake_table: { mode: "contain", intrinsic: [1.1, 1.1] },
  gift_table: { mode: "contain", intrinsic: [1.3, 0.7] },
  entrance: { mode: "contain", intrinsic: [1.32, 0.5] },
  other: { mode: "contain", intrinsic: [0.8, 0.8] },
};

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
    const { width, height } = tableFootprint(table);
    // Chairs extend past the table itself, so pad the footprint for them.
    include(table.position_x, table.position_y, width, height, 1.2);
  }
  for (const item of items) {
    const { width, height } = itemDimensions(item);
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
  const { width, height } = tableFootprint(table);
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
        rotation={[0, side === -1 ? 0 : Math.PI, 0]}
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
  const { width, height } = itemDimensions(item);
  const [x, z] = toWorld(item.position_x + width / 2, item.position_y + height / 2);
  const worldWidth = width / SCALE;
  const worldDepth = height / SCALE;
  const rotationRad = (item.rotation * Math.PI) / 180;

  let content: React.ReactElement;
  switch (item.item_type as LayoutItemType) {
    case "chairs": {
      // The block's own size decides how many chairs are in it, so widening
      // the block in the editor adds chairs instead of stretching five.
      const spacing = 0.55;
      const perRow = Math.max(1, Math.min(40, Math.round(worldWidth / spacing)));
      const rows = Math.max(1, Math.min(10, Math.round(worldDepth / spacing)));
      content = (
        <>
          {Array.from({ length: rows }).map((_, row) =>
            Array.from({ length: perRow }).map((_, col) => (
              <Chair
                key={`${row}-${col}`}
                position={[
                  (col - (perRow - 1) / 2) * spacing,
                  0,
                  (row - (rows - 1) / 2) * spacing,
                ]}
                rotation={[0, Math.PI, 0]}
              />
            )),
          )}
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
    case "buffet":
      content = <RectTable width={worldWidth} depth={worldDepth} />;
      break;
    case "dj_booth":
      content = <DjBooth />;
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

  // Anything whose mesh is a fixed size gets scaled to the footprint the
  // editor shows, so the two views agree on where a thing starts and ends.
  const fit = ITEM_FIT[item.item_type];
  let scale: [number, number, number] = [1, 1, 1];
  if (fit) {
    const [iw, id] = fit.intrinsic;
    if (fit.mode === "contain") {
      const s = Math.min(worldWidth / iw, worldDepth / id);
      scale = [s, s, s];
    } else {
      scale = [worldWidth / iw, 1, worldDepth / id];
    }
  } else if (item.item_type === "dance_floor") {
    // DanceFloor draws a square, so stretch it to the footprint's aspect.
    const base = Math.min(worldWidth, worldDepth);
    scale = [worldWidth / base, 1, worldDepth / base];
  }

  return (
    <group position={[x, 0, z]} rotation={[0, rotationRad, 0]} scale={scale}>
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
