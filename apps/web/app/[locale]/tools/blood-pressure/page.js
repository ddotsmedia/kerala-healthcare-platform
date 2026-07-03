// Blood Pressure reference chart — static (no calculation). Server component.

import { resolveLocale } from '@/lib/i18n';

export async function generateMetadata(props) {
  const { locale } = await props.params;
  const ml = resolveLocale(locale) === 'ml';
  return { title: ml ? 'രക്തസമ്മർദ്ദ ഗൈഡ് · MalayaliDoctor' : 'Blood Pressure Guide · MalayaliDoctor' };
}

export default async function BloodPressure(props) {
  const { locale: raw } = await props.params;
  const locale = resolveLocale(raw);
  const ml = locale === 'ml';
  const rows = [
    { ml: 'സാധാരണം', en: 'Normal', sys: '< 120', dia: '< 80', tone: 'bg-green-50 text-green-700' },
    { ml: 'ഉയർന്നത്', en: 'Elevated', sys: '120–129', dia: '< 80', tone: 'bg-yellow-50 text-yellow-700' },
    { ml: 'സ്റ്റേജ് 1', en: 'Stage 1', sys: '130–139', dia: '80–89', tone: 'bg-orange-50 text-orange-700' },
    { ml: 'സ്റ്റേജ് 2', en: 'Stage 2', sys: '≥ 140', dia: '≥ 90', tone: 'bg-red-50 text-red-700' },
    { ml: 'ക്രൈസിസ്', en: 'Crisis', sys: '> 180', dia: '> 120', tone: 'bg-red-100 text-red-800 font-bold' }
  ];
  return (
    <div className="mx-auto max-w-lg space-y-4 py-4">
      <h1 className="text-xl font-bold">{ml ? 'രക്തസമ്മർദ്ദ ഗൈഡ്' : 'Blood Pressure Guide'}</h1>
      <p className="text-sm text-gray-600">{ml ? 'റഫറൻസ് ചാർട്ട് (mmHg)' : 'Reference chart (mmHg)'}</p>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr><th className="px-3 py-2">{ml ? 'വിഭാഗം' : 'Category'}</th><th className="px-3 py-2">{ml ? 'സിസ്റ്റോളിക്' : 'Systolic'}</th><th className="px-3 py-2">{ml ? 'ഡയസ്റ്റോളിക്' : 'Diastolic'}</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => (
              <tr key={i}><td className={`px-3 py-2 ${r.tone}`}>{ml ? r.ml : r.en}</td><td className="px-3 py-2">{r.sys}</td><td className="px-3 py-2">{r.dia}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div role="note" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800">
        {ml ? 'റീഡിംഗ് > 180/120 ആണെങ്കിൽ ഉടൻ 108 വിളിക്കുക.' : 'If your reading is > 180/120, call 108 immediately.'}
      </div>
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{ml ? 'ഇത് പൊതുവിവരം മാത്രം. രോഗനിർണയത്തിന് ഡോക്ടറെ സമീപിക്കുക.' : 'General information only. Consult a doctor for diagnosis.'}</p>
    </div>
  );
}
