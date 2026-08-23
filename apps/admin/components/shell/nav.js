// Shared admin navigation model.
export const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/verification', label: 'Providers', icon: 'providers' },
  { href: '/reviews', label: 'Reviews', icon: 'reviews' },
  { href: '/qa', label: 'Q&A', icon: 'qa' },
  { href: '/forum', label: 'Forum', icon: 'forum' },
  { href: '/second-opinion', label: '2nd Opinion', icon: 'opinion' },
  { href: '/news', label: 'News', icon: 'news' },
  { href: '/cms', label: 'CMS', icon: 'cms' },
  { href: '/import', label: 'Import', icon: 'import' },
  { href: '/api-keys', label: 'API Keys', icon: 'keys' },
  { href: '/analytics', label: 'Analytics', icon: 'analytics' }
];

/** Human breadcrumb label for a pathname. */
export function crumbFor(pathname) {
  const seg = (pathname || '/').split('/').filter(Boolean);
  if (seg.length === 0) return ['Dashboard'];
  const map = Object.fromEntries(NAV.map((n) => [n.href.slice(1), n.label]));
  return seg.map((s, i) => (i === 0 ? (map[s] || cap(s)) : cap(s)));
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
