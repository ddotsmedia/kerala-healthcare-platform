'use client'
import { useState, useEffect } from 'react'

export default function LabTestBooking() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTest, setSelectedTest] = useState(null)
  const [bookingForm, setBookingForm] = useState({ collection_date: '', collection_time: '', notes: '' })
  const [cart, setCart] = useState([])

  useEffect(() => {
    fetch('/api/lab-tests')
      .then(r => r.json())
      .then(d => setTests(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const handleBook = async () => {
    if (!bookingForm.collection_date) {
      alert('Please select a collection date')
      return
    }

    try {
      const res = await fetch('/api/lab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: selectedTest.id,
          collection_date: bookingForm.collection_date,
          collection_time: bookingForm.collection_time || '09:00',
          notes: bookingForm.notes
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ Booking confirmed for ₹${data.price}`)
        setCart([...cart, data])
        setSelectedTest(null)
        setBookingForm({ collection_date: '', collection_time: '', notes: '' })
      }
    } catch (error) {
      alert('Booking failed: ' + error.message)
    }
  }

  const totalCost = cart.reduce((sum, item) => sum + (item.price || 0), 0)

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">🧬 Lab Test Booking</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Home collection available for all tests</p>
          </div>
          {cart.length > 0 && (
            <div className="bg-blue-100 dark:bg-blue-900/20 px-4 py-3 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>{cart.length}</strong> tests selected · <strong>₹{totalCost}</strong>
              </p>
            </div>
          )}
        </div>

        {selectedTest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedTest.test_name}</h2>
                <button onClick={() => setSelectedTest(null)} className="text-2xl">✕</button>
              </div>

              <div className="space-y-4 mb-6 text-sm border-b pb-4">
                <p className="text-gray-600">{selectedTest.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-bold">₹{selectedTest.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turnaround:</span>
                    <span className="font-bold">{selectedTest.estimated_turnaround_hours} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sample:</span>
                    <span className="font-bold">{selectedTest.sample_type}</span>
                  </div>
                  {selectedTest.fasting_required && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      <p className="text-yellow-900 dark:text-yellow-200 text-xs font-medium">
                        ⚠️ Fasting required before collection
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Collection Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.collection_date}
                    onChange={e => setBookingForm({ ...bookingForm, collection_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Time</label>
                  <select
                    value={bookingForm.collection_time}
                    onChange={e => setBookingForm({ ...bookingForm, collection_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  >
                    <option value="">Select time slot</option>
                    <option value="07:00">7:00 AM - 8:00 AM</option>
                    <option value="08:00">8:00 AM - 9:00 AM</option>
                    <option value="09:00">9:00 AM - 10:00 AM</option>
                    <option value="10:00">10:00 AM - 11:00 AM</option>
                    <option value="11:00">11:00 AM - 12:00 PM</option>
                    <option value="14:00">2:00 PM - 3:00 PM</option>
                    <option value="15:00">3:00 PM - 4:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Special Instructions</label>
                  <textarea
                    rows="2"
                    value={bookingForm.notes}
                    onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    placeholder="e.g., difficult veins, allergies..."
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  />
                </div>
              </div>

              <button
                onClick={handleBook}
                className="w-full px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600"
              >
                ✓ Add to Cart
              </button>
            </div>
          </div>
        )}

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No tests available</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map(test => (
                <div key={test.id} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden hover:shadow-lg transition">
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg">{test.test_name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{test.test_code}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{test.description}</p>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Price</span>
                        <span className="font-bold text-lg">₹{test.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sample</span>
                        <span className="font-bold">{test.sample_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Result In</span>
                        <span className="font-bold">{test.estimated_turnaround_hours}h</span>
                      </div>
                      {test.fasting_required && (
                        <div className="pt-2 border-t text-yellow-700 dark:text-yellow-300 text-xs font-medium">
                          🕐 Fasting required
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedTest(test)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition"
                    >
                      🛒 Book Test
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 && (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border p-6">
                <h2 className="font-bold text-lg mb-4">Shopping Cart ({cart.length} tests)</h2>
                <div className="space-y-3 mb-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span>{item.test_name}</span>
                      <button
                        onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between items-center mb-4">
                  <span className="font-bold">Total Amount:</span>
                  <span className="text-2xl font-bold">₹{totalCost}</span>
                </div>
                <button className="w-full px-4 py-3 bg-green-500 text-white rounded font-bold hover:bg-green-600">
                  💳 Proceed to Payment
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
