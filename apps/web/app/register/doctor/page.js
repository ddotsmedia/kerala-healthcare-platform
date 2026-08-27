'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DoctorRegister() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '', phone: '', password: '', firstName: '', lastName: '', nmcNumber: '', mcNumber: '',
    qualifications: [], specialties: [], experience: 0, languages: [], consultationFee: 0,
    officeHours: { monday: { start: '', end: '' }, tuesday: { start: '', end: '' }, wednesday: { start: '', end: '' },
      thursday: { start: '', end: '' }, friday: { start: '', end: '' }, saturday: { start: '', end: '' }, sunday: { start: '', end: '' } },
    documents: [], consentVerification: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const specialtiesList = ['General Practice', 'Cardiology', 'Dermatology', 'ENT', 'Gastroenterology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Psychiatry', 'Surgery']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register/doctor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const data = await res.json(); setError(data.error || 'Registration failed'); setLoading(false); return }
      router.push('/auth/verify-email?email=' + form.email)
    } catch (err) {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-center mb-2">Register as Doctor</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Join Kerala's largest healthcare platform</p>

          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={h-2 flex-1 mx-1 rounded-full \} />
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">Step \ of 4</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required className="px-4 py-3 border rounded-lg dark:bg-gray-700" />
                  <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required className="px-4 py-3 border rounded-lg dark:bg-gray-700" />
                </div>
                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <input type="tel" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength="8" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <button type="button" onClick={() => setStep(2)} className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">Continue</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Medical Credentials</h2>
                <input type="text" name="nmcNumber" placeholder="NMC Registration Number" value={form.nmcNumber} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <input type="number" name="experience" placeholder="Years of Experience" value={form.experience} onChange={handleChange} min="0" max="70" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <div>
                  <label className="block font-medium mb-2">Specialties</label>
                  <div className="grid grid-cols-2 gap-2">
                    {specialtiesList.map(spec => (
                      <label key={spec} className="flex items-center gap-2">
                        <input type="checkbox" checked={form.specialties.includes(spec)} onChange={() => { form.specialties.includes(spec) ? setForm({...form, specialties: form.specialties.filter(s => s !== spec)}) : setForm({...form, specialties: [...form.specialties, spec]}) }} className="rounded" />
                        <span className="text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-blue-500 text-blue-500 font-bold rounded-lg">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Qualifications</h2>
                <input type="number" name="consultationFee" placeholder="Consultation Fee (₹)" value={form.consultationFee} onChange={handleChange} min="0" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border border-blue-500 text-blue-500 font-bold rounded-lg">Back</button>
                  <button type="button" onClick={() => setStep(4)} className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg">Continue</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Verification</h2>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="consentVerification" checked={form.consentVerification} onChange={handleChange} required className="mt-1" />
                  <span className="text-sm">I verify all information is accurate and complete. My credentials will be verified.</span>
                </label>
                {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 border border-blue-500 text-blue-500 font-bold rounded-lg">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50">{loading ? 'Creating...' : 'Complete'}</button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
