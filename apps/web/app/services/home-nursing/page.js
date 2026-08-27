'use client'
import { useState, useEffect } from 'react'

export default function HomeNursing() {
  const [nurses, setNurses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedNurse, setSelectedNurse] = useState(null)
  const [bookingForm, setBookingForm] = useState({ start_date: '', end_date: '', notes: '' })
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    fetch('/api/nursing-services')
      .then(r => r.json())
      .then(d => setNurses(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const handleBook = async () => {
    if (!bookingForm.start_date || !bookingForm.end_date) {
      alert('Please select dates')
      return
    }

    try {
      const res = await fetch('/api/nursing-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nurse_id: selectedNurse.id,
          start_date: bookingForm.start_date,
          end_date: bookingForm.end_date,
          notes: bookingForm.notes
        })
      })

      if (res.ok) {
        const data = await res.json()
        setBooking(data.booking)
        alert('✅ Booking request sent! You will receive confirmation shortly.')
        setSelectedNurse(null)
      }
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const filteredNurses = nurses.filter(n => {
    if (filter === 'top') return n.rating >= 4.5
    if (filter === 'experienced') return n.experience_years >= 5
    if (filter === 'affordable') return n.hourly_rate <= 500
    return true
  })

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">👩‍⚕️ Home Nursing Services</h1>
          <p className="text-gray-600 dark:text-gray-400">Professional, qualified nurses for home care</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { value: 'all', label: 'All Nurses' },
            { value: 'top', label: '⭐ Top Rated' },
            { value: 'experienced', label: '📈 5+ Years' },
            { value: 'affordable', label: '💰 ₹500/hr' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition ${
                filter === opt.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selectedNurse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedNurse.name}</h2>
                  <p className="text-gray-600">{selectedNurse.qualification}</p>
                </div>
                <button onClick={() => setSelectedNurse(null)} className="text-2xl">✕</button>
              </div>

              <div className="space-y-4 mb-6 text-sm border-b pb-4">
                <div className="flex justify-between">
                  <span>Experience:</span>
                  <span className="font-bold">{selectedNurse.experience_years} years</span>
                </div>
                <div className="flex justify-between">
                  <span>Hourly Rate:</span>
                  <span className="font-bold">₹{selectedNurse.hourly_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rating:</span>
                  <span className="font-bold">⭐ {selectedNurse.rating}/5</span>
                </div>
                {selectedNurse.languages && (
                  <div>
                    <span>Languages:</span>
                    <p className="font-bold text-xs mt-1">{selectedNurse.languages}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={bookingForm.start_date}
                    onChange={e => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={bookingForm.end_date}
                    onChange={e => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Special Notes (Optional)</label>
                  <textarea
                    rows="3"
                    value={bookingForm.notes}
                    onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="e.g., IV therapy, wound care..."
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  />
                </div>
              </div>

              <button
                onClick={handleBook}
                className="w-full px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600"
              >
                📅 Confirm Booking
              </button>
            </div>
          </div>
        )}

        {filteredNurses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No nurses match your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNurses.map(nurse => (
              <div key={nurse.id} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden hover:shadow-lg transition">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                      👩‍⚕️
                    </div>
                    <div>
                      <p className="font-bold text-lg">{nurse.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{nurse.qualification}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-bold">⭐ {nurse.rating}</span>
                        <span className="text-xs text-gray-500">({nurse.total_bookings} bookings)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Experience</span>
                      <span className="font-bold">{nurse.experience_years} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Hourly Rate</span>
                      <span className="font-bold text-lg">₹{nurse.hourly_rate}</span>
                    </div>
                    {nurse.certifications && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-blue-600 dark:text-blue-400">✓ Certified in: {nurse.certifications}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedNurse(nurse)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition"
                  >
                    📅 Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
