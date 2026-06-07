declare module 'react' {
  export type ReactNode = any;
  export type ReactElement = any;
  export interface HTMLAttributes<T = any> {
    className?: string;
    children?: ReactNode;
    [key: string]: any;
  }
}

declare module 'next/link' {
  import type { ReactNode } from 'react';
  const Link: (props: { href: string; className?: string; children?: ReactNode; key?: any; [key: string]: any }) => any;
  export default Link;
}

declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
  }
}

declare module 'next/font/google' {
  export function IBM_Plex_Mono(options: { subsets: string[]; weight: string[]; variable: string }): { variable: string };
  export function IBM_Plex_Sans(options: { subsets: string[]; weight: string[]; variable: string }): { variable: string };
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'next/navigation' {
  export function usePathname(): string;
}
