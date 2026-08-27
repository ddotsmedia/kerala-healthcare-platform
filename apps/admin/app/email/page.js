'use client'
import { useEffect, useState } from 'react'

export default function EmailManagement() {
  const [form, setForm] = useState({
    subject: '',
    body: '',
    target: 'all_users'
  })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/email/history')
      .then(r => r.json())
      .then(setHistory)
      .finally(() => setLoading(false))
  }, [])

  const handleSend = () => {
    fetch('/api/admin/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(r => r.json())
      .then(data => {
        alert('Email sent to ' + data.count + ' recipients')
        setForm({ subject: '', body: '', target: 'all_users' })
        location.reload()
      })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Email Management</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-bold">Send Email</h2>
          <select
            value={form.target}
            onChange={(e) => setForm({...form, target: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          >
            <option value="all_users">All Users</option>
            <option value="doctors">Doctors Only</option>
            <option value="patients">Patients Only</option>
          </select>
          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({...form, subject: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <textarea
            placeholder="Email body"
            value={form.body}
            onChange={(e) => setForm({...form, body: e.target.value})}
            rows="6"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <button
            onClick={handleSend}
            className="w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
          >
            Send Email
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border space-y-4">
          <h2 className="text-xl font-bold">Recent Emails</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history.map(s => (
              <div key={s.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-700 text-xs">
                <p className="font-medium">{s.subject}</p>
                <p className="text-gray-500">{s.target}</p>
                <p className="text-green-600">✓ {s.delivered}/{s.total}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
