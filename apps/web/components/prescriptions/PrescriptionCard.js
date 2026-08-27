// PrescriptionCard.js — list item: doctor, date, medication count, thumbnail.
import Link from 'next/link';
import { OptimizedImage } from '@/lib/images';

const fmtDate = (d) => (d ? String(d).slice(0, 10) : '');

export default function PrescriptionCard({ prescription: p, locale = 'ml' }) {
  const ml = locale === 'ml';
  const meds = Array.isArray(p.medications) ? p.medications : [];
  const isImage = p.file_type === 'jpg' || p.file_type === 'png';
  return (
    <Link href={`/${locale}/patient/prescriptions/${p.id}`} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
        {p.has_file && isImage
          ? <OptimizedImage src={`/api/patient/prescriptions/${p.id}/file`} alt="Prescription" width={56} height={56} className="h-full w-full" />
          : <span className="text-2xl">{p.file_type === 'pdf' ? '📄' : '💊'}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 truncate font-semibold text-gray-900">
          <span className="truncate">{p.doctor_name || (ml ? 'പ്രിസ്ക്രിപ്ഷൻ' : 'Prescription')}</span>
          {p.is_digital ? <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">{ml ? 'ഡിജിറ്റൽ' : 'Digital'}</span> : null}
        </h3>
        <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-500">
          {p.prescribed_date && <span>📅 {fmtDate(p.prescribed_date)}</span>}
          {p.hospital_name && <span className="truncate">{p.hospital_name}</span>}
          <span>💊 {meds.length} {ml ? 'മരുന്നുകൾ' : 'meds'}</span>
        </div>
      </div>
    </Link>
  );
}
