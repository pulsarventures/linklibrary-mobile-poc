import React from 'react';
import type { SvgProps } from 'react-native-svg';
import { Svg, Path, Polyline, Rect } from 'react-native-svg';
import type { ColorValue } from 'react-native';

export type IconName =
  | 'add'
  | 'apple'
  | 'check'
  | 'eye'
  | 'fire'
  | 'google'
  | 'grid'
  | 'hash'
  | 'language'
  | 'link'
  | 'list'
  | 'lock'
  | 'mail'
  | 'send'
  | 'theme'
  | 'user'
  | 'collection'
  | 'tag'
  | 'settings'
  | 'sun'
  | 'moon'
  | 'device'
  | 'trash'
  | 'library'
  | 'library-big'
  | 'star';

const createIcon = (renderPaths: (color: ColorValue) => React.ReactNode) => {
  return ({ color = '#000', ...props }: SvgProps) => (
    <Svg viewBox="0 0 24 24" width={24} height={24} {...props}>
      {renderPaths(color)}
    </Svg>
  );
};

export const icons: Record<IconName, React.FC<SvgProps>> = {
  add: createIcon((color) => (
    <Path
      d="M12 5V19M5 12H19"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )),

  grid: createIcon((color) => (
    <>
      <Path
        d="M4 4H10V10H4V4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 4H20V10H14V4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M4 14H10V20H4V14Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 14H20V20H14V14Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  )),

  list: createIcon((color) => (
    <>
      <Path
        d="M8 6H21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 12H21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 18H21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 6H3.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 12H3.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 18H3.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )),

  apple: createIcon((color) => (
    <Path
      d="M17.05 12.3c-.03-2.05 1.63-3.1 1.7-3.15-.93-1.4-2.38-1.59-2.9-1.6-1.23-.13-2.4.74-3.03.74-.62 0-1.58-.72-2.6-.7-1.34.02-2.57.8-3.26 2.03-1.4 2.49-.36 6.19 1 8.21.67.98 1.47 2.1 2.5 2.05 1.01-.04 1.4-.66 2.62-.66 1.22 0 1.57.66 2.63.64 1.09-.02 1.77-.99 2.44-1.98.77-1.13 1.08-2.23 1.1-2.29-.02-.01-2.11-.83-2.13-3.28zM15.22 6.17c.56-.7.93-1.66.83-2.62-.8.04-1.77.55-2.34 1.23-.51.61-.96 1.58-.84 2.51.89.07 1.8-.45 2.35-1.12z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  )),
  check: createIcon((color) => (
    <Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )),
  eye: createIcon((color) => (
    <>
      <Path
        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  )),
  fire: createIcon((color) => (
    <Path
      d="M12 2L3 14H12L9 22L21 10H12L15 2H12Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  )),
  google: createIcon((color) => (
    <>
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  )),
  language: createIcon((color) => (
    <>
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M2 12H22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  )),
  lock: createIcon((color) => (
    <>
      <Path
        d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  )),
  mail: createIcon((color) => (
    <>
      <Path
        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M22 6L12 13L2 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )),
  send: createIcon((color) => (
    <Path
      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  )),
  theme: createIcon((color) => (
    <Path
      d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  )),
  user: createIcon((color) => (
    <>
      <Path
        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  )),
  collection: createIcon((color) => (
    <>
      <Path
        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M2 10H22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )),
  tag: createIcon((color) => (
    <Path
      d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  )),
  settings: createIcon((color) => (
    <>
      <Path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  )),
  sun: createIcon((color) => (
    <>
      <Path
        d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M12 1V3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 21V23"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.22 4.22L5.64 5.64"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.36 18.36L19.78 19.78"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 12H3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 12H23"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.22 19.78L5.64 18.36"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.36 5.64L19.78 4.22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )),
  moon: createIcon((color) => (
    <Path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  )),
  device: createIcon((color) => (
    <>
      <Path
        d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M1 10H23"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )),
  link: createIcon((color) => (
    <>
      <Path
        d="M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9404 15.7513 14.6898C16.423 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59699 21.9548 8.33397 21.9434 7.02299C21.932 5.71201 21.4061 4.45794 20.4791 3.5309C19.5521 2.60386 18.298 2.07802 16.987 2.06663C15.676 2.05523 14.413 2.55921 13.47 3.47L11.75 5.18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3935 9.60707C11.7643 9.26331 11.0685 9.05889 10.3534 9.00768C9.63821 8.95646 8.92041 9.05964 8.24871 9.31023C7.577 9.56082 6.96689 9.95294 6.46 10.46L3.46 13.46C2.54921 14.403 2.04524 15.666 2.05663 16.977C2.06802 18.288 2.59387 19.5421 3.52091 20.4691C4.44795 21.3961 5.70201 21.922 7.013 21.9334C8.32398 21.9448 9.58699 21.4408 10.53 20.53L12.24 18.82"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  )),
  hash: createIcon((color) => (
    <>
      <Path
        d="M4 9H20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 15H20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 3L8 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 3L14 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )),
  trash: createIcon((color) => (
    <>
      <Polyline points="3 6 5 6 21 6" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke={color as string} strokeWidth={2} strokeLinejoin="round" fill="none" />
      <Path d="M10 11v6" stroke={color as string} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M14 11v6" stroke={color as string} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  )),
  library: createIcon((color) => (
    <>
      <Path d="m16 6 4 14" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M12 6v14" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M8 8v12" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M4 4v16" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  )),
  'library-big': createIcon((color) => (
    <>
      <Rect x={3} y={3} width={8} height={18} rx={1} stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M7 3v18" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" stroke={color as string} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  )),
  star: createIcon((color) => (
    <Path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      stroke={color as string}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  )),
}; 