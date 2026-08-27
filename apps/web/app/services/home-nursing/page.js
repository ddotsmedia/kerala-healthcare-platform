'use client'
import { useState, useEffect } from 'react'
export default function HomeNursing() {
  const [nurses, setNurses] = useState([])
  useEffect(() => { fetch('/api/nursing-services').then(r => r.json()).then(setNurses) }, [])
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Home Nursing Services</h1>
      <div className="grid grid-cols-3 gap-6">
        {nurses.map(nurse => (
          <div key={nurse.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-xl">👩‍⚕️</span>
              </div>
              <div>
                <p className="font-bold">{nurse.name}</p>
                <p className="text-xs text-gray-600">{nurse.qualification}</p>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Experience:</strong> {nurse.experience} years</p>
              <p><strong>Rate:</strong> ₹{nurse.hourlyRate}/hour</p>
            </div>
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-medium">Book Now</button>
          </div>
        ))}
      </div>
    </div>
  )
}
