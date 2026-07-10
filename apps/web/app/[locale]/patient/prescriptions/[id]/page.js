// Prescription detail — medications, file preview (image/PDF), edit metadata.
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { resolveLocale } from '@/lib/i18n';
import { currentPatientId } from '@/lib/appointments';
import { getPrescription } from '@/lib/prescriptions';
import EditPrescription from '@/components/prescriptions/EditPrescription';

export const dynamic = 'force-dynamic';
const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'പ്രിസ്ക്രിപ്ഷൻ | MalayaliDoctor' : 'Prescription | MalayaliDoctor' };
}

export default async function PrescriptionDetail(props) {
  const { locale: raw, id } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const uid = await currentPatientId();
  if (!uid) redirect(`/${locale}/login`);
  const p = await getPrescription(uid, id);
  if (!p) notFound();

  const meds = Array.isArray(p.medications) ? p.medications : [];
  const fileUrl = p.has_file ? `/api/patient/prescriptions/${p.id}/file` : null;
  const isImage = p.file_type === 'jpg' || p.file_type === 'png';

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 space-y-5">
      <nav className="text-xs text-gray-500">
        <Link href={`/${locale}/patient/prescriptions`} className="hover:text-brand">{ml ? 'പ്രിസ്ക്രിപ്ഷനുകൾ' : 'Prescriptions'}</Link> › <span className="text-gray-700">{p.doctor_name || (ml ? 'വിശദാംശം' : 'Detail')}</span>
      </nav>

      <header className="rounded-xl border border-gray-200 bg-white p-5">
        <h1 className="text-xl font-bold text-gray-900">{p.doctor_name || (ml ? 'പ്രിസ്ക്രിപ്ഷൻ' : 'Prescription')}</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          {p.hospital_name && <span>{p.hospital_name}</span>}
          {p.prescribed_date && <span>📅 {fmtDate(p.prescribed_date)}</span>}
          {p.valid_until && <span>{ml ? 'കാലാവധി' : 'Valid until'}: {fmtDate(p.valid_until)}</span>}
        </div>
      </header>

      {/* Medications */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'മരുന്നുകൾ' : 'Medications'}</h2>
        {meds.length === 0 ? <p className="text-sm text-gray-500">{ml ? 'ലിസ്റ്റ് ചെയ്തിട്ടില്ല' : 'None listed'}</p> : (
          <ul className="divide-y divide-gray-100">
            {meds.map((m, i) => (
              <li key={i} className="py-2">
                <p className="font-medium text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-500">{[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}</p>
                {m.notes && <p className="text-xs text-gray-400">{m.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* File preview */}
      {fileUrl && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-gray-900">{ml ? 'ഫയൽ' : 'Attached file'}</h2>
          {isImage
            ? <img src={fileUrl} alt="prescription" className="max-h-[70vh] w-full rounded-lg object-contain" />
            : <iframe src={fileUrl} title="prescription" className="h-[70vh] w-full rounded-lg border border-gray-200" />}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-brand">{ml ? 'പുതിയ ടാബിൽ തുറക്കുക →' : 'Open in new tab →'}</a>
        </section>
      )}

      {p.notes && <section className="rounded-xl border border-gray-200 bg-white p-5"><h2 className="mb-2 text-sm font-semibold text-gray-700">{ml ? 'കുറിപ്പുകൾ' : 'Notes'}</h2><p className="text-sm text-gray-700 whitespace-pre-line">{p.notes}</p></section>}

      <EditPrescription prescription={p} locale={locale} />

      <div role="note" aria-label="medical-disclaimer" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {ml ? 'ഡോക്ടറുടെ നിർദേശപ്രകാരം മാത്രം മരുന്നുകൾ കഴിക്കുക — സ്വയം മരുന്ന് കഴിക്കുകയോ ക്രമീകരിക്കുകയോ ചെയ്യരുത്.' : 'Take medicines only as directed by your doctor — do not self-medicate or adjust doses.'}
      </div>
    </main>
  );
}
