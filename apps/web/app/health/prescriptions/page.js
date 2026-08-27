'use client'
import { useEffect, useState } from 'react'

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refilling, setRefilling] = useState(null)

  useEffect(() => {
    fetch('/api/health/prescriptions')
      .then(r => r.json())
      .then(d => setPrescriptions(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const requestRefill = async (rxId) => {
    setRefilling(rxId)
    try {
      const res = await fetch('/api/health/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescription_id: rxId })
      })
      const data = await res.json()
      if (res.ok) {
        setPrescriptions(prescriptions.map(r =>
          r.id === rxId ? { ...r, refills_left: data.refills_left } : r
        ))
      } else {
        alert(data.error || 'Refill request failed')
      }
    } finally {
      setRefilling(null)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Prescriptions</h1>
        <p className="text-gray-600 text-sm mt-1">{prescriptions.length} prescriptions on file</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-gray-600">No prescriptions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(rx => {
            const expiryDate = new Date(rx.expiry_date)
            const isExpired = expiryDate < new Date()
            const canRefill = rx.refills_left > 0 && !isExpired

            return (
              <div key={rx.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-xs font-medium uppercase">Doctor</p>
                    <p className="font-bold text-sm">Dr. {rx.doctor_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-medium uppercase">Issued</p>
                    <p className="font-bold text-sm">{new Date(rx.issue_date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-medium uppercase">Expires</p>
                    <p className={`font-bold text-sm ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                      {new Date(rx.expiry_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-medium uppercase">Refills Left</p>
                    <p className="font-bold text-sm">{rx.refills_left}</p>
                  </div>
                </div>

                {rx.medications && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Medications:</p>
                    {Array.isArray(rx.medications) ? (
                      <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 text-xs mt-1">
                        {rx.medications.map((med, i) => (
                          <li key={i}>{med}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-blue-800 dark:text-blue-200 text-xs mt-1">{rx.medications}</p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => requestRefill(rx.id)}
                  disabled={!canRefill || refilling === rx.id}
                  className={`w-full px-4 py-2 rounded font-medium text-sm transition ${
                    canRefill
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {refilling === rx.id ? '⏳ Processing...' : '🔄 Request Refill'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
