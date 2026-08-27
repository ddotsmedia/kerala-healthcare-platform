'use client'
import { useState, useEffect } from 'react'
export default function WaitingList() {
  const [list, setList] = useState([])
  useEffect(() => { fetch('/api/health/waiting-list').then(r => r.json()).then(setList) }, [])
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Waiting List</h1>
      <div className="space-y-3">
        {list.map(entry => (
          <div key={entry.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border grid grid-cols-4 gap-4">
            <div><p className="text-gray-600 text-sm">Doctor</p><p className="font-bold">Dr. {entry.doctorName}</p></div>
            <div><p className="text-gray-600 text-sm">Position</p><p className="text-2xl font-bold text-blue-600">#{entry.position}</p></div>
            <div><p className="text-gray-600 text-sm">Status</p><p className="font-bold">Waiting</p></div>
            <button className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600">Leave</button>
          </div>
        ))}
      </div>
    </div>
  )
}
