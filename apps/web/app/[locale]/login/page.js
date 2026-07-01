'use client';

import { useState } from 'react';

export default function LoginPage({ params }) {
  const locale = params.locale === 'en' ? 'en' : 'ml';
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState('mobile');
  const [msg, setMsg] = useState('');

  async function requestOtp(e) {
    e.preventDefault();
    setMsg('');
    const r = await fetch('/api/auth/request-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile })
    });
    const j = await r.json();
    if (j.data?.sent) { setStage('code'); setMsg(j.data.debugCode ? `Dev code: ${j.data.debugCode}` : 'OTP sent'); }
    else setMsg('Could not send OTP');
  }

  async function verify(e) {
    e.preventDefault();
    setMsg('');
    const r = await fetch('/api/auth/verify-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile, code })
    });
    if (r.ok) window.location.href = `/${locale}/patient`;
    else setMsg('Invalid or expired code');
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-4 py-2 text-base focus:border-brand focus:outline-none';
  const btn = 'w-full rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark';

  return (
    <div className="mx-auto max-w-sm space-y-4 py-8">
      <h1 className="text-xl font-bold">{locale === 'ml' ? 'ലോഗിൻ' : 'Login'}</h1>
      {stage === 'mobile' ? (
        <form onSubmit={requestOtp} className="space-y-3">
          <input className={inp} type="tel" placeholder={locale === 'ml' ? 'മൊബൈൽ നമ്പർ' : 'Mobile number'}
            value={mobile} onChange={(e) => setMobile(e.target.value)} required />
          <button className={btn} type="submit">{locale === 'ml' ? 'OTP അയയ്ക്കുക' : 'Send OTP'}</button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <input className={inp} inputMode="numeric" placeholder={locale === 'ml' ? 'OTP കോഡ്' : 'OTP code'}
            value={code} onChange={(e) => setCode(e.target.value)} required />
          <button className={btn} type="submit">{locale === 'ml' ? 'സ്ഥിരീകരിക്കുക' : 'Verify'}</button>
        </form>
      )}
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
