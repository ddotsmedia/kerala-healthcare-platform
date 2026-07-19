// Community forum — categories + active discussions + rules.

import Link from 'next/link';
import { resolveLocale } from '@/lib/i18n';
import { listCategories, activeDiscussions } from '@/lib/forum';
import { HubHero, Disclaimer } from '@/components/hubs/HubParts';
import { TrustSection } from '@/components/trust/TrustParts';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return {
    title: ml ? 'കമ്മ്യൂണിറ്റി ഫോറം | MalayaliDoctor' : 'Community Forum | MalayaliDoctor',
    description: ml ? 'രോഗാവസ്ഥ അനുസരിച്ചുള്ള മോഡറേറ്റഡ് പിന്തുണാ ഗ്രൂപ്പുകൾ' : 'Moderated condition support groups — peer support with professional oversight.'
  };
}

export default async function CommunityPage(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const [categories, discussions] = await Promise.all([listCategories(), activeDiscussions(6)]);

  return (
    <div className="-my-6">
      <HubHero title={ml ? 'കമ്മ്യൂണിറ്റി ഫോറം' : 'Community Forum'}
        subtitle={ml ? 'രോഗാവസ്ഥ അനുസരിച്ചുള്ള മോഡറേറ്റഡ് പിന്തുണാ ഗ്രൂപ്പുകൾ' : 'Moderated support groups by condition'}
        gradient="from-[#0d9488] to-[#0f766e]" />

      <TrustSection title={ml ? 'വിഭാഗങ്ങൾ' : 'Categories'}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} href={`/${locale}/community/${c.slug}`}
              className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="text-3xl" aria-hidden="true">{c.icon}</span>
              <span className="mt-2 text-sm font-semibold text-gray-900">{ml ? (c.name_ml || c.name_en) : c.name_en}</span>
              <span className="text-xs text-gray-500">{c.post_count} {ml ? 'പോസ്റ്റുകൾ' : 'posts'}</span>
            </Link>
          ))}
        </div>
      </TrustSection>

      {discussions.length > 0 && (
        <TrustSection title={ml ? 'സജീവമായ ചർച്ചകൾ' : 'Active discussions'} tint="gray">
          <div className="mx-auto max-w-2xl space-y-2">
            {discussions.map((p) => (
              <Link key={p.id} href={`/${locale}/community/${p.category_slug}/${p.slug}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-gray-900">{p.title}</span>
                  <span className="text-xs text-gray-500">{ml ? (p.category_ml || p.category_en) : p.category_en} · {p.author_name || (ml ? 'അജ്ഞാതൻ' : 'Anonymous')}</span>
                </span>
                <span className="shrink-0 text-xs text-gray-400">💬 {p.reply_count}</span>
              </Link>
            ))}
          </div>
        </TrustSection>
      )}

      <TrustSection>
        <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <h2 className="mb-2 font-bold text-gray-900">{ml ? 'നിയമങ്ങൾ' : 'Rules'}</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>{ml ? 'വൈദ്യോപദേശമോ രോഗനിർണയമോ നൽകരുത്' : 'No medical advice, no diagnosis'}</li>
            <li>{ml ? 'എല്ലാവരോടും ബഹുമാനത്തോടെ പെരുമാറുക' : 'Be respectful'}</li>
            <li>{ml ? 'സ്പാം പാടില്ല' : 'No spam'}</li>
          </ul>
        </div>
        <div className="mx-auto mt-4 max-w-2xl">
          <Disclaimer>{ml ? 'ഇത് പിയർ പിന്തുണ മാത്രം. വൈദ്യോപദേശത്തിന് യോഗ്യതയുള്ള ഡോക്ടറെ സമീപിക്കുക.' : 'This is peer support only. Consult a qualified doctor for medical advice.'}</Disclaimer>
        </div>
      </TrustSection>
    </div>
  );
}
