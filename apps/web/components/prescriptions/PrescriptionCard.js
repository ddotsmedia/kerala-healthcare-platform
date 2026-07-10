// PrescriptionCard.js — list item: doctor, date, medication count, thumbnail.
import Link from 'next/link';

const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

export default function PrescriptionCard({ prescription: p, locale = 'ml' }) {
  const ml = locale === 'ml';
  const meds = Array.isArray(p.medications) ? p.medications : [];
  const isImage = p.file_type === 'jpg' || p.file_type === 'png';
  return (
    <Link href={`/${locale}/patient/prescriptions/${p.id}`} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
        {p.has_file && isImage
          ? <img src={`/api/patient/prescriptions/${p.id}/file`} alt="" loading="lazy" className="h-full w-full object-cover" />
          : <span className="text-2xl">{p.file_type === 'pdf' ? '📄' : '💊'}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-gray-900">{p.doctor_name || (ml ? 'പ്രിസ്ക്രിപ്ഷൻ' : 'Prescription')}</h3>
        <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-500">
          {p.prescribed_date && <span>📅 {fmtDate(p.prescribed_date)}</span>}
          {p.hospital_name && <span className="truncate">{p.hospital_name}</span>}
          <span>💊 {meds.length} {ml ? 'മരുന്നുകൾ' : 'meds'}</span>
        </div>
      </div>
    </Link>
  );
}
