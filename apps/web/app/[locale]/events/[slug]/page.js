// Event detail — full info, register CTA, add-to-calendar (ICS), Event JSON-LD.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { getEvent } from '@/lib/events';
import { fmtDate, fmtTime } from '@/lib/format';
import { JsonLd, Breadcrumb, SITE } from '@/components/landing/LandingParts';

export const dynamic = 'force-dynamic';

const TYPE_LABEL = {
  screening_camp: ['സ്ക്രീനിംഗ് ക്യാമ്പ്', 'Screening Camp'], blood_donation: ['രക്തദാന ക്യാമ്പ്', 'Blood Donation'],
  vaccination: ['വാക്സിനേഷൻ ക്യാമ്പ്', 'Vaccination Camp'], awareness: ['അവബോധ പരിപാടി', 'Awareness Event'],
  cme: ['CME', 'CME'], wellness: ['വെൽനെസ്', 'Wellness']
};
const pick = (ml, a, b) => (ml ? a : b) || b;

export async function generateMetadata(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const e = await getEvent(slug);
  if (!e) return { title: 'Event · MalayaliDoctor' };
  const ml = locale === 'ml';
  const title = pick(ml, e.title_ml, e.title_en);
  return {
    title: `${title} · MalayaliDoctor`.slice(0, 60),
    description: (pick(ml, e.description_ml, e.description_en) || title).slice(0, 160),
    alternates: { canonical: `/${locale}/events/${slug}` }
  };
}

export default async function EventDetail(props) {
  const { locale: raw, slug } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const e = await getEvent(slug);
  if (!e) notFound();

  const title = pick(ml, e.title_ml, e.title_en);
  const venue = pick(ml, e.venue_ml, e.venue_en);
  const district = pick(ml, e.district_ml, e.district_en);
  const desc = pick(ml, e.description_ml, e.description_en);
  const typeLabel = TYPE_LABEL[e.type] ? (ml ? TYPE_LABEL[e.type][0] : TYPE_LABEL[e.type][1]) : e.type;
  const url = `${SITE}/${locale}/events/${slug}`;
  const fullVenue = [venue, district].filter(Boolean).join(', ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title_en || title,
    startDate: `${String(e.event_date).slice(0, 10)}${e.start_time ? 'T' + String(e.start_time).slice(0, 5) : ''}`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: e.venue_en || venue || 'Kerala', address: fullVenue || 'Kerala, India' },
    ...(e.organiser ? { organizer: { '@type': 'Organization', name: e.organiser } } : {}),
    ...(e.is_free ? { isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR', availability: 'https://schema.org/InStock', url } } : {}),
    description: desc || title,
    url
  };

  const Item = ({ icon, label, children }) => (
    <div className="flex gap-2 text-sm">
      <span aria-hidden="true">{icon}</span>
      <div><span className="text-gray-500">{label}: </span><span className="font-medium text-gray-900">{children}</span></div>
    </div>
  );

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <JsonLd data={jsonLd} />
      <Breadcrumb items={[
        { name: ml ? 'ഹോം' : 'Home', href: `/${locale}` },
        { name: ml ? 'പരിപാടികൾ' : 'Events', href: `/${locale}/events` },
        { name: title }
      ]} />

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">{typeLabel}</span>
          {e.is_free && <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white">{ml ? 'സൗജന്യം' : 'FREE'}</span>}
          {e.status && e.status !== 'upcoming' && <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs text-gray-700">{e.status}</span>}
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
      </header>

      <section className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4">
        <Item icon="📅" label={ml ? 'തീയതി' : 'Date'}>
          {fmtDate(e.event_date)}{e.start_time ? ` · ${fmtTime(e.start_time)}${e.end_time ? ` – ${fmtTime(e.end_time)}` : ''}` : ''}
        </Item>
        {fullVenue && <Item icon="📍" label={ml ? 'സ്ഥലം' : 'Venue'}>{fullVenue}</Item>}
        {e.organiser && <Item icon="🏥" label={ml ? 'സംഘാടകർ' : 'Organiser'}>{e.organiser}</Item>}
        {e.contact_phone && <Item icon="📞" label={ml ? 'ബന്ധപ്പെടുക' : 'Contact'}><a href={`tel:${e.contact_phone}`} className="text-brand hover:underline">{e.contact_phone}</a></Item>}
        {e.max_participants ? <Item icon="👥" label={ml ? 'സീറ്റുകൾ' : 'Capacity'}>{e.current_registrations || 0} / {e.max_participants}</Item> : null}
      </section>

      {desc && <section className="prose prose-sm max-w-none text-gray-700"><p>{desc}</p></section>}

      <section className="flex flex-col gap-2 sm:flex-row">
        {e.registration_required && e.registration_url ? (
          <a href={e.registration_url} target="_blank" rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-brand px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark">
            {ml ? 'രജിസ്റ്റർ ചെയ്യുക →' : 'Register →'}
          </a>
        ) : e.registration_required ? (
          <a href={e.contact_phone ? `tel:${e.contact_phone}` : '#'}
            className="flex-1 rounded-lg bg-brand px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark">
            {ml ? 'രജിസ്റ്റർ ചെയ്യാൻ വിളിക്കുക' : 'Call to register'}
          </a>
        ) : null}
        <a href={`/${locale}/events/${slug}/ics`}
          className="flex-1 rounded-lg border border-brand px-5 py-2.5 text-center text-sm font-semibold text-brand hover:bg-teal-50">
          🗓️ {ml ? 'കലണ്ടറിൽ ചേർക്കുക' : 'Add to calendar'}
        </a>
      </section>

      <div role="note" aria-label="events-note"
        className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml
          ? 'പരിപാടിയുടെ വിശദാംശങ്ങൾ സംഘാടകർ നൽകുന്നതാണ് — പങ്കെടുക്കും മുമ്പ് സ്ഥിരീകരിക്കുക. ഇത് വൈദ്യോപദേശമല്ല. അടിയന്തര സാഹചര്യങ്ങളിൽ 112 അല്ലെങ്കിൽ ആംബുലൻസിന് 108 വിളിക്കുക.'
          : 'Event details are provided by the organisers — please confirm before attending. This is not medical advice. In an emergency call 112, or 108 for an ambulance.'}
      </div>
    </main>
  );
}
