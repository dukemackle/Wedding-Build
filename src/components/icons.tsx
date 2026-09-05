import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: { children: ReactNode } & IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ChecklistIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" />
      <path d="M6 6h12a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="m8.5 12.5 1.75 1.75L14.5 10" />
      <path d="M8.5 17h4" />
    </IconBase>
  );
}

export function VenueIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V10l7-6 7 6v11" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 12h.01M15 12h.01" />
    </IconBase>
  );
}

export function CateringIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 3v6a2 2 0 0 1-2 2 2 2 0 0 1-2-2V3" />
      <path d="M5 11v10" />
      <path d="M17 3c-1.5 0-3 1.8-3 5s1.5 5 3 5 3-1.8 3-5-1.5-5-3-5Z" />
      <path d="M17 13v8" />
    </IconBase>
  );
}

export function PhotographyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="14" r="3.5" />
    </IconBase>
  );
}

export function VideographyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6h13a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M17 10.5 22 7v10l-5-3.5Z" />
    </IconBase>
  );
}

export function FloralsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="2.25" />
      <circle cx="12" cy="6" r="2.75" />
      <circle cx="12" cy="18" r="2.75" />
      <circle cx="6" cy="12" r="2.75" />
      <circle cx="18" cy="12" r="2.75" />
    </IconBase>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </IconBase>
  );
}

export function AttireIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 6.5a1.75 1.75 0 1 0-1.75-1.75" />
      <path d="M2 18.5 12 6.5l10 12-4 2-6-3.5-6 3.5Z" />
    </IconBase>
  );
}

export function PlannerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" />
      <path d="M6 6h12a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M8 12h8M8 16h5" />
    </IconBase>
  );
}

export function StationeryIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18v12H3Z" />
      <path d="m3 6 9 7 9-7" />
    </IconBase>
  );
}

export function FavorsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 9h18v4H3Z" />
      <path d="M5 13h14v8H5Z" />
      <path d="M12 9v12" />
      <path d="M12 9c0-2.5-1.5-4-3-4S6.5 6.5 9 9Z" />
      <path d="M12 9c0-2.5 1.5-4 3-4s2.5 2.5 0 4Z" />
    </IconBase>
  );
}

export function CakeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v3" />
      <path d="M11 6h2a1 1 0 0 1 1 1v1H10V7a1 1 0 0 1 1-1Z" />
      <path d="M4 12c1-1.5 2.5-1.5 3.5 0s2.5 1.5 3.5 0 2.5-1.5 3.5 0 2.5 1.5 3.5 0" />
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M4 16h16" />
    </IconBase>
  );
}

export function TransportationIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 16V11l2-5h10l3 5v5" />
      <path d="M2 16h20" />
      <circle cx="7" cy="16.5" r="1.75" />
      <circle cx="17" cy="16.5" r="1.75" />
    </IconBase>
  );
}

export function CustomItemIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m11 3 2 2 4-1 1 4-1 4-4-1-2 2-2-2-4 1-1-4 1-4 4 1Z" />
      <circle cx="11" cy="8" r="1.25" />
    </IconBase>
  );
}

export function HeadcountIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8" />
      <path d="M19 20v-1a5 5 0 0 0-3-4.6" />
    </IconBase>
  );
}

export function BudgetIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
      <path d="M3 10h18" />
      <path d="M16 15h2" />
    </IconBase>
  );
}

export function VendorsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 10V7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3" />
      <path d="M3 10h18v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
      <path d="M9.5 10v2a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-2" />
    </IconBase>
  );
}
