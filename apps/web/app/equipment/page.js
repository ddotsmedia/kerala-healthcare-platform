'use client'
import { useState, useEffect } from 'react'

export default function EquipmentRental() {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [rentalDays, setRentalDays] = useState(7)
  const [rentalForm, setRentalForm] = useState({ rental_start_date: '', rental_end_date: '', delivery_address: '' })

  useEffect(() => {
    fetch('/api/equipment')
      .then(r => r.json())
      .then(d => setEquipment(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  const handleBook = async () => {
    if (!rentalForm.rental_start_date || !rentalForm.rental_end_date || !rentalForm.delivery_address) {
      alert('Please fill all fields')
      return
    }

    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: selectedItem.id,
          rental_start_date: rentalForm.rental_start_date,
          rental_end_date: rentalForm.rental_end_date,
          delivery_address: rentalForm.delivery_address
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ Booking confirmed! Total: ₹${data.total_cost}`)
        setSelectedItem(null)
      }
    } catch (error) {
      alert('Booking failed: ' + error.message)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">🏥 Medical Equipment Rental</h1>
          <p className="text-gray-600 dark:text-gray-400">Affordable rental solutions for home healthcare</p>
        </div>

        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                <button onClick={() => setSelectedItem(null)} className="text-2xl">✕</button>
              </div>

              <div className="space-y-4 mb-6 text-sm border-b pb-4">
                <p className="text-gray-600">{selectedItem.description}</p>
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <span className="font-bold">₹{selectedItem.daily_rental_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stock Available:</span>
                  <span className="font-bold">{selectedItem.stock_available} units</span>
                </div>
                {selectedItem.specifications && (
                  <div className="pt-2">
                    <p className="font-medium text-xs">Specifications:</p>
                    <p className="text-xs mt-1">{selectedItem.specifications}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={rentalForm.rental_start_date}
                    onChange={e => setRentalForm({ ...rentalForm, rental_start_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={rentalForm.rental_end_date}
                    onChange={e => setRentalForm({ ...rentalForm, rental_end_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Address</label>
                  <textarea
                    rows="2"
                    value={rentalForm.delivery_address}
                    onChange={e => setRentalForm({ ...rentalForm, delivery_address: e.target.value })}
                    placeholder="Full address..."
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700"
                  />
                </div>
                {rentalForm.rental_start_date && rentalForm.rental_end_date && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                      Est. Cost: ₹{Math.ceil((new Date(rentalForm.rental_end_date) - new Date(rentalForm.rental_start_date)) / (1000 * 60 * 60 * 24)) * selectedItem.daily_rental_rate}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleBook}
                className="w-full px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600"
              >
                📅 Confirm Rental
              </button>
            </div>
          </div>
        )}

        {equipment.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No equipment available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden hover:shadow-lg transition">
                <div className="p-6 space-y-4">
                  <div className="text-5xl mb-3">{item.emoji || '🏥'}</div>
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Daily Rate</span>
                      <span className="font-bold text-lg">₹{item.daily_rental_rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">In Stock</span>
                      <span className="font-bold">{item.stock_available} units</span>
                    </div>
                    {item.rating && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600 dark:text-gray-400">Rating</span>
                        <span className="font-bold">⭐ {item.rating}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedItem(item)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition"
                  >
                    🛒 Rent Now
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
