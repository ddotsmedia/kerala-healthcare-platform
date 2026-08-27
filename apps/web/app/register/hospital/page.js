'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HospitalRegister() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '', phone: '', password: '', hospitalName: '', hospitalType: 'general', foundedYear: new Date().getFullYear(),
    registrationNumber: '', address: '', city: '', state: 'Kerala', pincode: '', emergencyPhone: '',
    totalBeds: 0, ibuBeds: 0, icuBeds: 0, nabhAccredited: false, aaciAccredited: false,
    departments: [], specialties: [], website: '', consentVerification: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const departmentsList = ['General Medicine', 'Surgery', 'Pediatrics', 'OB/GYN', 'Orthopedics', 'Cardiology', 'Neurology', 'Psychiatry', 'ENT', 'Ophthalmology']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register/hospital', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
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
          <h1 className="text-4xl font-bold text-center mb-2">Register Your Hospital</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Join Kerala's hospital network</p>

          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {[1, 2, 3].map(s => (
                <div key={s} className={h-2 flex-1 mx-1 rounded-full \} />
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">Step \ of 3</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Hospital Information</h2>
                <input type="text" name="hospitalName" placeholder="Hospital Name" value={form.hospitalName} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <select name="hospitalType" value={form.hospitalType} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700">
                  <option value="general">General</option>
                  <option value="specialty">Specialty</option>
                  <option value="multi_specialty">Multi-Specialty</option>
                </select>
                <input type="text" name="registrationNumber" placeholder="Registration Number" value={form.registrationNumber} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <textarea name="address" placeholder="Full Address" value={form.address} onChange={handleChange} rows="3" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} className="px-4 py-3 border rounded-lg dark:bg-gray-700" />
                  <input type="text" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} className="px-4 py-3 border rounded-lg dark:bg-gray-700" />
                </div>
                <button type="button" onClick={() => setStep(2)} className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">Continue</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Infrastructure & Departments</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Beds</label>
                    <input type="number" name="totalBeds" value={form.totalBeds} onChange={handleChange} min="0" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">IBU Beds</label>
                    <input type="number" name="ibuBeds" value={form.ibuBeds} onChange={handleChange} min="0" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ICU Beds</label>
                    <input type="number" name="icuBeds" value={form.icuBeds} onChange={handleChange} min="0" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-2">Departments</label>
                  <div className="grid grid-cols-2 gap-2">
                    {departmentsList.map(dept => (
                      <label key={dept} className="flex items-center gap-2">
                        <input type="checkbox" checked={form.departments.includes(dept)} onChange={() => { form.departments.includes(dept) ? setForm({...form, departments: form.departments.filter(d => d !== dept)}) : setForm({...form, departments: [...form.departments, dept]}) }} className="rounded" />
                        <span className="text-sm">{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="nabhAccredited" checked={form.nabhAccredited} onChange={handleChange} className="rounded" />
                    <span className="text-sm">NABH Accredited</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="aaciAccredited" checked={form.aaciAccredited} onChange={handleChange} className="rounded" />
                    <span className="text-sm">AACI Accredited</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-blue-500 text-blue-500 font-bold rounded-lg">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Contact & Verification</h2>
                <input type="email" name="email" placeholder="Hospital Email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <input type="tel" name="phone" placeholder="Main Phone" value={form.phone} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <input type="tel" name="emergencyPhone" placeholder="Emergency Phone" value={form.emergencyPhone} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength="8" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <label className="flex items-start gap-3">
                  <input type="checkbox" name="consentVerification" checked={form.consentVerification} onChange={handleChange} required className="mt-1" />
                  <span className="text-sm">I verify all information is accurate. Our team will verify your hospital details.</span>
                </label>
                {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border border-blue-500 text-blue-500 font-bold rounded-lg">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50">{loading ? 'Registering...' : 'Complete'}</button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
