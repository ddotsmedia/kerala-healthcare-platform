'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PatientRegister() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '', phone: '', password: '', firstName: '', lastName: '', dob: '', gender: '',
    bloodGroup: '', healthConditions: '', medications: '', allergies: '',
    emergencyContact: '', emergencyPhone: '', consentPrivacy: false, consentTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Registration failed')
        return
      }
      router.push('/auth/verify-email?email=' + form.email)
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-center mb-2">Create Patient Account</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Register to book appointments and manage your health</p>

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
                <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required className="px-4 py-3 border rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" />
                  <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required className="px-4 py-3 border rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" />
                </div>
                <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" />
                <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" />
                <input type="password" name="password" placeholder="Password (min 8 chars)" value={form.password} onChange={handleChange} required minLength="8" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setStep(2)} className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">Continue</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Health Information</h2>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700">
                  <option value="">Blood Group</option>
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                </select>
                <textarea name="healthConditions" placeholder="Health conditions (comma separated)" value={form.healthConditions} onChange={handleChange} rows="2" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <textarea name="medications" placeholder="Current medications" value={form.medications} onChange={handleChange} rows="2" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <textarea name="allergies" placeholder="Known allergies" value={form.allergies} onChange={handleChange} rows="2" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-blue-500 text-blue-500 font-bold rounded-lg">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Emergency & Consent</h2>
                <input type="text" name="emergencyContact" placeholder="Emergency Contact Name" value={form.emergencyContact} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <input type="tel" name="emergencyPhone" placeholder="Emergency Phone" value={form.emergencyPhone} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" />
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="consentPrivacy" checked={form.consentPrivacy} onChange={handleChange} required className="mt-1" />
                    <span className="text-sm">I agree to the <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a></span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="consentTerms" checked={form.consentTerms} onChange={handleChange} required className="mt-1" />
                    <span className="text-sm">I agree to the <a href="/terms" className="text-blue-500 hover:underline">Terms of Service</a></span>
                  </label>
                </div>
                {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border border-blue-500 text-blue-500 font-bold rounded-lg">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:opacity-50">{loading ? 'Creating...' : 'Create Account'}</button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">Already have an account? <a href="/login" className="text-blue-500 hover:underline font-bold">Login</a></p>
        </div>
      </div>
    </div>
  )
}
