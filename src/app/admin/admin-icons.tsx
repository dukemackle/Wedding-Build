import type { ReactNode, SVGProps } from "react";

// Line icons for the admin menu and page headers, one per page, so a page can
// be found by shape as well as by its label. 24px grid, drawn at 16-18px.
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: { children: ReactNode } & IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      {...props}
    >
      {children}
    </svg>
  );
}

export type AdminIconName = keyof typeof ADMIN_ICONS;

const ADMIN_ICONS = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  wren: (
    <>
      <ellipse cx="12" cy="14" rx="6.5" ry="5.5" />
      <circle cx="17.3" cy="9" r="2.8" />
      <path d="M19.8 8.7 22 9.3 19.6 9.9M7 11 2.5 3M8.6 10.3 5.2 2.3" />
    </>
  ),
  bell: <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />,
  map: <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14" />,
  venue: <path d="M3 21h18M5 21V10l7-6 7 6v11M10 21v-5h4v5" />,
  vendor: <path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6" />,
  claim: (
    <>
      <path d="M12 3l2.5 2 3.2-.3.8 3.1 2.7 1.8-1.3 3 1.3 3-2.7 1.7-.8 3.1-3.2-.3L12 22l-2.5-2-3.2.3-.8-3.1-2.7-1.7 1.3-3-1.3-3 2.7-1.8.8-3.1 3.2.3z" />
      <path d="M8.5 12.5 11 15l4.5-5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  flag: <path d="M4 22V4M4 4h13l-2 4 2 4H4" />,
  tag: (
    <>
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </>
  ),
  heart: <path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.3 12 20 12 20z" />,
  chat: <path d="M21 12a8 8 0 0 1-11.8 7L3 21l2-6.2A8 8 0 1 1 21 12z" />,
  photo: (
    <>
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M21 17l-5-5-9 8" />
    </>
  ),
  dollar: <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  funnel: <path d="M3 4h18l-7 8v6l-4 2v-8z" />,
  log: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  alert: <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />,
  dress: <path d="M9 3l1 4-4 14h12L14 7l1-4M10 7h4" />,
  calc: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h8" />
    </>
  ),
  inbox: <path d="M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />,
  pulse: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7 12 13 2 7" />
    </>
  ),
  check: <path d="M5 12.5 10 17l9-10" />,
};

export function AdminIcon({ name, ...props }: { name: AdminIconName } & IconProps) {
  return <Icon {...props}>{ADMIN_ICONS[name]}</Icon>;
}
