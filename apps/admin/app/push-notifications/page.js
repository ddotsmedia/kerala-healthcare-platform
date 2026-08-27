'use client'
import { useEffect, useState } from 'react'

export default function PushNotifications() {
  const [form, setForm] = useState({
    title: '',
    body: '',
    target: 'all_users'
  })
  const [history, setHistory] = useState([])

  useEffect(() => {
    fetch('/api/admin/push/history')
      .then(r => r.json())
      .then(setHistory)
  }, [])

  const handleSend = () => {
    fetch('/api/admin/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(r => r.json())
      .then(data => {
        alert('Notification sent to ' + data.sent + ' users')
        setForm({ title: '', body: '', target: 'all_users' })
        location.reload()
      })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Push Notifications</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-bold">Send Notification</h2>

          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm"
          />

          <textarea
            placeholder="Message body"
            value={form.body}
            onChange={(e) => setForm({...form, body: e.target.value})}
            rows="4"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm"
          />

          <select
            value={form.target}
            onChange={(e) => setForm({...form, target: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm"
          >
            <option value="all_users">All Users</option>
            <option value="doctors">Doctors Only</option>
            <option value="patients">Patients Only</option>
          </select>

          <button
            onClick={handleSend}
            className="w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
          >
            Send to {form.target.replace(/_/g, ' ')}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-bold">Recent Notifications</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.map(n => (
              <div key={n.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-700 text-xs">
                <p className="font-medium">{n.title}</p>
                <p className="text-gray-500">{n.target}</p>
                <p className="text-green-600">✓ {n.delivered}/{n.total}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
