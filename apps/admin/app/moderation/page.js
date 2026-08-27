'use client'
import { useEffect, useState } from 'react'

export default function ContentModeration() {
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetch(/api/admin/moderation?status=\)
      .then(r => r.json())
      .then(setReports)
  }, [filter])

  const handleApprove = (reportId) => {
    fetch(/api/admin/moderation/\/approve, { method: 'POST' })
      .then(() => setReports(reports.filter(r => r.id !== reportId)))
  }

  const handleDelete = (reportId, contentId) => {
    fetch(/api/admin/moderation/\/delete, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId })
    })
      .then(() => setReports(reports.filter(r => r.id !== reportId)))
  }

  const handleWarn = (reportId, userId) => {
    fetch(/api/admin/moderation/\/warn, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
      .then(() => setReports(reports.filter(r => r.id !== reportId)))
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Content Moderation</h1>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="px-4 py-2 border rounded-lg dark:bg-gray-800"
      >
        <option value="pending">Pending ({reports.filter(r => r.status === 'pending').length})</option>
        <option value="resolved">Resolved</option>
        <option value="all">All Reports</option>
      </select>

      <div className="space-y-4">
        {reports.map(r => (
          <div key={r.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Reported By</p>
                <p className="font-medium">{r.reporter_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium">{r.content_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Reason</p>
                <p className="font-medium">{r.reason}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded mb-4 text-sm">
              <p className="line-clamp-2">{r.content}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => handleApprove(r.id)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleWarn(r.id, r.user_id)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Warn User
              </button>
              <button
                onClick={() => handleDelete(r.id, r.content_id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
