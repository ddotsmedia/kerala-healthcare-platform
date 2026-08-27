'use client'
import { useEffect, useState } from 'react'

export default function AdvancedReports() {
  const [reportType, setReportType] = useState('users')
  const [dateRange, setDateRange] = useState('month')
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(/api/admin/reports/\?range=\)
      .then(r => r.json())
      .then(setData)
  }, [reportType, dateRange])

  const handleExport = (format) => {
    fetch(/api/admin/reports/\/export?format=\&range=\)
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = eport.\
        a.click()
      })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Advanced Reports</h1>

      <div className="flex gap-4">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 text-sm"
        >
          <option value="users">User Report</option>
          <option value="appointments">Appointment Report</option>
          <option value="revenue">Revenue Report</option>
          <option value="doctors">Doctor Performance</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 text-sm"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>

        <button onClick={() => handleExport('csv')} className="px-4 py-2 bg-green-500 text-white rounded text-sm">CSV</button>
        <button onClick={() => handleExport('pdf')} className="px-4 py-2 bg-red-500 text-white rounded text-sm">PDF</button>
      </div>

      {data?.summary && (
        <div className="grid grid-cols-4 gap-4">
          {data.summary.map((item, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-gray-500 text-xs">{item.label}</p>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-green-500 mt-1">{item.change}</p>
            </div>
          ))}
        </div>
      )}

      {data?.table && (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {data.table.headers?.map((h, i) => (
                  <th key={i} className="p-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.table.rows?.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                  {row.map((cell, j) => (
                    <td key={j} className="p-3">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
