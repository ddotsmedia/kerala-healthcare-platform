'use client'
import { useEffect, useState } from 'react'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(/api/admin/audit?type=\&search=\)
      .then(r => r.json())
      .then(setLogs)
  }, [filter, search])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Audit Logs</h1>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 text-sm"
        >
          <option value="all">All Actions</option>
          <option value="user_created">User Created</option>
          <option value="user_deleted">User Deleted</option>
          <option value="doctor_verified">Doctor Verified</option>
          <option value="content_deleted">Content Deleted</option>
          <option value="settings_changed">Settings Changed</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Admin</th>
              <th className="p-3 text-left">Target</th>
              <th className="p-3 text-left">Details</th>
              <th className="p-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{log.action}</span></td>
                <td className="p-3">{log.admin_name}</td>
                <td className="p-3">{log.target_name}</td>
                <td className="p-3 text-gray-500 truncate">{log.details}</td>
                <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
