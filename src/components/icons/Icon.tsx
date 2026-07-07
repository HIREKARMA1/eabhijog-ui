import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "dashboard"
  | "grievances"
  | "reports"
  | "staff"
  | "departments"
  | "filter"
  | "back"
  | "menu"
  | "close"
  | "chevron-right";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  grievances: (
    <>
      <path d="M7 4h10a2 2 0 0 1 2 2v14l-4-3-4 3-4-3-4 3V6a2 2 0 0 1 2-2z" />
    </>
  ),
  reports: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 17V9" />
      <path d="M12 17V7" />
      <path d="M16 17v-5" />
    </>
  ),
  staff: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
      <path d="M16 11h6" />
      <path d="M19 8v6" />
    </>
  ),
  departments: (
    <>
      <path d="M3 21h18" />
      <path d="M6 21V7l6-4 6 4v14" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  filter: (
    <>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </>
  ),
  back: (
    <>
      <path d="M19 12H5" />
      <path d="M12 5l-7 7 7 7" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  "chevron-right": (
    <>
      <path d="M9 6l6 6-6 6" />
    </>
  ),
};

export function Icon({ name, size = 18, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
