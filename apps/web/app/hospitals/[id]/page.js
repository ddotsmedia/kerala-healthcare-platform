'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function HospitalProfile() {
  const params = useParams()
  const [hospital, setHospital] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/hospitals/${params.id}`)
      .then(r => r.json())
      .then(h => { setHospital(h); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (!hospital) return <div className="text-center py-12">Hospital not found</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-8 mb-6">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <div className="w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4"><span className="text-6xl">🏥</span></div>
              <a href={`tel:${hospital.phone}`} className="w-full block px-4 py-3 bg-green-500 text-white font-bold rounded-lg text-center mb-2">Call Now</a>
              <a href={`https://maps.google.com/?q=${hospital.address}`} className="w-full block px-4 py-3 border border-green-500 text-green-500 font-bold rounded-lg text-center">Directions</a>
            </div>

            <div className="col-span-3 space-y-4">
              <div>
                <h1 className="text-4xl font-bold">{hospital.name}</h1>
                <p className="text-2xl text-gray-600">{hospital.city}</p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Beds</p>
                  <p className="text-2xl font-bold">{hospital.totalBeds}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Rating</p>
                  <p className="text-2xl font-bold">⭐ {hospital.rating}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Type</p>
                  <p className="text-2xl font-bold">{hospital.type}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-500 text-sm">Depts</p>
                  <p className="text-2xl font-bold">{hospital.departments?.length}+</p>
                </div>
              </div>

              <div className="flex gap-2">
                {hospital.nabhAccredited && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">✓ NABH</span>}
                {hospital.aaciAccredited && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">✓ AACI</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-6">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{hospital.description || 'Premier healthcare facility with state-of-the-art infrastructure'}</p>
              <div>
                <h3 className="font-bold mb-2">Departments</h3>
                <div className="flex gap-2 flex-wrap">
                  {hospital.departments?.slice(0, 6).map(d => (
                    <span key={d} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-6">
              <h2 className="text-2xl font-bold mb-4">Infrastructure</h2>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-gray-500">Total Beds</p><p className="text-2xl font-bold">{hospital.totalBeds}</p></div>
                <div><p className="text-gray-500">ICU Beds</p><p className="text-2xl font-bold">{hospital.icuBeds}</p></div>
                <div><p className="text-gray-500">IBU Beds</p><p className="text-2xl font-bold">{hospital.ibuBeds}</p></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-6">
              <h3 className="font-bold mb-4">Location</h3>
              <p className="text-sm text-gray-700 mb-2">{hospital.address}</p>
              <p className="text-sm"><strong>Phone:</strong> {hospital.phone}</p>
              <p className="text-sm"><strong>Emergency:</strong> {hospital.emergencyPhone}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl glass p-6">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <a href={`tel:${hospital.phone}`} className="w-full block px-4 py-2 bg-green-500 text-white rounded-lg text-sm text-center">📞 Call</a>
                <a href={`https://maps.google.com/?q=${hospital.address}`} className="w-full block px-4 py-2 bg-blue-500 text-white rounded-lg text-sm text-center">🗺️ Map</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
