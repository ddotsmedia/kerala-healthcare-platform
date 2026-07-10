// Booking page — pick a date, see available slots, confirm a booking.

import { notFound } from 'next/navigation';
import { resolveLocale, t } from '@/lib/i18n';
import { getDoctorBySlug } from '@/lib/providers';
import { getAvailableSlots } from '@khp/appointments';
import { fmtTime, today } from '@/lib/format';
import { EmptyState } from '@khp/ui';
import { currentPatientId } from '@/lib/appointments';
import { listFamily } from '@/lib/family';
import { bookAction } from './actions';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const d = await getDoctorBySlug(params.doctorSlug);
  return { title: `${t(locale, 'book_appointment')}${d ? ' — ' + d.display_name : ''}` };
}

export default async function BookPage(props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const locale = resolveLocale(params.locale);
  const doctor = await getDoctorBySlug(params.doctorSlug);
  if (!doctor) notFound();

  const ml = locale === 'ml';
  const date = (searchParams && searchParams.date) || today();
  const forId = (searchParams && searchParams.for) || '';
  const error = searchParams && searchParams.error;
  const uid = await currentPatientId();
  const [slots, family] = await Promise.all([getAvailableSlots(doctor.id, date), uid ? listFamily(uid) : Promise.resolve([])]);
  const forName = forId ? (() => { const m = family.find((x) => x.id === forId); return m ? (ml ? (m.name_ml || m.name_en) : m.name_en) : null; })() : null;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t(locale, 'book_appointment')}</h1>
      <p className="text-brand">{doctor.display_name}</p>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form method="get" className="flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <span className="text-gray-700">Date</span>
          <input type="date" name="date" defaultValue={date} className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </label>
        {family.length > 0 && (
          <label className="text-sm">
            <span className="text-gray-700">{ml ? 'ആർക്കുവേണ്ടി' : 'Booking for'}</span>
            <select name="for" defaultValue={forId} className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">{ml ? 'ഞാൻ' : 'Self'}</option>
              {family.map((m) => <option key={m.id} value={m.id}>{ml ? (m.name_ml || m.name_en) : m.name_en}</option>)}
            </select>
          </label>
        )}
        <button type="submit" className="rounded-lg border border-gray-300 px-4 py-2 text-sm">{t(locale, 'select_slot')}</button>
      </form>

      {forName && <p className="text-sm text-gray-600">{ml ? 'ബുക്കിംഗ്' : 'Booking for'}: <b>{forName}</b></p>}

      {slots.length === 0 ? <EmptyState message={t(locale, 'no_slots')} /> : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((s) => (
            <form key={`${s.start}-${s.mode}`} action={bookAction}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="doctorSlug" value={doctor.slug} />
              <input type="hidden" name="providerId" value={doctor.id} />
              <input type="hidden" name="slotDate" value={date} />
              <input type="hidden" name="slotStart" value={s.start} />
              <input type="hidden" name="mode" value={s.mode} />
              {forId && <input type="hidden" name="familyMemberId" value={forId} />}
              <button type="submit" className="w-full rounded-lg border border-brand px-3 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white">
                {fmtTime(s.start)} · {s.mode}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
