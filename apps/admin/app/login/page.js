'use client';

import { useState } from 'react';

export default function AdminLogin() {
  const [tab, setTab] = useState('email');

  // --- OTP flow ---
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState('mobile');
  const [otpMsg, setOtpMsg] = useState('');

  // --- Email flow ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function requestOtp(e) {
    e.preventDefault(); setOtpMsg('');
    const r = await fetch('/api/auth/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile }) });
    const j = await r.json();
    if (j.data?.sent) { setStage('code'); setOtpMsg(j.data.debugCode ? `Dev code: ${j.data.debugCode}` : 'OTP sent'); } else setOtpMsg('Could not send OTP');
  }
  async function verifyOtp(e) {
    e.preventDefault(); setOtpMsg('');
    const r = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile, code }) });
    if (r.ok) window.location.href = '/dashboard'; else setOtpMsg('Invalid or expired code');
  }
  async function emailLogin(e) {
    e.preventDefault(); setEmailErr(''); setBusy(true);
    try {
      const r = await fetch('/api/admin/auth/email-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (r.ok) { window.location.href = '/dashboard'; return; }
      const j = await r.json().catch(() => ({}));
      setEmailErr(r.status === 429 ? 'Too many attempts — try again later.' : (j.errors?.[0] === 'invalid_credentials' ? 'Incorrect email or password.' : 'Login failed.'));
    } catch { setEmailErr('Network error.'); }
    setBusy(false);
  }

  const inp = 'w-full rounded-lg border border-line bg-surface px-4 py-2 text-base text-ink placeholder:text-ink-soft focus:border-brand focus:outline-none';
  const btn = 'w-full rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60';
  const tabBtn = (active) => `flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${active ? 'bg-surface text-brand shadow-sm' : 'text-ink-soft hover:text-ink'}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-2 px-4">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <div className="text-center">
          <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-lg font-black text-white">K</span>
          <h1 className="text-xl font-bold text-ink">KHP Admin</h1>
          <p className="text-sm text-ink-soft">Sign in to the operations dashboard</p>
        </div>

        <div className="flex gap-1 rounded-xl border border-line bg-surface-2 p-1">
          <button type="button" onClick={() => setTab('email')} className={tabBtn(tab === 'email')}>Email Login</button>
          <button type="button" onClick={() => setTab('otp')} className={tabBtn(tab === 'otp')}>Mobile OTP</button>
        </div>

        {tab === 'email' ? (
          <form onSubmit={emailLogin} className="space-y-3">
            <input className={inp} type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <input className={`${inp} pr-16`} type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-ink-soft hover:text-brand">{showPw ? 'Hide' : 'Show'}</button>
            </div>
            <button className={btn} disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
            {emailErr && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{emailErr}</p>}
          </form>
        ) : (
          <div className="space-y-3">
            {stage === 'mobile' ? (
              <form onSubmit={requestOtp} className="space-y-3">
                <input className={inp} type="tel" placeholder="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                <button className={btn}>Send OTP</button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-3">
                <input className={inp} inputMode="numeric" placeholder="OTP code" value={code} onChange={(e) => setCode(e.target.value)} required />
                <button className={btn}>Verify</button>
              </form>
            )}
            {otpMsg && <p className="text-sm text-ink-soft">{otpMsg}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
