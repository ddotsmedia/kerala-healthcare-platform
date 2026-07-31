'use client';

// PledgeForm — public organ-donation awareness pledge. On success shows a
// thank-you + WhatsApp share, and reports the new running count to the counter.
import { useState } from 'react';

const ORGANS = [
  { key: 'all', ml: 'എല്ലാ അവയവങ്ങളും', en: 'All organs' },
  { key: 'kidney', ml: 'വൃക്ക', en: 'Kidney' },
  { key: 'liver', ml: 'കരൾ', en: 'Liver' },
  { key: 'heart', ml: 'ഹൃദയം', en: 'Heart' },
  { key: 'lungs', ml: 'ശ്വാസകോശം', en: 'Lungs' },
  { key: 'cornea', ml: 'കോർണിയ', en: 'Cornea' }
];

export default function PledgeForm({ locale = 'ml', districts = [], knosUrl, onPledged }) {
  const ml = locale === 'ml';
  const [organs, setOrgans] = useState(['all']);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  function toggle(key) {
    setOrgans((cur) => {
      if (key === 'all') return ['all'];
      const next = cur.filter((o) => o !== 'all');
      return next.includes(key) ? next.filter((o) => o !== key) : [...next, key];
    });
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const f = e.target;
    try {
      const res = await fetch('/api/organ-donation/pledge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name.value, email: f.email.value, phone: f.phone.value,
          district_id: f.district_id.value || null, organs_pledged: organs,
          knos_registration_number: f.knos.value
        })
      });
      const j = await res.json();
      if (res.status === 201) { setDone(true); if (onPledged && j.data?.count) onPledged(j.data.count); }
      else if (res.status === 429) setErr(ml ? 'ദയവായി കുറച്ച് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക.' : 'Please try again in a while.');
      else setErr(ml ? 'പേരും ഒരു അവയവമെങ്കിലും തിരഞ്ഞെടുക്കുക.' : 'Enter your name and pick at least one organ.');
    } catch { setErr(ml ? 'എന്തോ പിശക് സംഭവിച്ചു.' : 'Something went wrong.'); }
    finally { setBusy(false); }
  }

  if (done) {
    const msg = ml
      ? 'ഞാൻ MalayaliDoctor-ൽ അവയവദാനത്തിന് പ്രതിജ്ഞയെടുത്തു. നിങ്ങളും ജീവന്റെ സമ്മാനം നൽകൂ.'
      : 'I pledged to donate organs on MalayaliDoctor. Give the gift of life too.';
    const wa = `https://wa.me/?text=${encodeURIComponent(`${msg} ${typeof window !== 'undefined' ? window.location.href : ''}`)}`;
    return (
      <div className="rounded-2xl border border-teal-300 bg-teal-50 p-5 text-center">
        <p className="text-3xl">💚</p>
        <h3 className="mt-1 text-lg font-bold text-teal-900">{ml ? 'നന്ദി! നിങ്ങളുടെ പ്രതിജ്ഞ രേഖപ്പെടുത്തി.' : 'Thank you! Your pledge is recorded.'}</h3>
        <p className="mt-1 text-sm text-teal-800">
          {ml
            ? 'ഇത് ഒരു അവബോധ പ്രതിജ്ഞ മാത്രമാണ്. ഔദ്യോഗിക രജിസ്ട്രേഷനായി KNOS സന്ദർശിക്കുക.'
            : 'This is an awareness pledge only. Visit KNOS to complete official registration.'}
        </p>
        <div className="mt-3 flex flex-col justify-center gap-2 sm:flex-row">
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">💬 {ml ? 'WhatsApp-ൽ പങ്കിടുക' : 'Share on WhatsApp'}</a>
          <a href={knosUrl} target="_blank" rel="noopener noreferrer"
            className="rounded-lg border border-teal-600 px-4 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-100">{ml ? 'KNOS-ൽ രജിസ്റ്റർ ചെയ്യൂ →' : 'Register with KNOS →'}</a>
        </div>
      </div>
    );
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand focus:outline-none';
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-bold text-gray-900">{ml ? 'അവയവദാന പ്രതിജ്ഞ എടുക്കൂ' : 'Take the pledge'}</h3>
      <input name="name" required placeholder={ml ? 'നിങ്ങളുടെ പേര് *' : 'Your name *'} className={inp} />
      <div className="grid grid-cols-2 gap-3">
        <input name="email" type="email" placeholder={ml ? 'ഇമെയിൽ' : 'Email'} className={inp} />
        <input name="phone" inputMode="tel" placeholder={ml ? 'ഫോൺ' : 'Phone'} className={inp} />
      </div>
      <select name="district_id" className={inp} defaultValue="">
        <option value="">{ml ? 'ജില്ല (ഐച്ഛികം)' : 'District (optional)'}</option>
        {districts.map((d) => <option key={d.id} value={d.id}>{(ml ? d.name_ml : d.name_en) || d.name_en}</option>)}
      </select>
      <div>
        <p className="mb-1.5 text-sm font-medium text-gray-700">{ml ? 'ഏതൊക്കെ അവയവങ്ങൾ?' : 'Which organs?'}</p>
        <div className="flex flex-wrap gap-2">
          {ORGANS.map((o) => {
            const on = organs.includes(o.key);
            return (
              <button type="button" key={o.key} onClick={() => toggle(o.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${on ? 'bg-brand text-white' : 'border border-gray-300 bg-white text-gray-700'}`}>
                {ml ? o.ml : o.en}
              </button>
            );
          })}
        </div>
      </div>
      <input name="knos" placeholder={ml ? 'KNOS രജിസ്ട്രേഷൻ നമ്പർ (ഉണ്ടെങ്കിൽ)' : 'KNOS registration number (if any)'} className={inp} />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button type="submit" disabled={busy}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-dark disabled:opacity-60">
        {busy ? '…' : (ml ? '💚 പ്രതിജ്ഞ എടുക്കൂ' : '💚 Take the pledge')}
      </button>
      <p className="text-xs text-gray-400">
        {ml
          ? 'ഇത് ഒരു അവബോധ പ്രതിജ്ഞ മാത്രം — നിയമപരമായ ദാതൃ രജിസ്ട്രേഷനല്ല. നിങ്ങളുടെ വിവരങ്ങൾ സ്വകാര്യമായി സൂക്ഷിക്കുന്നു.'
          : 'This is an awareness pledge only — not a legal donor registration. Your details are kept private.'}
      </p>
    </form>
  );
}
