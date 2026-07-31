// Doctor educational videos — gallery with category tabs + specialty filter.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listVideos, videoSpecialties, VIDEO_CATEGORIES } from '@/lib/videos';
import { FullBleed } from '@/components/home/HomeSections';
import { EmptyState, Pagination } from '@khp/ui';
import VideoCard from '@/components/videos/VideoCard';

export const dynamic = 'force-dynamic';
const LIMIT = 12;

const CAT_LABEL = {
  'health-tips': ['ആരോഗ്യ നുറുങ്ങുകൾ', 'Health Tips'],
  condition: ['രോഗാവസ്ഥ', 'Conditions'],
  nutrition: ['പോഷകാഹാരം', 'Nutrition'],
  'mental-health': ['മാനസികാരോഗ്യം', 'Mental Health'],
  prevention: ['പ്രതിരോധം', 'Prevention'],
  ayurveda: ['ആയുർവേദം', 'Ayurveda']
};

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'ഡോക്ടർ വീഡിയോകൾ | MalayaliDoctor' : 'Doctor Videos | MalayaliDoctor',
    description: ml
      ? 'ഡോക്ടർമാരിൽ നിന്നുള്ള ഹ്രസ്വ ആരോഗ്യ വീഡിയോകൾ — ആരോഗ്യ നുറുങ്ങുകളും രോഗ വിശദീകരണങ്ങളും.'
      : 'Short educational health videos from doctors — tips and clear condition explanations.'
  };
}

function qs(base, params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

export default async function VideosGallery(props) {
  const sp = (await props.searchParams) || {};
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const page = Math.max(1, parseInt(sp.page, 10) || 1);
  const cur = { category: sp.category || '', specialty: sp.specialty || '' };

  const [videos, specialties] = await Promise.all([
    listVideos({ category: cur.category, specialtyId: cur.specialty, page, limit: LIMIT }),
    videoSpecialties()
  ]);
  const base = `/${locale}/videos`;
  const chip = (active) => `rounded-full px-3 py-1 text-xs font-medium ${active ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`;

  return (
    <div className="-my-6">
      <FullBleed className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] py-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-3xl font-extrabold">🎥 {ml ? 'ഡോക്ടർ വീഡിയോകൾ' : 'Doctor Videos'}</h1>
          <p className="mt-2 text-sm text-white/90">{ml ? 'വിശ്വസനീയമായ ഡോക്ടർമാരിൽ നിന്നുള്ള ഹ്രസ്വ ആരോഗ്യ വീഡിയോകൾ' : 'Short, trustworthy health videos from doctors'}</p>
        </div>
      </FullBleed>

      <FullBleed className="bg-white py-6">
        <div className="mx-auto max-w-5xl space-y-3 px-4">
          <nav className="flex flex-wrap gap-2" aria-label={ml ? 'വിഭാഗം' : 'Category'}>
            <Link href={qs(base, { ...cur, category: '', page: '' })} className={chip(!cur.category)}>{ml ? 'എല്ലാം' : 'All'}</Link>
            {VIDEO_CATEGORIES.map((c) => (
              <Link key={c} href={qs(base, { ...cur, category: c, page: '' })} className={chip(cur.category === c)}>
                {ml ? CAT_LABEL[c][0] : CAT_LABEL[c][1]}
              </Link>
            ))}
          </nav>
          {specialties.length > 0 && (
            <nav className="flex flex-wrap gap-2" aria-label={ml ? 'സ്പെഷ്യാലിറ്റി' : 'Specialty'}>
              <Link href={qs(base, { ...cur, specialty: '', page: '' })} className={chip(!cur.specialty)}>{ml ? 'എല്ലാ സ്പെഷ്യാലിറ്റികളും' : 'All specialties'}</Link>
              {specialties.map((s) => (
                <Link key={s.id} href={qs(base, { ...cur, specialty: s.id, page: '' })} className={chip(cur.specialty === s.id)}>
                  {(ml ? s.name_ml : s.name_en) || s.name_en}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </FullBleed>

      <FullBleed className="bg-gray-50 py-8">
        <div className="mx-auto max-w-5xl px-4">
          {videos.length === 0 ? (
            <EmptyState title={ml ? 'വീഡിയോകളൊന്നും കണ്ടെത്തിയില്ല' : 'No videos found'} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => <VideoCard key={v.id} video={v} locale={locale} />)}
            </div>
          )}
          <div className="mt-6">
            <Pagination basePath={base} query={cur} page={page} hasNext={videos.length === LIMIT} locale={locale} />
          </div>
        </div>
      </FullBleed>
    </div>
  );
}
