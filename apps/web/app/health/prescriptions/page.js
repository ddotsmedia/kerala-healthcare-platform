'use client'
import { useEffect, useState } from 'react'
export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  useEffect(() => { fetch('/api/health/prescriptions').then(r => r.json()).then(setPrescriptions) }, [])
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Prescriptions</h1>
      <div className="space-y-4">
        {prescriptions.map(rx => (
          <div key={rx.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div><p className="text-gray-600">Doctor</p><p className="font-bold">Dr. {rx.doctorName}</p></div>
              <div><p className="text-gray-600">Date</p><p className="font-bold">{rx.issueDate}</p></div>
              <div><p className="text-gray-600">Refills</p><p className="font-bold">{rx.refillsLeft}</p></div>
            </div>
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium">🔄 Request Refill</button>
          </div>
        ))}
      </div>
    </div>
  )
}
