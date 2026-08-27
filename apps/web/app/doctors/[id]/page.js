'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function DoctorProfile() {
  const params = useParams()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/doctors/${params.id}`)
      .then(r => r.json())
      .then(d => { setDoctor(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (!doctor) return <div className="text-center py-12">Doctor not found</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-8 mb-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-4"><span className="text-6xl">👨‍⚕️</span></div>
              <Link href={`/appointments/book/${doctor.id}`} className="w-full block px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 text-center mb-2">Book Appointment</Link>
              <button className="w-full px-4 py-3 border border-blue-500 text-blue-500 font-bold rounded-lg">Message</button>
            </div>

            <div className="col-span-3 space-y-4">
              <div>
                <h1 className="text-4xl font-bold">Dr. {doctor.name}</h1>
                <p className="text-2xl text-blue-600 font-semibold">{doctor.specialty}</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Experience</p>
                  <p className="text-2xl font-bold">{doctor.experience} Yrs</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Rating</p>
                  <p className="text-2xl font-bold">⭐ {doctor.rating}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Fee</p>
                  <p className="text-2xl font-bold">₹{doctor.consultationFee}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Patients</p>
                  <p className="text-2xl font-bold">{doctor.patientCount || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-6">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-700 dark:text-gray-300">{doctor.bio || 'Professional doctor with extensive experience'}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-6">
              <h2 className="text-2xl font-bold mb-4">Qualifications</h2>
              <div className="space-y-3">
                {doctor.qualifications?.map((q, i) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-4">
                    <p className="font-bold">{q.degree}</p>
                    <p className="text-sm text-gray-600">{q.university} • {q.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-6">
              <h3 className="font-bold mb-4">Availability</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Mon-Fri:</strong> 9 AM - 5 PM</p>
                <p><strong>Sat:</strong> 10 AM - 2 PM</p>
                <p><strong>Sun:</strong> Closed</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-6">
              <h3 className="font-bold mb-4">Contact</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {doctor.email}</p>
                <p><strong>Phone:</strong> {doctor.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
