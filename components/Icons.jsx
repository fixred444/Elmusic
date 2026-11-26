const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const mk = (children, extra = {}) =>
  function Icon({ size = 22, ...p }) {
    return (
      <svg {...base} {...extra} width={size} height={size} {...p}>
        {children}
      </svg>
    );
  };

const solid = { fill: 'currentColor', stroke: 'none' };

export const IconHome = mk(<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />);
export const IconSearch = mk(<><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>);
export const IconLibrary = mk(<path d="M5 5v14M10 5v14M15.2 6.2l4 12.6" />);
export const IconPlus = mk(<path d="M12 5v14M5 12h14" />);
export const IconPlay = mk(<path d="M8 5.5v13l11-6.5z" />, solid);
export const IconPause = mk(<><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></>, solid);
export const IconNext = mk(<><path d="M6 6.5v11l9-5.5z" /><rect x="16" y="6" width="2.2" height="12" rx="1" /></>, solid);
export const IconPrev = mk(<><path d="M18 6.5v11L9 12z" /><rect x="5.8" y="6" width="2.2" height="12" rx="1" /></>, solid);
export const IconShuffle = mk(<path d="M4 7h3.5c5 0 5 10 10 10H20M4 17h3.5c1.6 0 2.7-.7 3.6-1.8M14 8.2c.9-.7 1.9-1.2 3.5-1.2H20M17.5 4l3 3-3 3M17.5 14l3 3-3 3" />);
export const IconRepeat = mk(<path d="M4 11V9.5A2.5 2.5 0 0 1 6.5 7H19M16 4l3 3-3 3M20 13v1.5a2.5 2.5 0 0 1-2.5 2.5H5M8 20l-3-3 3-3" />);
export const IconRepeatOne = mk(<><path d="M4 11V9.5A2.5 2.5 0 0 1 6.5 7H19M16 4l3 3-3 3M20 13v1.5a2.5 2.5 0 0 1-2.5 2.5H5M8 20l-3-3 3-3" /><path d="M11 10.6l1.3-.9v4.6" strokeWidth="1.5" /></>);
export const IconVolume = mk(<><path d="M5 9.5h3l4-3.5v12l-4-3.5H5z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>);
export const IconMute = mk(<><path d="M5 9.5h3l4-3.5v12l-4-3.5H5z" /><path d="m16 9.5 5 5M21 9.5l-5 5" /></>);
export const IconDown = mk(<path d="m6 9 6 6 6-6" />);
export const IconQueue = mk(<path d="M4 6h12M4 11h12M4 16h6M16 14.5v5l4-2.5z" />);
export const IconUpload = mk(<path d="M12 16V5M7.5 9.5 12 5l4.5 4.5M5 19h14" />);
export const IconClose = mk(<path d="M6 6l12 12M18 6 6 18" />);
export const IconCheck = mk(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const IconNote = mk(<path d="M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zm10-2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />);
export const IconMic = mk(<><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" /><path d="M6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20" /></>);
export const IconMore = mk(<><circle cx="5.5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18.5" cy="12" r="1.4" /></>, solid);

export function IconHeart({ filled = false, size = 22, ...p }) {
  return (
    <svg {...base} width={size} height={size} {...p} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />
    </svg>
  );
}
