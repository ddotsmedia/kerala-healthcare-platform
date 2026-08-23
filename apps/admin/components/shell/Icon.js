// Icon — inline SVG set (no icon package). 24x24, currentColor stroke.

const PATHS = {
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  providers: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6z',
  reviews: 'M12 2l3 6 6 .9-4.5 4.3 1 6.1L12 17l-5.5 3.3 1-6.1L3 8.9 9 8z',
  qa: 'M4 4h16v12H8l-4 4V4z',
  forum: 'M4 4h12v9H8l-4 3V4zm5 12h11v6l-3-2H9v-4z',
  news: 'M4 4h16v16H4V4zm3 4h6v4H7V8zm0 6h10v2H7v-2zm8-6h2v4h-2V8z',
  cms: 'M4 4h16v4H4V4zm0 6h10v10H4V10zm12 0h4v10h-4V10z',
  import: 'M12 3v10m0 0l-4-4m4 4l4-4M4 17v3h16v-3',
  keys: 'M14 8a4 4 0 1 0-3.5 6H12l2 2 2-2 2 2 2-2-2-2a4 4 0 0 0-4-4zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z',
  analytics: 'M4 20V10m5 10V4m5 16v-6m5 6V8',
  opinion: 'M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9h9v-9a9 9 0 0 0-9-9z',
  bell: 'M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zm0 18a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z',
  sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  chevron: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  bolt: 'M13 2L4 14h6l-1 8 9-12h-6z'
};

export default function Icon({ name, className = 'h-5 w-5', filled = false }) {
  const d = PATHS[name] || PATHS.dashboard;
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
