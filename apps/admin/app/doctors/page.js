'use client'
import { useEffect, useState } from 'react'

export default function DoctorVerification() {
  const [doctors, setDoctors] = useState([])
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetch(/api/admin/doctors?filter=\)
      .then(r => r.json())
      .then(setDoctors)
  }, [filter])

  const handleVerify = (doctorId) => {
    fetch(/api/admin/doctors/\/verify, { method: 'POST' })
      .then(() => setDoctors(doctors.map(d => d.id === doctorId ? {...d, verified: true} : d)))
  }

  const handleReject = (doctorId) => {
    const reason = prompt('Rejection reason:')
    if (reason) {
      fetch(/api/admin/doctors/\/reject, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
        .then(() => setDoctors(doctors.filter(d => d.id !== doctorId)))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Doctor Verification</h1>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="px-4 py-2 border rounded-lg dark:bg-gray-800"
      >
        <option value="pending">Pending ({doctors.length})</option>
        <option value="verified">Verified</option>
        <option value="rejected">Rejected</option>
      </select>

      <div className="grid grid-cols-3 gap-4">
        {doctors.map(d => (
          <div key={d.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <div className="space-y-3">
              <div>
                <p className="font-bold text-lg">{d.full_name}</p>
                <p className="text-sm text-gray-500">{d.specialty}</p>
              </div>
              <div className="space-y-1 text-xs">
                <p><strong>License:</strong> {d.license_number}</p>
                <p><strong>Council:</strong> {d.medical_council}</p>
                <p><strong>Experience:</strong> {d.experience_years} yrs</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerify(d.id)}
                  className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleReject(d.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
