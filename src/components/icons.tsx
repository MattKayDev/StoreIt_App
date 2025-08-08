import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2" />
      <path d="M21 14v2a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16v-2" />
      <path d="M3 12v.01" />
      <path d="M12 12v.01" />
      <path d="M21 12v.01" />
      <path d="m3.45 10.12 7.07-4.02a2 2 0 0 1 1.96 0l7.07 4.02" />
      <path d="m20.55 13.88-7.07 4.02a2 2 0 0 1-1.96 0l-7.07-4.02" />
    </svg>
  ),
};
