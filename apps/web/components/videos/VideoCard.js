// VideoCard — YouTube thumbnail, title, doctor, duration, views. Links to detail.

import Link from 'next/link';

const CAT_LABEL = {
  'health-tips': ['ആരോഗ്യ നുറുങ്ങുകൾ', 'Health Tips'],
  condition: ['രോഗാവസ്ഥ', 'Condition'],
  nutrition: ['പോഷകാഹാരം', 'Nutrition'],
  'mental-health': ['മാനസികാരോഗ്യം', 'Mental Health'],
  prevention: ['പ്രതിരോധം', 'Prevention'],
  ayurveda: ['ആയുർവേദം', 'Ayurveda']
};

export function fmtDuration(sec) {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoCard({ video, locale = 'ml' }) {
  const ml = locale === 'ml';
  const title = (ml ? video.title_ml : video.title_en) || video.title_en;
  const thumb = `https://i.ytimg.com/vi/${video.youtube_video_id}/hqdefault.jpg`;
  const cat = CAT_LABEL[video.category];
  const duration = fmtDuration(video.duration_seconds);

  return (
    <Link href={`/${locale}/videos/${video.slug}`} className="group block overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-brand">
      <div className="relative aspect-video bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumb} alt={title} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition group-hover:bg-red-600">▶</span>
        </span>
        {duration && <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-medium text-white">{duration}</span>}
      </div>
      <div className="p-3">
        {cat && <span className="text-[11px] font-semibold text-brand">{ml ? cat[0] : cat[1]}</span>}
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-xs text-gray-500">
          {video.doctor_name ? `${video.doctor_name} · ` : ''}{video.view_count || 0} {ml ? 'കാഴ്ചകൾ' : 'views'}
        </p>
      </div>
    </Link>
  );
}
