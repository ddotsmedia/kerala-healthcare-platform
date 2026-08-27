'use client'
import { useState, useEffect } from 'react'

export default function LabReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/health/lab-reports')
      .then(r => r.json())
      .then(d => setReports(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/health/lab-reports', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setReports([data.report, ...reports])
        alert('Report uploaded successfully!')
      }
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status) => {
    const styles = {
      normal: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      abnormal: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    }
    return styles[status] || styles.pending
  }

  const getStatusEmoji = (status) => {
    return { normal: '✅', abnormal: '⚠️', pending: '⏳' }[status] || '❓'
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📋 Lab Reports</h1>
          <p className="text-gray-600 text-sm mt-1">Digital repository of all your test results</p>
        </div>
        <label className="px-6 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 font-medium text-sm transition">
          📤 {uploading ? 'Uploading...' : 'Upload Report'}
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </label>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedReport.test_name}</h2>
              <button onClick={() => setSelectedReport(null)} className="text-2xl">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Lab:</span> {selectedReport.lab_name}</p>
              <p><span className="font-medium">Date:</span> {new Date(selectedReport.test_date).toLocaleDateString('en-IN')}</p>
              <p><span className="font-medium">Normal Range:</span> {selectedReport.normal_range}</p>
              {selectedReport.results && (
                <div>
                  <p className="font-medium mb-2">Results:</p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedReport.results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            {selectedReport.file_url && (
              <a href={selectedReport.file_url} target="_blank" rel="noopener noreferrer" className="mt-4 block px-4 py-2 bg-blue-500 text-white rounded text-center hover:bg-blue-600">
                📥 Download PDF
              </a>
            )}
          </div>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">No lab reports yet</p>
          <p className="text-gray-500 text-sm mt-1">Upload your first report to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <div
              key={r.id}
              onClick={() => setSelectedReport(r)}
              className="bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 grid grid-cols-1 md:grid-cols-5 gap-4 cursor-pointer hover:shadow-lg transition"
            >
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">Test</p>
                <p className="font-bold text-sm mt-1">{r.test_name}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">Lab</p>
                <p className="font-bold text-sm mt-1">{r.lab_name}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">Date</p>
                <p className="font-bold text-sm mt-1">{new Date(r.test_date).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium uppercase">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${getStatusColor(r.status)}`}>
                  {getStatusEmoji(r.status)} {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-end">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">→</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
