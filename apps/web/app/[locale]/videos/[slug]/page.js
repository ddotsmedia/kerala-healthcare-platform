// Video detail — privacy-enhanced YouTube embed (youtube-nocookie), doctor link,
// related videos, medical disclaimer.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getVideoBySlug, relatedVideos } from '@/lib/videos';
import { SITE } from '@/components/landing/LandingParts';
import VideoCard from '@/components/videos/VideoCard';

export const dynamic = 'force-dynamic';

const pick = (ml, a, b) => (ml ? a : b) || b;
// YouTube IDs are 11 chars of [A-Za-z0-9_-]; guard the embed against bad data.
const safeId = (id) => (/^[A-Za-z0-9_-]{11}$/.test(String(id || '')) ? id : null);

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const v = await getVideoBySlug(slug);
  if (!v) return { title: 'Video · MalayaliDoctor' };
  const ml = locale === 'ml';
  const title = pick(ml, v.title_ml, v.title_en);
  const id = safeId(v.youtube_video_id);
  return {
    title: `${title} · MalayaliDoctor`.slice(0, 60),
    description: (pick(ml, v.description_ml, v.description_en) || title).slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/videos/${slug}` },
    openGraph: id ? { images: [{ url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }] } : undefined
  };
}

export default async function VideoDetail(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const v = await getVideoBySlug(slug);
  if (!v) notFound();
  const related = await relatedVideos(v, 4);

  const title = pick(ml, v.title_ml, v.title_en);
  const desc = pick(ml, v.description_ml, v.description_en);
  const specialty = pick(ml, v.specialty_ml, v.specialty_en);
  const id = safeId(v.youtube_video_id);

  const ld = {
    '@context': 'https://schema.org', '@type': 'VideoObject',
    name: v.title_en || title, description: desc || title,
    thumbnailUrl: id ? [`https://i.ytimg.com/vi/${id}/hqdefault.jpg`] : undefined,
    uploadDate: v.published_at ? new Date(v.published_at).toISOString() : undefined,
    embedUrl: id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined
  };

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/videos`} className="hover:text-brand">{ml ? 'വീഡിയോകൾ' : 'Videos'}</Link> › <span className="text-gray-700">{title}</span>
      </nav>

      <div className="overflow-hidden rounded-2xl bg-black">
        {id ? (
          <div className="relative aspect-video">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
              title={title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-white/70">
            {ml ? 'വീഡിയോ ലഭ്യമല്ല' : 'Video unavailable'}
          </div>
        )}
      </div>

      <header className="space-y-1">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500">
          {v.doctor_name && v.doctor_slug ? (
            <>
              <Link href={`/${locale}/doctors/${v.doctor_slug}`} className="font-medium text-brand hover:underline">{v.doctor_name}</Link>
              {specialty ? ` · ${specialty}` : ''} ·{' '}
            </>
          ) : (v.doctor_name ? `${v.doctor_name} · ` : '')}
          {v.view_count || 0} {ml ? 'കാഴ്ചകൾ' : 'views'}
        </p>
      </header>

      {desc && <p className="text-sm leading-relaxed text-gray-700">{desc}</p>}

      {v.doctor_name && v.doctor_slug && (
        <Link href={`/${locale}/doctors/${v.doctor_slug}`}
          className="inline-block rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">
          👨‍⚕️ {ml ? 'ഡോക്ടറുടെ പ്രൊഫൈൽ കാണൂ' : 'View doctor profile'}
        </Link>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'അനുബന്ധ വീഡിയോകൾ' : 'Related videos'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {related.map((r) => <VideoCard key={r.id} video={r} locale={locale} />)}
          </div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml
          ? 'ഈ വീഡിയോ പൊതു ആരോഗ്യ വിവരങ്ങൾക്ക് മാത്രമുള്ളതാണ് — രോഗനിർണയമോ ചികിത്സാ നിർദ്ദേശമോ അല്ല. നിങ്ങളുടെ ആരോഗ്യപ്രശ്നങ്ങൾക്ക് യോഗ്യതയുള്ള ഡോക്ടറെ സമീപിക്കുക. അടിയന്തരം: 112 · ആംബുലൻസ്: 108.'
          : 'This video is general health information only — not a diagnosis or treatment advice. Consult a qualified doctor for your health concerns. Emergency: 112 · Ambulance: 108.'}
      </div>
    </main>
  );
}
