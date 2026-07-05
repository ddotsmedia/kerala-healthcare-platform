// JobCard.js — job listing card (server). Badges, salary, deadline, counts.

import Link from 'next/link';
import SaveJobButton from './SaveJobButton';

const TYPE_LABEL = {
  full_time: { ml: 'ഫുൾ-ടൈം', en: 'Full-time' }, part_time: { ml: 'പാർട്ട്-ടൈം', en: 'Part-time' },
  contract: { ml: 'കരാർ', en: 'Contract' }, locum: { ml: 'ലോക്കം', en: 'Locum' }, internship: { ml: 'ഇന്റേൺഷിപ്പ്', en: 'Internship' }
};
const PERIOD = { monthly: '/mo', annual: '/yr', daily: '/day', hourly: '/hr' };

function salary(j) {
  if (j.salary_min == null && j.salary_max == null) return null;
  const p = PERIOD[j.salary_period] || '';
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  if (j.salary_min != null && j.salary_max != null) return `${fmt(j.salary_min)}–${fmt(j.salary_max)}${p}`;
  return `${fmt(j.salary_min ?? j.salary_max)}${p}`;
}

function deadline(j, ml) {
  if (!j.application_deadline) return null;
  const end = new Date(j.application_deadline).getTime();
  const days = Math.ceil((end - Date.now()) / 86400000);
  if (days < 0) return { text: ml ? 'അവസാനിച്ചു' : 'Closed', tone: 'text-gray-400' };
  if (days === 0) return { text: ml ? 'ഇന്ന് അവസാനിക്കുന്നു' : 'Closes today', tone: 'text-red-600' };
  return { text: ml ? `${days} ദിവസം ബാക്കി` : `${days} days left`, tone: days <= 3 ? 'text-red-600' : 'text-gray-500' };
}

export default function JobCard({ job, locale = 'ml', loginPath }) {
  const ml = locale === 'ml';
  const district = ml ? job.district_ml : job.district_en;
  const type = TYPE_LABEL[job.job_type] || TYPE_LABEL[job.employment_type];
  const sal = salary(job);
  const dl = deadline(job, ml);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/${locale}/jobs/${job.slug}`} className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {job.is_urgent && <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">{ml ? 'അടിയന്തരം' : 'URGENT'}</span>}
            <h3 className="truncate font-semibold text-gray-900">{job.title}</h3>
          </div>
          <p className="text-sm text-brand">{job.org_name}</p>
        </Link>
        <SaveJobButton jobId={job.id} locale={locale} loginPath={loginPath} />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {type && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-brand">{type[locale] || type.en}</span>}
        {job.is_remote && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{ml ? 'റിമോട്ട്' : 'Remote'}</span>}
        {sal && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">{sal}</span>}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
        {district && <span>📍 {district}</span>}
        <span>{job.experience_years_min}{job.experience_years_max ? `–${job.experience_years_max}` : '+'} {ml ? 'വർഷം' : 'yrs'}</span>
        {job.views_count > 0 && <span>👁 {job.views_count}</span>}
        {job.applications_count > 0 && <span>📨 {job.applications_count}</span>}
        {dl && <span className={`font-medium ${dl.tone}`}>⏳ {dl.text}</span>}
      </div>
    </div>
  );
}
