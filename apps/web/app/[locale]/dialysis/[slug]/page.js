// Dialysis centre profile (SSR). Machine count, shift schedule, fees, types,
// govt scheme. MedicalClinic + BreadcrumbList + MedicalWebPage JSON-LD.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getDialysisBySlug, nearbyDialysis } from '@/lib/dialysis';
import { dialysisSchema, medicalWebPageSchema, SITE } from '@/lib/schema';
import { DialysisCard } from '@khp/ui';

export const dynamic = 'force-dynamic';
const nm = (o, ml) => (ml ? (o.name_ml || o.name_en) : (o.name_en || o.name_ml));

const TYPES = [
  ['has_hd', { ml: 'ഹീമോഡയാലിസിസ് (HD)', en: 'Hemodialysis (HD)' }],
  ['has_pd', { ml: 'പെരിറ്റോണിയൽ ഡയാലിസിസ് (PD)', en: 'Peritoneal dialysis (PD)' }],
  ['has_hdf', { ml: 'ഹീമോഡയാഫിൽട്രേഷൻ (HDF)', en: 'Hemodiafiltration (HDF)' }]
];

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const c = await getDialysisBySlug(params.slug);
  if (!c) return { title: locale === 'ml' ? 'ഡയാലിസിസ്' : 'Dialysis' };
  const name = c.name_en || c.name_ml;
  const district = c.district_en || 'Kerala';
  return {
    title: `${name} — ${district} | MalayaliDoctor`.slice(0, 65),
    description: `${name}, ${district} — dialysis machines, shift timings, fees${c.accepts_govt_scheme ? ', govt scheme' : ''}. On MalayaliDoctor.`.slice(0, 160),
    alternates: { canonical: `${SITE}/${locale}/dialysis/${c.slug}` }
  };
}

export default async function DialysisProfile(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const ml = locale === 'ml';
  const c = await getDialysisBySlug(params.slug);
  if (!c) notFound();

  const nearby = await nearbyDialysis(c.district_id, c.id, 3);
  const name = nm(c, ml);
  const district = ml ? c.district_ml : c.district_en;
  const address = (ml ? c.address_ml : c.address_en) || c.address_en || c.address_ml;
  const phones = Array.isArray(c.phone) ? c.phone : (c.phone ? [c.phone] : []);
  const url = `${SITE}/${locale}/dialysis/${c.slug}`;
  const mapsQ = (c.lat != null && c.lng != null) ? `${c.lat},${c.lng}` : encodeURIComponent(`${name} ${district || ''} Kerala`);
  const shifts = Array.isArray(c.shift_timings) ? c.shift_timings : [];
  const types = TYPES.filter(([k]) => c[k]);

  const ld = [
    dialysisSchema(c, locale),
    medicalWebPageSchema(name, address || name, url),
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: ml ? 'ഹോം' : 'Home', item: `${SITE}/${locale}` },
        { '@type': 'ListItem', position: 2, name: ml ? 'ഡയാലിസിസ്' : 'Dialysis', item: `${SITE}/${locale}/dialysis` },
        { '@type': 'ListItem', position: 3, name }
      ]
    }
  ];

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">{ml ? 'ഹോം' : 'Home'}</Link> ›{' '}
        <Link href={`/${locale}/dialysis`} className="hover:text-brand">{ml ? 'ഡയാലിസിസ്' : 'Dialysis'}</Link> › <span className="text-gray-700">{name}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {c.accepts_govt_scheme && <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{ml ? 'സർക്കാർ പദ്ധതി (PMJAY)' : 'Govt scheme (PMJAY)'}</span>}
        </div>
        {c.hospital_slug && <p className="mt-1 text-sm text-gray-600">{ml ? 'ആശുപത്രി' : 'Part of'}: <Link href={`/${locale}/hospitals/${c.hospital_slug}`} className="text-brand">{ml ? (c.hospital_name_ml || c.hospital_name_en) : c.hospital_name_en}</Link></p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {district && <span>📍 {address ? `${address}, ` : ''}{district}</span>}
          {c.machine_count != null && <span>🩺 {c.machine_count} {ml ? 'മെഷീനുകൾ' : 'machines'}</span>}
          {c.sessions_per_week != null && <span>{c.sessions_per_week} {ml ? 'സ്ലോട്ട്/ആഴ്ച' : 'slots/week'}</span>}
          {c.fee_per_session_inr != null && <span>₹{c.fee_per_session_inr}{ml ? '/സെഷൻ' : '/session'}</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {phones[0] && <a href={`tel:${phones[0]}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">📞 {ml ? 'വിളിക്കുക' : 'Call'} {phones[0]}</a>}
          <a href={`https://maps.google.com/?q=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-teal-50">🗺️ {ml ? 'വഴി' : 'Directions'}</a>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Dialysis types */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഡയാലിസിസ് തരങ്ങൾ' : 'Dialysis types'}</h2>
          {types.length ? <ul className="space-y-2 text-sm text-gray-700">{types.map(([k, l]) => <li key={k}>✅ {ml ? l.ml : l.en}</li>)}</ul>
            : <p className="text-sm text-gray-500">{ml ? 'വിവരം ലഭ്യമല്ല' : 'Not specified'}</p>}
        </section>

        {/* Shift schedule */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഷിഫ്റ്റ് ഷെഡ്യൂൾ' : 'Shift schedule'}</h2>
          {shifts.length ? (
            <table className="w-full text-left text-sm">
              <tbody>
                {shifts.map((s, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 font-medium capitalize text-gray-800">{s.shift}</td>
                    <td className="py-2 text-right text-gray-600">{s.time || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-gray-500">{ml ? 'വിളിച്ച് ചോദിക്കുക' : 'Call for timings'}</p>}
        </section>
      </div>

      {nearby.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'സമീപത്തെ ഡയാലിസിസ് കേന്ദ്രങ്ങൾ' : 'Nearby dialysis centres'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">{nearby.map((n) => <DialysisCard key={n.id} centre={n} locale={locale} />)}</div>
        </section>
      )}

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'സ്ലോട്ട് ലഭ്യതയും സമയവും മാറാവുന്നതാണ് — പോകുന്നതിന് മുമ്പ് കേന്ദ്രത്തിൽ വിളിച്ച് സ്ഥിരീകരിക്കുക. ഈ വിവരങ്ങൾ പൊതു അറിവിനു മാത്രം. അടിയന്തരഘട്ടത്തിൽ 112 / ആംബുലൻസ് 108.' : 'Slot availability and timings change — call the centre to confirm before travelling. This information is for general awareness only. In an emergency call 112 / Ambulance 108.'}
      </div>
    </article>
  );
}
