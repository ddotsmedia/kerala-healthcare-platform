'use client';

import { useState, use } from 'react';
import Link from 'next/link';

const ROLES = [
  { key: 'patient', ml: 'രോഗി', en: 'Patient' },
  { key: 'doctor', ml: 'ഡോക്ടർ', en: 'Doctor' },
  { key: 'hospital', ml: 'ആശുപത്രി', en: 'Hospital' }
];

export default function RegisterPage(props) {
  const params = use(props.params);
  const locale = params.locale === 'en' ? 'en' : 'ml';
  const ml = locale === 'ml';
  const [role, setRole] = useState('patient');
  const [stage, setStage] = useState('form');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    setBusy(true); setMsg('');
    try {
      const body = { role, name: f.name.value, email: f.email.value, locale };
      if (role === 'doctor') body.nmc_number = f.nmc_number?.value;
      if (role === 'hospital') body.org_name = f.org_name?.value;
      const r = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      const j = await r.json();
      if (r.status === 201) { setEmail(f.email.value); setStage('code'); setMsg(j.data?.debugCode ? `Dev code: ${j.data.debugCode}` : (ml ? 'OTP അയച്ചു' : 'OTP sent')); }
      else setMsg(ml ? 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു' : 'Registration failed');
    } catch { setMsg(ml ? 'പിശക് സംഭവിച്ചു' : 'Something went wrong'); } finally { setBusy(false); }
  }

  async function verify(e) {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code })
      });
      if (r.ok) {
        if (role === 'patient') window.location.href = `/${locale}/patient`;
        else window.location.href = 'https://portal.malayalidoctor.com';
      } else setMsg(ml ? 'തെറ്റായ കോഡ്' : 'Invalid code');
    } catch { setMsg(ml ? 'പിശക് സംഭവിച്ചു' : 'Something went wrong'); } finally { setBusy(false); }
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base focus:border-brand focus:outline-none';
  const btn = 'w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60';

  return (
    <div className="mx-auto max-w-sm space-y-4 py-6">
      <h1 className="text-xl font-bold">{ml ? 'രജിസ്റ്റർ ചെയ്യുക' : 'Create account'}</h1>

      {stage === 'form' ? (
        <>
          <div className="flex gap-2" role="tablist">
            {ROLES.map((r) => (
              <button key={r.key} type="button" role="tab" aria-selected={role === r.key} onClick={() => setRole(r.key)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${role === r.key ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>
                {ml ? r.ml : r.en}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="space-y-3">
            <input name="name" required placeholder={ml ? 'പേര്' : 'Name'} className={inp} />
            <input name="email" type="email" required placeholder={ml ? 'ഇമെയിൽ' : 'Email'} className={inp} />
            {role === 'doctor' && <input name="nmc_number" required placeholder={ml ? 'NMC രജിസ്ട്രേഷൻ നമ്പർ' : 'NMC registration number'} className={inp} />}
            {role === 'hospital' && <input name="org_name" required placeholder={ml ? 'സ്ഥാപനത്തിന്റെ പേര്' : 'Organisation name'} className={inp} />}
            <button className={btn} type="submit" disabled={busy}>{busy ? '…' : (ml ? 'OTP അയയ്ക്കുക' : 'Send OTP')}</button>
          </form>
          {(role === 'doctor' || role === 'hospital') && (
            <p className="text-xs text-gray-500">{ml ? 'വെരിഫിക്കേഷന് ശേഷം അക്കൗണ്ട് സജീവമാകും.' : 'Account activates after verification.'}</p>
          )}
        </>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <input inputMode="numeric" required value={code} onChange={(e) => setCode(e.target.value)}
            placeholder={ml ? 'OTP കോഡ്' : 'OTP code'} className={inp} />
          <button className={btn} type="submit" disabled={busy}>{busy ? '…' : (ml ? 'സ്ഥിരീകരിക്കുക' : 'Verify')}</button>
        </form>
      )}

      {msg && <p className="text-sm text-gray-600">{msg}</p>}
      <p className="text-center text-sm text-gray-500">
        {ml ? 'അക്കൗണ്ട് ഉണ്ടോ? ' : 'Have an account? '}
        <Link href={`/${locale}/login`} className="font-semibold text-brand hover:underline">{ml ? 'ലോഗിൻ' : 'Login'}</Link>
      </p>
      <p className="text-center text-xs text-gray-400">🔒 {ml ? 'നിങ്ങളുടെ ഡാറ്റ സുരക്ഷിതവും സ്വകാര്യവുമാണ്' : 'Your data is secure and private'}</p>
    </div>
  );
}
