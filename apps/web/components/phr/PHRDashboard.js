'use client';

// Personal Health Records dashboard. All data is the signed-in patient's own.
import { useState } from 'react';

const SEV = {
  mild: 'bg-yellow-100 text-yellow-700', moderate: 'bg-orange-100 text-orange-700',
  severe: 'bg-red-100 text-red-700', 'life-threatening': 'bg-red-200 text-red-800 font-bold'
};
const REC_TYPES = [
  ['prescription', 'കുറിപ്പടികൾ', 'Prescriptions'], ['lab_report', 'ലാബ് റിപ്പോർട്ട്', 'Lab Reports'],
  ['imaging', 'ഇമേജിംഗ്', 'Imaging'], ['vaccination', 'വാക്സിനേഷൻ', 'Vaccinations'], ['note', 'കുറിപ്പുകൾ', 'Notes']
];
const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-base';

export default function PHRDashboard({ locale = 'ml', summary, initialAllergies = [], initialMeds = [], initialRecords = [] }) {
  const ml = locale === 'ml';
  const [allergies, setAllergies] = useState(initialAllergies);
  const [meds, setMeds] = useState(initialMeds);
  const [records, setRecords] = useState(initialRecords);
  const [tab, setTab] = useState('prescription');

  const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
  const del = (url) => fetch(url, { method: 'DELETE' });

  async function addAllergy(e) {
    e.preventDefault(); const f = e.target;
    const j = await post('/api/phr/allergies', { allergen: f.allergen.value, reaction: f.reaction.value, severity: f.severity.value });
    if (j.data?.id) { setAllergies((a) => [{ id: j.data.id, allergen: f.allergen.value, reaction: f.reaction.value, severity: f.severity.value }, ...a]); f.reset(); }
  }
  async function rmAllergy(id) { await del(`/api/phr/allergies/${id}`); setAllergies((a) => a.filter((x) => x.id !== id)); }

  async function addMed(e) {
    e.preventDefault(); const f = e.target;
    const body = { medication_name: f.medication_name.value, dosage: f.dosage.value, frequency: f.frequency.value, is_ongoing: true };
    const j = await post('/api/phr/medications', body);
    if (j.data?.id) { setMeds((m) => [{ id: j.data.id, ...body }, ...m]); f.reset(); }
  }
  async function rmMed(id) { await del(`/api/phr/medications/${id}`); setMeds((m) => m.filter((x) => x.id !== id)); }

  async function addRecord(e) {
    e.preventDefault(); const f = e.target;
    const body = { record_type: tab, title: f.title.value, doctor_name: f.doctor_name.value, hospital_name: f.hospital_name.value, record_date: f.record_date.value || null };
    const j = await post('/api/phr/records', body);
    if (j.data?.id) { setRecords((r) => [{ id: j.data.id, ...body }, ...r]); f.reset(); }
  }
  async function rmRecord(id) { await del(`/api/phr/records/${id}`); setRecords((r) => r.filter((x) => x.id !== id)); }

  const recByType = records.filter((r) => r.record_type === tab);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-gray-900">{ml ? 'എന്റെ ആരോഗ്യ രേഖകൾ' : 'My Health Records'}</h1>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          {[[allergies.length, ml ? 'അലർജികൾ' : 'Allergies'], [meds.length, ml ? 'സജീവ മരുന്നുകൾ' : 'Active meds'], [records.length, ml ? 'ആകെ രേഖകൾ' : 'Total records']].map((s, i) => (
            <div key={i} className="rounded-xl bg-teal-50 p-3"><div className="text-2xl font-extrabold text-brand">{s[0]}</div><div className="text-xs text-gray-600">{s[1]}</div></div>
          ))}
        </div>
      </header>

      {/* Allergies — safety critical */}
      <section className="rounded-2xl border-2 border-red-200 bg-white p-4">
        <h2 className="mb-2 text-base font-bold text-red-700">⚠️ {ml ? 'അലർജികൾ' : 'Allergies'}</h2>
        <ul className="mb-3 space-y-2">
          {allergies.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm">
              <span><b>{a.allergen}</b>{a.reaction ? ` — ${a.reaction}` : ''} {a.severity && <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${SEV[a.severity] || ''}`}>{a.severity}</span>}</span>
              <button onClick={() => rmAllergy(a.id)} aria-label="Delete" className="text-xs text-gray-400 hover:text-red-600">✕</button>
            </li>
          ))}
          {allergies.length === 0 && <li className="text-sm text-gray-500">{ml ? 'അലർജികൾ ഇല്ല' : 'No allergies recorded'}</li>}
        </ul>
        <form onSubmit={addAllergy} className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input name="allergen" required placeholder={ml ? 'അലർജൻ' : 'Allergen'} className={inp} />
          <input name="reaction" placeholder={ml ? 'പ്രതികരണം' : 'Reaction'} className={inp} />
          <select name="severity" className={inp}><option value="mild">mild</option><option value="moderate">moderate</option><option value="severe">severe</option><option value="life-threatening">life-threatening</option></select>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">{ml ? 'ചേർക്കുക' : 'Add'}</button>
        </form>
      </section>

      {/* Medications */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="mb-1 text-base font-bold text-gray-900">💊 {ml ? 'നിലവിലെ മരുന്നുകൾ' : 'Current medications'}</h2>
        <p className="mb-2 text-xs text-gray-500">{ml ? 'സന്ദർശിക്കുന്ന എല്ലാ ഡോക്ടർമാരെയും ഈ പട്ടിക കാണിക്കുക.' : 'Show this list to every doctor you visit.'}</p>
        <ul className="mb-3 space-y-2">
          {meds.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span><b>{m.medication_name}</b>{m.dosage ? ` · ${m.dosage}` : ''}{m.frequency ? ` · ${m.frequency}` : ''}</span>
              <button onClick={() => rmMed(m.id)} aria-label="Delete" className="text-xs text-gray-400 hover:text-red-600">✕</button>
            </li>
          ))}
          {meds.length === 0 && <li className="text-sm text-gray-500">{ml ? 'മരുന്നുകൾ ഇല്ല' : 'No medications recorded'}</li>}
        </ul>
        <form onSubmit={addMed} className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <input name="medication_name" required placeholder={ml ? 'മരുന്ന്' : 'Medication'} className={inp} />
          <input name="dosage" placeholder={ml ? 'ഡോസ്' : 'Dosage'} className={inp} />
          <input name="frequency" placeholder={ml ? 'ആവൃത്തി' : 'Frequency'} className={inp} />
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">{ml ? 'ചേർക്കുക' : 'Add'}</button>
        </form>
      </section>

      {/* Records by type */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex gap-1 overflow-x-auto border-b border-gray-100 pb-2">
          {REC_TYPES.map((t) => (
            <button key={t[0]} onClick={() => setTab(t[0])} className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${tab === t[0] ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{ml ? t[1] : t[2]}</button>
          ))}
        </div>
        <ul className="mb-3 space-y-2">
          {recByType.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span><b>{r.title}</b>{r.record_date ? ` · ${String(r.record_date).slice(0, 10)}` : ''}{r.doctor_name ? ` · ${r.doctor_name}` : ''}{r.hospital_name ? ` · ${r.hospital_name}` : ''}</span>
              <button onClick={() => rmRecord(r.id)} aria-label="Delete" className="text-xs text-gray-400 hover:text-red-600">✕</button>
            </li>
          ))}
          {recByType.length === 0 && <li className="text-sm text-gray-500">{ml ? 'രേഖകൾ ഇല്ല' : 'No records'}</li>}
        </ul>
        <form onSubmit={addRecord} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input name="title" required placeholder={ml ? 'തലക്കെട്ട്' : 'Title'} className={inp} />
          <input name="record_date" type="date" className={inp} />
          <input name="doctor_name" placeholder={ml ? 'ഡോക്ടർ' : 'Doctor'} className={inp} />
          <input name="hospital_name" placeholder={ml ? 'ആശുപത്രി' : 'Hospital'} className={inp} />
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white sm:col-span-2">{ml ? 'രേഖ ചേർക്കുക' : 'Add record'}</button>
        </form>
      </section>

      {/* Emergency card */}
      <section className="rounded-2xl border-2 border-red-300 bg-red-50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-red-800">🆘 {ml ? 'അടിയന്തര ഘട്ടത്തിൽ' : 'In case of emergency'}</h2>
          <button onClick={() => window.print()} className="rounded-lg border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-700 print:hidden">🖨️ {ml ? 'പ്രിന്റ്' : 'Print'}</button>
        </div>
        <div className="mt-2 text-sm text-red-900">
          <p><b>{ml ? 'അലർജികൾ' : 'Allergies'}:</b> {allergies.map((a) => a.allergen).join(', ') || (ml ? 'ഇല്ല' : 'none')}</p>
          <p><b>{ml ? 'മരുന്നുകൾ' : 'Medications'}:</b> {meds.map((m) => m.medication_name).join(', ') || (ml ? 'ഇല്ല' : 'none')}</p>
          <p className="mt-1">{ml ? 'അടിയന്തരം' : 'Emergency'}: <a href="tel:112" className="underline">112</a> · <a href="tel:108" className="underline">108</a></p>
        </div>
      </section>
    </div>
  );
}
