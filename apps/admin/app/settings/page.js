'use client'
import { useEffect, useState } from 'react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({})
  const [changed, setChanged] = useState({})

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(setSettings)
  }, [])

  const handleChange = (key, value) => {
    setSettings({...settings, [key]: value})
    setChanged({...changed, [key]: true})
  }

  const handleSave = () => {
    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({settings, changed})
    })
      .then(() => {
        alert('Settings saved!')
        setChanged({})
      })
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">System Settings</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border space-y-6">
        <div className="space-y-2">
          <label className="block font-medium text-sm">Site Name</label>
          <input
            type="text"
            value={settings.siteName || ''}
            onChange={(e) => handleChange('siteName', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-sm">Support Email</label>
          <input
            type="email"
            value={settings.supportEmail || ''}
            onChange={(e) => handleChange('supportEmail', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-sm">Appointment Fee (%)</label>
          <input
            type="number"
            value={settings.appointmentFee || ''}
            onChange={(e) => handleChange('appointmentFee', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 text-sm"
          />
        </div>

        <div className="space-y-3">
          <label className="block font-medium text-sm">Feature Flags</label>
          {['gamification', 'notifications', 'telehealth'].map(flag => (
            <label key={flag} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings[flag] || false}
                onChange={(e) => handleChange(flag, e.target.checked)}
                className="rounded"
              />
              <span className="capitalize">{flag.replace('_', ' ')}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}
