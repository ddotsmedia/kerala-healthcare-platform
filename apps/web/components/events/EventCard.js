// EventCard.js — one health event in the list. Prominent date, type badge, free badge.

import Link from 'next/link';
import { fmtDate, fmtTime } from '@/lib/format';

const TYPE_META = {
  screening_camp: { icon: '🩺', ml: 'സ്ക്രീനിംഗ് ക്യാമ്പ്', en: 'Screening Camp', cls: 'bg-teal-100 text-teal-800' },
  blood_donation: { icon: '🩸', ml: 'രക്തദാനം', en: 'Blood Donation', cls: 'bg-red-100 text-red-800' },
  vaccination: { icon: '💉', ml: 'വാക്സിനേഷൻ', en: 'Vaccination', cls: 'bg-blue-100 text-blue-800' },
  awareness: { icon: '📢', ml: 'അവബോധം', en: 'Awareness', cls: 'bg-amber-100 text-amber-800' },
  cme: { icon: '🎓', ml: 'CME', en: 'CME', cls: 'bg-purple-100 text-purple-800' },
  wellness: { icon: '🌿', ml: 'വെൽനെസ്', en: 'Wellness', cls: 'bg-green-100 text-green-800' }
};

function DateBlock({ date }) {
  const d = new Date(`${String(date).slice(0, 10)}T00:00:00`);
  const day = d.getDate();
  const mon = d.toLocaleString('en', { month: 'short' });
  return (
    <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-brand py-1.5 text-white">
      <span className="text-lg font-extrabold leading-none">{day}</span>
      <span className="text-[10px] font-semibold uppercase">{mon}</span>
    </div>
  );
}

export default function EventCard({ event, locale = 'ml' }) {
  const ml = locale === 'ml';
  const meta = TYPE_META[event.type] || { icon: '📅', ml: 'പരിപാടി', en: 'Event', cls: 'bg-gray-100 text-gray-700' };
  const title = (ml ? event.title_ml : event.title_en) || event.title_en;
  const venue = (ml ? event.venue_ml : event.venue_en) || event.venue_en;
  const district = (ml ? event.district_ml : event.district_en) || event.district_en;

  return (
    <Link href={`/${locale}/events/${event.slug}`}
      className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:border-brand">
      <DateBlock date={event.event_date} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.cls}`}>{meta.icon} {ml ? meta.ml : meta.en}</span>
          {event.is_free && <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">{ml ? 'സൗജന്യം' : 'FREE'}</span>}
          {event.registration_required && <span className="rounded-full border border-gray-300 px-2 py-0.5 text-[10px] text-gray-600">{ml ? 'രജിസ്ട്രേഷൻ' : 'Register'}</span>}
        </div>
        <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          📍 {venue}{district ? `, ${district}` : ''}
        </p>
        <p className="text-xs text-gray-400">
          {fmtDate(event.event_date)}{event.start_time ? ` · ${fmtTime(event.start_time)}` : ''}{event.organiser ? ` · ${event.organiser}` : ''}
        </p>
      </div>
    </Link>
  );
}
