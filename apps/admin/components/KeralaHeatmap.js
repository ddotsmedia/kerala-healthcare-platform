// KeralaHeatmap — simplified 14-district schematic map; cell colour intensity =
// activity. Pure SVG, theme-aware labels. `data`: [{ district, value }].

const DISTRICTS = [
  ['Kasaragod', 14, 8], ['Kannur', 14, 42], ['Wayanad', 96, 46],
  ['Kozhikode', 14, 76], ['Malappuram', 60, 96], ['Palakkad', 132, 96],
  ['Thrissur', 34, 132], ['Ernakulam', 34, 168], ['Idukki', 120, 160],
  ['Kottayam', 50, 202], ['Alappuzha', 10, 224], ['Pathanamthitta', 100, 234],
  ['Kollam', 34, 268], ['Thiruvananthapuram', 30, 302]
];
const W = 78, H = 28;

export default function KeralaHeatmap({ data = [], label = 'District activity' }) {
  const map = Object.fromEntries((data || []).map((d) => [String(d.district || d.name || '').toLowerCase(), Number(d.value ?? d.searches ?? 0)]));
  const max = Math.max(1, ...Object.values(map));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-soft">{label}</span>
        <span className="flex items-center gap-1 text-[10px] text-ink-soft">
          low <span className="inline-block h-3 w-16 rounded" style={{ background: 'linear-gradient(90deg, rgba(13,148,136,0.12), rgba(13,148,136,1))' }} /> high
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 220 344" className="h-80 w-full max-w-xs" role="img" aria-label={label}>
          {DISTRICTS.map(([name, x, y]) => {
            const v = map[name.toLowerCase()] || 0;
            const op = 0.12 + (v / max) * 0.88;
            return (
              <g key={name}>
                <rect x={x} y={y} width={W} height={H} rx="6" fill="#0d9488" fillOpacity={v ? op : 0.08}
                  stroke="#0f766e" strokeOpacity="0.4" strokeWidth="0.8" />
                <text x={x + W / 2} y={y + 12} textAnchor="middle" fontSize="7.5" fontWeight="700"
                  fill={v / max > 0.5 ? '#ffffff' : 'currentColor'} className="text-ink">{name.length > 11 ? `${name.slice(0, 10)}…` : name}</text>
                <text x={x + W / 2} y={y + 21} textAnchor="middle" fontSize="7"
                  fill={v / max > 0.5 ? '#ffffff' : 'currentColor'} className="text-ink-soft">{v}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
