'use client'
import { useState, useEffect } from 'react'
export default function LabReports() {
  const [reports, setReports] = useState([])
  useEffect(() => { fetch('/api/health/lab-reports').then(r => r.json()).then(setReports) }, [])
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lab Reports</h1>
        <label className="px-6 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
          📤 Upload
          <input type="file" className="hidden" accept="pdf,image/*" />
        </label>
      </div>
      <div className="space-y-3">
        {reports.map(r => (
          <div key={r.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border grid grid-cols-4 gap-4 text-sm cursor-pointer hover:shadow">
            <div><p className="text-gray-600">Test</p><p className="font-bold">{r.testName}</p></div>
            <div><p className="text-gray-600">Lab</p><p className="font-bold">{r.labName}</p></div>
            <div><p className="text-gray-600">Date</p><p className="font-bold">{r.testDate}</p></div>
            <div><p className={`px-2 py-1 rounded text-xs w-fit ${r.status === 'normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}
