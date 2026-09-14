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

export function BarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4h16l-7 8v7" />
      <path d="M9 19h6" />
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

export function ToastIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 3c0 3 .5 5 3 5s3-2 3-5Z" />
      <path d="M9 8v9M6.5 17h5" />
      <path d="M15 6c0 2.5.5 4 2.5 4s2.5-1.5 2.5-4Z" />
      <path d="M17.5 10v7M15.5 17h4" />
    </IconBase>
  );
}

export function BuntingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18" />
      <path d="m5 6 2.5 5L10 6" />
      <path d="m11 6 2.5 5L16 6" />
      <path d="m17 6 2 4 2-4" />
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

export function ChatIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </IconBase>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m4 4 16 8-16 8 4-8-4-8Z" />
    </IconBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  );
}

// A wren, for the assistant mascot and the Help & Feedback nav item --
// round body, a cocked tail (the wren's signature silhouette), a small
// beak and eye.
export function WrenBirdIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <ellipse cx="12" cy="14" rx="6.5" ry="5.5" />
      <circle cx="17.3" cy="9" r="2.8" />
      <path d="M19.8 8.7 22 9.3 19.6 9.9" />
      <path d="M17.6 8.3h.01" />
      <path d="M7 11 2.5 3" />
      <path d="M8.6 10.3 5.2 2.3" />
      <path d="M9 13c2 1.5 5 1.5 7-.5" />
      <path d="M11 19.4 9.6 22.4" />
      <path d="M14.4 19.4 15.4 22.4" />
    </IconBase>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z" />
    </IconBase>
  );
}

export function GuestbookIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 6.5c-1.8-1.3-4-2-6.5-2A2 2 0 0 0 4 6.4v11.1c0 .8.9 1.3 1.6.9 1.5-.8 3.2-1.2 4.9-1.2 1 0 2 .2 3 .5" />
      <path d="M12 6.5c1.8-1.3 4-2 6.5-2A2 2 0 0 1 20 6.4v11.1c0 .8-.9 1.3-1.6.9-1.5-.8-3.2-1.2-4.9-1.2-1 0-2 .2-3 .5" />
      <path d="M12 6.5v13.5" />
    </IconBase>
  );
}

export function FeedbackIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="m9.5 12 1.75 1.75L15 10" />
    </IconBase>
  );
}

export function HairMakeupIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 11a4 4 0 1 1 8 0c0 2.5-1 4-1 6a3 3 0 0 1-6 0c0-2-1-3.5-1-6Z" />
      <path d="M9 8c-1-2-.5-4 1-5M15 8c1-2 .5-4-1-5" />
      <circle cx="17" cy="17" r="2.5" />
      <path d="m18.8 18.8 2.2 2.2" />
    </IconBase>
  );
}

export function RingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9" cy="14" r="5" />
      <circle cx="15" cy="14" r="5" />
      <path d="M9 9v-2l1.5-3h1L13 7v2" />
    </IconBase>
  );
}

export function OfficiantIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v7" />
      <path d="M9 6h6" />
      <path d="M7 21c0-4 2-6 5-6s5 2 5 6" />
      <circle cx="12" cy="13" r="2.5" />
    </IconBase>
  );
}

export function GratuitiesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 10 12 4l9 6" />
      <path d="M5 10v9h14v-9" />
      <path d="M10 19v-5a2 2 0 0 1 4 0v5" />
    </IconBase>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </IconBase>
  );
}

export function NotesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M15 3v4h4" />
      <path d="M8 12h8M8 15.5h8M8 8.5h4" />
    </IconBase>
  );
}

// A flower-topped ceremony arch -- the Dashboard is the "your wedding at
// a glance" page, so it gets the ceremony itself rather than a generic
// house or gauge.
export function ArchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 21V11a6 6 0 0 1 12 0v10" />
      <path d="M4 21h16" />
      <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
      <path d="M8.5 7.5c-.8-.9-.6-2 .4-2.4M15.5 7.5c.8-.9.6-2-.4-2.4" />
    </IconBase>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6h16" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14" />
      <path d="M10 11v6M14 11v6" />
    </IconBase>
  );
}
