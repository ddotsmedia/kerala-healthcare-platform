'use client';

// 6-step doctor self-registration. Collects all steps, submits to
// /api/register/doctor. Documents are read as base64 data URLs (stored in DB).
import { useState } from 'react';

const MODES = ['in_person', 'video', 'phone'];
const LANGS = ['ml', 'en', 'ta', 'hi', 'kn'];

const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none';

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => resolve(null);
    r.readAsDataURL(file);
  });
}

export default function DoctorRegisterForm({ locale = 'ml', specialties = [], districts = [] }) {
  const ml = locale === 'ml';
  const [step, setStep] = useState(1);
  const [f, setF] = useState({
    name_en: '', name_ml: '', gender: '', dob: '', photo_url: '',
    registration_number: '', registration_council: '', specialty_slug: '', experience_years: '',
    languages: ['ml'], education: [{ degree: '', institution: '', year: '' }],
    district_slug: '', consultation_modes: ['in_person'], consultation_fee_inr: '', whatsapp: '',
    affiliations: '', email: '', documents: [], terms_agreed: false
  });
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggle = (k, v) => setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));

  async function addDoc(type, file) {
    if (!file) return;
    const url = await fileToDataUrl(file);
    if (url) setF((s) => ({ ...s, documents: [...s.documents.filter((d) => d.type !== type), { type, file_url: url }] }));
  }

  async function submit() {
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/register/doctor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, specialty_slugs: [f.specialty_slug] })
      });
      const j = await res.json();
      if (res.status === 201) setDone(j.data);
      else setErr(ml ? 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു: ' + (j.errors?.[0] || '') : 'Registration failed: ' + (j.errors?.[0] || ''));
    } catch { setErr(ml ? 'പിശക് സംഭവിച്ചു' : 'Something went wrong'); } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-teal-300 bg-teal-50 p-6 text-center">
        <p className="text-3xl">✅</p>
        <h2 className="mt-1 text-lg font-bold text-teal-900">{ml ? 'രജിസ്ട്രേഷൻ പൂർത്തിയായി!' : 'Registration submitted!'}</h2>
        <p className="mt-1 text-sm text-teal-800">
          {ml ? 'നിങ്ങളുടെ പ്രൊഫൈൽ പരിശോധനയിലാണ്. 24-48 മണിക്കൂറിനുള്ളിൽ ലൈവ് ആകും.' : 'Your profile is under review. You will go live within 24-48 hours.'}
        </p>
      </div>
    );
  }

  const StepNav = () => (
    <div className="flex items-center justify-between pt-2">
      <button type="button" disabled={step === 1 || busy} onClick={() => setStep((s) => s - 1)}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-40">{ml ? 'പിന്നോട്ട്' : 'Back'}</button>
      {step < 6
        ? <button type="button" onClick={() => setStep((s) => s + 1)} className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white">{ml ? 'അടുത്തത്' : 'Next'}</button>
        : <button type="button" disabled={busy || !f.terms_agreed} onClick={submit} className="rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? '…' : (ml ? 'സമർപ്പിക്കുക' : 'Submit')}</button>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className={`h-1.5 flex-1 rounded ${n <= step ? 'bg-brand' : 'bg-gray-200'}`} />)}
      </div>
      <p className="text-xs font-semibold text-gray-500">{ml ? 'ഘട്ടം' : 'Step'} {step}/6</p>

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">{ml ? 'അടിസ്ഥാന വിവരങ്ങൾ' : 'Basic Info'}</h3>
          <input className={inp} placeholder={ml ? 'പേര് (ഇംഗ്ലീഷ്) *' : 'Full name (English) *'} value={f.name_en} onChange={(e) => set('name_en', e.target.value)} />
          <input className={inp} placeholder={ml ? 'പേര് (മലയാളം)' : 'Full name (Malayalam)'} value={f.name_ml} onChange={(e) => set('name_ml', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select className={inp} value={f.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="">{ml ? 'ലിംഗം' : 'Gender'}</option><option value="male">{ml ? 'പുരുഷൻ' : 'Male'}</option><option value="female">{ml ? 'സ്ത്രീ' : 'Female'}</option><option value="other">{ml ? 'മറ്റുള്ളവ' : 'Other'}</option>
            </select>
            <input type="date" className={inp} value={f.dob} onChange={(e) => set('dob', e.target.value)} />
          </div>
          <input className={inp} placeholder={ml ? 'പ്രൊഫൈൽ ഫോട്ടോ URL' : 'Profile photo URL'} value={f.photo_url} onChange={(e) => set('photo_url', e.target.value)} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">{ml ? 'പ്രൊഫഷണൽ വിവരങ്ങൾ' : 'Professional Details'}</h3>
          <input className={inp} placeholder={ml ? 'രജിസ്ട്രേഷൻ നമ്പർ *' : 'Registration number *'} value={f.registration_number} onChange={(e) => set('registration_number', e.target.value)} />
          <input className={inp} placeholder={ml ? 'കൗൺസിൽ (ഉദാ. KMC/NMC)' : 'Council (e.g. KMC/NMC)'} value={f.registration_council} onChange={(e) => set('registration_council', e.target.value)} />
          <select className={inp} value={f.specialty_slug} onChange={(e) => set('specialty_slug', e.target.value)}>
            <option value="">{ml ? 'സ്പെഷ്യാലിറ്റി' : 'Specialty'}</option>
            {specialties.map((s) => <option key={s.slug} value={s.slug}>{(ml ? s.name_ml : s.name_en) || s.name_en}</option>)}
          </select>
          <input type="number" className={inp} placeholder={ml ? 'അനുഭവ വർഷം' : 'Years of experience'} value={f.experience_years} onChange={(e) => set('experience_years', e.target.value)} />
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">{ml ? 'ഭാഷകൾ' : 'Languages'}</p>
            <div className="flex flex-wrap gap-2">{LANGS.map((l) => <button type="button" key={l} onClick={() => toggle('languages', l)} className={`rounded-full px-3 py-1 text-xs ${f.languages.includes(l) ? 'bg-brand text-white' : 'border border-gray-300'}`}>{l}</button>)}</div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">{ml ? 'വിദ്യാഭ്യാസം' : 'Education'}</h3>
          {f.education.map((ed, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input className={inp} placeholder={ml ? 'ബിരുദം' : 'Degree'} value={ed.degree} onChange={(e) => setF((s) => { const a = [...s.education]; a[i] = { ...a[i], degree: e.target.value }; return { ...s, education: a }; })} />
              <input className={inp} placeholder={ml ? 'സ്ഥാപനം' : 'Institution'} value={ed.institution} onChange={(e) => setF((s) => { const a = [...s.education]; a[i] = { ...a[i], institution: e.target.value }; return { ...s, education: a }; })} />
              <input className={inp} placeholder={ml ? 'വർഷം' : 'Year'} value={ed.year} onChange={(e) => setF((s) => { const a = [...s.education]; a[i] = { ...a[i], year: e.target.value }; return { ...s, education: a }; })} />
            </div>
          ))}
          <button type="button" onClick={() => setF((s) => ({ ...s, education: [...s.education, { degree: '', institution: '', year: '' }] }))} className="text-sm font-semibold text-brand">+ {ml ? 'കൂടുതൽ ചേർക്കുക' : 'Add more'}</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">{ml ? 'പ്രാക്ടീസ് വിവരങ്ങൾ' : 'Practice Details'}</h3>
          <select className={inp} value={f.district_slug} onChange={(e) => set('district_slug', e.target.value)}>
            <option value="">{ml ? 'ജില്ല' : 'District'}</option>
            {districts.map((d) => <option key={d.name_en} value={d.name_en}>{(ml ? d.name_ml : d.name_en) || d.name_en}</option>)}
          </select>
          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">{ml ? 'കൺസൾട്ടേഷൻ രീതി' : 'Consultation modes'}</p>
            <div className="flex flex-wrap gap-2">{MODES.map((m) => <button type="button" key={m} onClick={() => toggle('consultation_modes', m)} className={`rounded-full px-3 py-1 text-xs ${f.consultation_modes.includes(m) ? 'bg-brand text-white' : 'border border-gray-300'}`}>{m}</button>)}</div>
          </div>
          <input type="number" className={inp} placeholder={ml ? 'കൺസൾട്ടേഷൻ ഫീസ് (₹)' : 'Consultation fee (₹)'} value={f.consultation_fee_inr} onChange={(e) => set('consultation_fee_inr', e.target.value)} />
          <input className={inp} placeholder={ml ? 'WhatsApp നമ്പർ' : 'WhatsApp number'} value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
          <input className={inp} placeholder={ml ? 'ആശുപത്രി അഫിലിയേഷനുകൾ' : 'Hospital affiliations'} value={f.affiliations} onChange={(e) => set('affiliations', e.target.value)} />
          <input type="email" className={inp} placeholder={ml ? 'ഇമെയിൽ (അപ്ഡേറ്റുകൾക്ക്)' : 'Email (for updates)'} value={f.email} onChange={(e) => set('email', e.target.value)} />
        </div>
      )}

      {step === 5 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">{ml ? 'രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക' : 'Document Upload'}</h3>
          {[['registration_certificate', ml ? 'രജിസ്ട്രേഷൻ സർട്ടിഫിക്കറ്റ്' : 'Registration certificate'], ['degree_certificate', ml ? 'ബിരുദ സർട്ടിഫിക്കറ്റ്' : 'Degree certificate'], ['government_id', ml ? 'സർക്കാർ ഐഡി' : 'Government ID']].map(([type, label]) => (
            <div key={type} className="rounded-lg border border-gray-200 p-3">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input type="file" accept="image/*" className="mt-1 block w-full text-xs" onChange={(e) => addDoc(type, e.target.files[0])} />
              {f.documents.some((d) => d.type === type) && <p className="mt-1 text-xs text-green-600">✓ {ml ? 'അപ്‌ലോഡ് ചെയ്തു' : 'Uploaded'}</p>}
            </div>
          ))}
          <p className="text-xs text-gray-400">{ml ? 'ചിത്രങ്ങൾ സുരക്ഷിതമായി സൂക്ഷിക്കുന്നു.' : 'Images are stored securely.'}</p>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900">{ml ? 'അവലോകനം & സമർപ്പണം' : 'Review & Submit'}</h3>
          <dl className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
            <div><span className="text-gray-500">{ml ? 'പേര്: ' : 'Name: '}</span>{f.name_en}</div>
            <div><span className="text-gray-500">{ml ? 'രജിസ്ട്രേഷൻ: ' : 'Registration: '}</span>{f.registration_number} ({f.registration_council})</div>
            <div><span className="text-gray-500">{ml ? 'സ്പെഷ്യാലിറ്റി: ' : 'Specialty: '}</span>{f.specialty_slug}</div>
            <div><span className="text-gray-500">{ml ? 'ജില്ല: ' : 'District: '}</span>{f.district_slug}</div>
            <div><span className="text-gray-500">{ml ? 'രേഖകൾ: ' : 'Documents: '}</span>{f.documents.length}</div>
          </dl>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={f.terms_agreed} onChange={(e) => set('terms_agreed', e.target.checked)} className="mt-1" />
            <span>{ml ? 'നൽകിയ വിവരങ്ങൾ ശരിയാണെന്നും നിബന്ധനകൾ അംഗീകരിക്കുന്നുവെന്നും ഞാൻ സ്ഥിരീകരിക്കുന്നു.' : 'I confirm the information is accurate and I agree to the terms.'}</span>
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
      )}

      <StepNav />
    </div>
  );
}
