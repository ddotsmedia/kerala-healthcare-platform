'use client'
import { useEffect, useState } from 'react'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(/api/admin/users?search=&filter=)
      .then(r => r.json())
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [search, filter])

  const handleBanUser = (userId) => {
    fetch(/api/admin/users/\/ban, { method: 'POST' })
      .then(() => setUsers(users.map(u => u.id === userId ? {...u, banned: true} : u)))
  }

  const handleApproveUser = (userId) => {
    fetch(/api/admin/users/\/approve, { method: 'POST' })
      .then(() => setUsers(users.map(u => u.id === userId ? {...u, approved: true} : u)))
  }

  const handleExport = () => {
    fetch('/api/admin/users/export')
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'users.csv'
        a.click()
      })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button onClick={handleExport} className="px-4 py-2 bg-green-500 text-white rounded">Export CSV</button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="pending">Pending Approval</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-4">{u.full_name}</td>
                <td className="p-4 text-xs">{u.email}</td>
                <td className="p-4"><span className={px-2 py-1 rounded text-white text-xs \}>{u.role}</span></td>
                <td className="p-4"><span className={px-2 py-1 rounded text-xs \}>{u.banned ? 'Banned' : u.approved ? 'Active' : 'Pending'}</span></td>
                <td className="p-4 space-x-2 text-xs">
                  {!u.approved && <button onClick={() => handleApproveUser(u.id)} className="px-2 py-1 bg-green-500 text-white rounded">Approve</button>}
                  {!u.banned && <button onClick={() => handleBanUser(u.id)} className="px-2 py-1 bg-red-500 text-white rounded">Ban</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
