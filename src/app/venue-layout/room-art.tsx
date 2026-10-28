import type { CSSProperties, ReactNode } from "react";
import type { LayoutItemType } from "@/lib/supabase/types";
import type { CenterpieceId, RoomStyle } from "@/lib/layout-styles";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/lib/venue-layout-geometry";

/**
 * The artwork that turns the plan into a room: floor, walls and fixtures
 * behind everything, a centrepiece on each table, and item surfaces that look
 * like what they are. Pure drawing -- nothing here is interactive, and the
 * backdrop ignores the pointer so a click on the floor still deselects.
 */

const W = CANVAS_WIDTH;
const H = CANVAS_HEIGHT;
const WALL = 18;

/** One string of fairy lights, sagging between two points. */
function lightString(x1: number, y1: number, x2: number, y2: number, key: string) {
  const bulbs: ReactNode[] = [];
  const steps = Math.round(Math.hypot(x2 - x1, y2 - y1) / 34);
  const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  let d = `M${x1} ${y1}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const sag = Math.abs(Math.sin(t * Math.PI * 5)) * 12;
    const x = x1 + (x2 - x1) * t + (horizontal ? 0 : sag);
    const y = y1 + (y2 - y1) * t + (horizontal ? sag : 0);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    bulbs.push(
      <g key={i}>
        <circle cx={x} cy={y} r={13} fill="url(#room-glow)" />
        <circle cx={x} cy={y} r={2.6} fill="#FFF12F" />
      </g>,
    );
  }
  return (
    <g key={key}>
      <path d={d} stroke="#3a2717" strokeWidth={1} fill="none" opacity={0.5} />
      {bulbs}
    </g>
  );
}

function Barn() {
  return (
    <>
      <defs>
        <pattern id="room-planks" width="240" height="30" patternUnits="userSpaceOnUse">
          <rect width="240" height="30" fill="#c99a68" />
          <rect width="150" height="15" fill="#c4935f" />
          <rect x="150" width="90" height="15" fill="#cfa274" />
          <rect x="-50" y="15" width="120" height="15" fill="#d1a677" />
          <rect x="70" y="15" width="170" height="15" fill="#c08c58" />
          <path d="M0 15H240M0 30H240M150 0V15M70 15V30" stroke="#9c6e43" strokeWidth="1" opacity="0.55" />
          <path d="M30 6q14 3 34 0M180 22q16 3 40 -1" stroke="#a87a4c" strokeWidth="0.8" fill="none" opacity="0.5" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#room-planks)" />
      {/* Beams overhead, seen from above as soft bands of shadow. */}
      {[400, 800, 1200].map((x) => (
        <rect key={x} x={x - 14} y={0} width={28} height={H} fill="#2b1a0d" opacity={0.13} />
      ))}
      {[260, 540].map((y) => lightString(WALL, y - 140, W - WALL, y - 140, `h${y}`))}
      {lightString(WALL, 700, W - WALL, 700, "h700")}
      {[300, 1300].map((x) => lightString(x, WALL, x, H - WALL, `v${x}`))}
      <rect x={WALL / 2} y={WALL / 2} width={W - WALL} height={H - WALL} fill="none" stroke="#5b3a22" strokeWidth={WALL} />
      {/* Windows down both long walls. */}
      {[180, 450, 720].map((y) => (
        <g key={y}>
          <rect x={2} y={y - 40} width={14} height={80} fill="#5AE4FF" opacity={0.75} />
          <rect x={W - 16} y={y - 40} width={14} height={80} fill="#5AE4FF" opacity={0.75} />
        </g>
      ))}
      {/* Sliding barn doors in the bottom wall. */}
      <g transform={`translate(${W / 2 - 120} ${H - WALL})`}>
        <rect width="240" height={WALL} fill="#c99a68" />
        <rect x="2" y="2" width="116" height={WALL - 4} fill="#8a3b2a" />
        <rect x="122" y="2" width="116" height={WALL - 4} fill="#8a3b2a" />
        <path d={`M2 2L118 ${WALL - 2}M118 2L2 ${WALL - 2}M122 2L238 ${WALL - 2}M238 2L122 ${WALL - 2}`} stroke="#f4efe2" strokeWidth="1.5" opacity="0.85" />
      </g>
      <text x={W / 2} y={H - WALL - 10} textAnchor="middle" fontSize="13" letterSpacing="3" fill="#5b3a22" style={{ fontFamily: "var(--font-mono-numbers)" }}>
        BARN DOORS
      </text>
    </>
  );
}

function Ballroom() {
  return (
    <>
      <defs>
        <pattern id="room-carpet" width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="#1d2d63" />
          <path d="M32 8l9 24-9 24-9-24z" fill="none" stroke="#2243B6" strokeWidth="1.6" />
          {[
            [0, 0],
            [64, 0],
            [0, 64],
            [64, 64],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="#9a6b00" opacity="0.6" />
          ))}
        </pattern>
        <radialGradient id="room-chandelier">
          <stop offset="0" stopColor="#FFF12F" stopOpacity="0.32" />
          <stop offset="1" stopColor="#FFF12F" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#room-carpet)" />
      {[
        [W / 2, H / 2],
        [W * 0.2, H * 0.3],
        [W * 0.8, H * 0.3],
        [W * 0.2, H * 0.72],
        [W * 0.8, H * 0.72],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={170} fill="url(#room-chandelier)" />
      ))}
      <rect x={WALL / 2} y={WALL / 2} width={W - WALL} height={H - WALL} fill="none" stroke="#e7ddc4" strokeWidth={WALL} />
      {/* Tall windows along the bottom wall, columns round the edge. */}
      {[0.15, 0.3, 0.7, 0.85].map((f) => (
        <rect key={f} x={W * f - 45} y={H - 14} width={90} height={12} fill="#5AE4FF" opacity={0.85} />
      ))}
      {[
        [WALL + 6, WALL + 6],
        [W - WALL - 6, WALL + 6],
        [WALL + 6, H - WALL - 6],
        [W - WALL - 6, H - WALL - 6],
        [WALL + 6, H / 2],
        [W - WALL - 6, H / 2],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={20} fill="#f6f3ec" stroke="#d9b44a" strokeWidth={2.5} />
          <circle cx={x} cy={y} r={11} fill="none" stroke="#d9b44a" strokeWidth={1.2} />
        </g>
      ))}
    </>
  );
}

export function RoomBackdrop({ style }: { style: RoomStyle }) {
  if (style === "blank") return null;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className="pointer-events-none absolute inset-0"
    >
      <defs>
        <radialGradient id="room-glow">
          <stop offset="0" stopColor="#FFF12F" stopOpacity="0.85" />
          <stop offset="0.4" stopColor="#FFD301" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FFD301" stopOpacity="0" />
        </radialGradient>
      </defs>
      {style === "barn" ? <Barn /> : <Ballroom />}
    </svg>
  );
}

/** What sits in the middle of a table, drawn to fit a box `size` across. */
export function Centerpiece({ kind, size }: { kind: CenterpieceId; size: number }) {
  if (kind === "none") return null;
  const blooms = (colors: string[], r: number) =>
    colors.map((c, i) => {
      const a = (i / colors.length) * Math.PI * 2;
      return <circle key={i} cx={50 + Math.cos(a) * r} cy={50 + Math.sin(a) * r} r={14} fill={c} />;
    });
  let art: ReactNode;
  switch (kind) {
    case "wildflowers":
      art = (
        <>
          <circle cx="50" cy="50" r="30" fill="#6f9a5f" />
          {blooms(["#f4efe2", "#e8c5b0", "#FFD301", "#f4efe2", "#c9a0d6"], 16)}
          <circle cx="50" cy="50" r="7" fill="#FFD301" />
        </>
      );
      break;
    case "lanterns":
      art = (
        <>
          <circle cx="50" cy="50" r="34" fill="#FFD301" opacity="0.25" />
          <rect x="34" y="34" width="32" height="32" rx="5" fill="#3a2717" />
          <rect x="40" y="40" width="20" height="20" rx="3" fill="#FFF12F" />
        </>
      );
      break;
    case "greenery":
      art = (
        <>
          <ellipse cx="50" cy="50" rx="40" ry="16" fill="#5f8a5a" />
          {[22, 38, 62, 78].map((x) => (
            <ellipse key={x} cx={x} cy={50} rx="9" ry="5" fill="#86ad7c" transform={`rotate(${x % 2 ? 30 : -30} ${x} 50)`} />
          ))}
        </>
      );
      break;
    case "candles":
      art = (
        <>
          <circle cx="50" cy="50" r="36" fill="#FFD301" opacity="0.2" />
          {[
            [40, 42],
            [60, 44],
            [50, 60],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="9" fill="#f4efe2" stroke="#d9cfb4" />
              <circle cx={x} cy={y} r="3" fill="#FFD301" />
            </g>
          ))}
        </>
      );
      break;
    case "tall_florals":
      art = (
        <>
          <circle cx="50" cy="50" r="42" fill="#FFF12F" opacity="0.18" />
          <circle cx="50" cy="50" r="30" fill="#f4efe2" stroke="#d9b44a" strokeWidth="2.5" />
          {blooms(["#f2d6d6", "#ffffff", "#e9e1c8", "#f2d6d6", "#ffffff", "#e8c5b0"], 15)}
          <circle cx="50" cy="50" r="8" fill="#f2d6d6" />
        </>
      );
      break;
    case "candelabra":
      art = (
        <>
          <circle cx="50" cy="50" r="40" fill="#FFF12F" opacity="0.2" />
          <circle cx="50" cy="50" r="22" fill="none" stroke="#d9b44a" strokeWidth="4" />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            return <circle key={i} cx={50 + Math.cos(a) * 22} cy={50 + Math.sin(a) * 22} r="5" fill="#FFD301" />;
          })}
          <circle cx="50" cy="50" r="6" fill="#FFD301" />
        </>
      );
      break;
    case "low_roses":
      art = (
        <>
          <circle cx="50" cy="50" r="28" fill="#86ad7c" />
          {blooms(["#e8c5b0", "#f2d6d6", "#ffffff", "#e8c5b0"], 12)}
          <circle cx="50" cy="50" r="8" fill="#f2d6d6" />
        </>
      );
      break;
  }
  return (
    <svg aria-hidden viewBox="0 0 100 100" width={size} height={size} className="pointer-events-none">
      {art}
    </svg>
  );
}

type Surface = { style: CSSProperties; ink: string; border: string };

const PLANKS =
  "repeating-linear-gradient(0deg, #b98a5a 0 12px, #a97c4f 12px 13px, #c4935f 13px 25px, #a97c4f 25px 26px)";
const PARQUET =
  "repeating-conic-gradient(#a06c40 0 25%, #8e5e36 0 50%) 0 0 / 26px 26px";
const MARBLE =
  "repeating-conic-gradient(#f6f3ec 0 25%, #e7e0cf 0 50%) 0 0 / 40px 40px";

/**
 * How a layout item is drawn in a dressed room. The plain room keeps the
 * existing tinted boxes, so this returns null there.
 */
export function itemSurface(style: RoomStyle, type: LayoutItemType): Surface | null {
  if (style === "blank") return null;
  const barn = style === "barn";
  switch (type) {
    case "dance_floor":
      return barn
        ? { style: { background: PARQUET }, ink: "#fff6d6", border: "#5b3a22" }
        : { style: { background: MARBLE, boxShadow: "inset 0 0 0 6px #fff, inset 0 0 0 8px #d9b44a" }, ink: "#9a6b00", border: "#d9b44a" };
    case "stage":
      return barn
        ? { style: { background: PLANKS }, ink: "#3a2717", border: "#5b3a22" }
        : { style: { background: "#2a1f3d" }, ink: "#f6f3ec", border: "#d9b44a" };
    case "dj_booth":
      return {
        style: { background: "radial-gradient(circle at 16% 50%, #00BFFE 0 3px, #555 4px 13px, transparent 14px), radial-gradient(circle at 84% 50%, #00BFFE 0 3px, #555 4px 13px, transparent 14px), #262626" },
        ink: "#f6f3ec",
        border: barn ? "#3a2717" : "#d9b44a",
      };
    case "bar":
      return barn
        ? { style: { background: "#7a5232" }, ink: "#fff6d6", border: "#3a2717" }
        : { style: { background: "#f6f3ec" }, ink: "#14203d", border: "#d9b44a" };
    case "cake_table":
      return {
        style: { background: "radial-gradient(circle, #fff 0 10px, #f2d6d6 11px 13px, #fff 14px 22px, #e8c5b0 23px 25px, #fff 26px)" },
        ink: "#14203d",
        border: barn ? "#7a5232" : "#d9b44a",
      };
    case "chairs":
      return {
        style: { background: `repeating-linear-gradient(90deg, ${barn ? "#8a5d36" : "#d9b44a"} 0 18px, transparent 18px 26px)` },
        ink: barn ? "#3a2717" : "#f6f3ec",
        border: "transparent",
      };
    case "entrance":
    case "parking":
    case "house":
      return barn
        ? { style: { background: "rgba(255,246,214,0.55)" }, ink: "#3a2717", border: "#5b3a22" }
        : { style: { background: "rgba(246,243,236,0.14)" }, ink: "#f6f3ec", border: "#e7ddc4" };
    default:
      return barn
        ? { style: { background: PLANKS }, ink: "#3a2717", border: "#7a5232" }
        : { style: { background: "#f6f3ec" }, ink: "#14203d", border: "#d9b44a" };
  }
}
