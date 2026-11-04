"use client";

import { useEffect, useState } from "react";
import { qrSvgColors } from "@/lib/qr";
import { templateById } from "@/lib/save-the-date/templates";
import { formatDate, wrapText } from "@/lib/save-the-date/format";
import { ARTBOARD, type CardDoc } from "@/lib/save-the-date/types";
import { fontById } from "@/lib/site-design";

function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
}

export type BackDetails = { url: string; travel: string };

/**
 * The "Details" back of a printed card: the website, a QR code to it, and an
 * optional travel line. No layout of its own per template -- it takes the
 * front's paper, ink, accent and fonts, so every template gets a matching back.
 */
export function CardBack({ doc, details, className }: { doc: CardDoc; details: BackDetails; className?: string }) {
  const t = templateById(doc.template);
  const p = t.palettes.find((x) => x.id === doc.palette) ?? t.palettes[0];
  const f = t.pairings.find((x) => x.id === doc.fonts) ?? t.pairings[0];
  const display = fontById(f.display)?.css ?? "serif";
  const script = fontById(f.script)?.css ?? display;
  const sans = fontById(f.sans)?.css ?? "sans-serif";
  const c = doc.content;
  // Phones read dark modules on a light ground most reliably, so the code
  // always takes the darker of paper/ink on the lighter one.
  const [dark, light] = lum(p.paper) < lum(p.ink) ? [p.paper, p.ink] : [p.ink, p.paper];
  const tile = light !== p.paper;
  const [qr, setQr] = useState("");
  useEffect(() => {
    qrSvgColors(`https://${details.url}`, dark, light).then((s) =>
      setQr(s.replace(/^[\s\S]*?<svg[^>]*viewBox="([^"]+)"[^>]*>/, '<svg viewBox="$1" width="100%" height="100%" shape-rendering="crispEdges">')),
    );
  }, [details.url, dark, light]);
  const initials = `${c.nameA.trim()[0] ?? ""} & ${c.nameB.trim()[0] ?? ""}`;
  const date = c.dateText.trim() || (c.date ? formatDate(c.date, "dots") : "");
  const Q = 300;
  const qx = (ARTBOARD.w - Q) / 2;
  const qy = 640;

  return (
    <svg viewBox={`0 0 ${ARTBOARD.w} ${ARTBOARD.h}`} className={className} role="img" aria-label="Back of the card">
      <rect width={ARTBOARD.w} height={ARTBOARD.h} fill={p.paper} />
      <rect x={45} y={45} width={910} height={1310} fill="none" stroke={p.accent} strokeOpacity={0.45} strokeWidth={2} />
      <text x={500} y={300} textAnchor="middle" fontFamily={script} fontSize={96} fill={p.accent}>{initials}</text>
      <line x1={460} x2={540} y1={360} y2={360} stroke={p.accent} strokeWidth={2} />
      <text x={500} y={470} textAnchor="middle" fontFamily={sans} fontSize={20} letterSpacing="0.4em" fill={p.muted}>OUR WEDDING WEBSITE</text>
      <text x={500} y={548} textAnchor="middle" fontFamily={display} fontSize={46} fill={p.ink}>{details.url}</text>
      {tile && <rect x={qx - 28} y={qy - 28} width={Q + 56} height={Q + 56} rx={18} fill={light} />}
      <foreignObject x={qx} y={qy} width={Q} height={Q}>
        <div style={{ width: Q, height: Q }} dangerouslySetInnerHTML={{ __html: qr }} />
      </foreignObject>
      <text x={500} y={1036} textAnchor="middle" fontFamily={sans} fontSize={18} letterSpacing="0.34em" fill={p.muted}>SCAN FOR TRAVEL, STAYS &amp; UPDATES</text>
      {details.travel && (
        <text x={500} y={1130} textAnchor="middle" fontFamily={display} fontStyle="italic" fontSize={32} fill={p.ink} opacity={0.85}>
          {wrapText(details.travel, 30).split("\n").map((line, i) => (
            <tspan key={i} x={500} dy={i ? 44 : 0}>{line}</tspan>
          ))}
        </text>
      )}
      <text x={500} y={1290} textAnchor="middle" fontFamily={sans} fontSize={17} letterSpacing="0.4em" fill={p.muted}>{date.toUpperCase()}</text>
    </svg>
  );
}
