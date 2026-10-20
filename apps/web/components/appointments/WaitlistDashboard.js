'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function WaitlistDashboard() {
  const [waitlists, setWaitlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWaitlists();
    const interval = setInterval(fetchWaitlists, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchWaitlists() {
    try {
      const res = await fetch('/api/appointments/waitlist');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setWaitlists(data.waitlists || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id) {
    if (!confirm('Remove from waitlist?')) return;

    try {
      const res = await fetch(`/api/appointments/waitlist/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove');
      setWaitlists(waitlists.filter(w => w.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handleAccept(id) {
    try {
      const res = await fetch(`/api/appointments/waitlist/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to book');
      }

      const data = await res.json();
      if (data.appointmentId) {
        alert('Appointment booked! Redirecting...');
        window.location.href = `/appointments/${data.appointmentId}`;
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="animate-spin">⏳</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (waitlists.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <span className="mx-auto mb-2 text-4xl">🕐</span>
        <p className="text-gray-600">No active waitlists</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {waitlists.map(w => (
        <div
          key={w.id}
          className={`rounded-lg border p-4 ${
            w.status === 'offered' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                <Link href={`/doctors/${w.doctor_slug}`} className="hover:text-blue-600">
                  Dr. {w.doctor_name}
                </Link>
              </h3>
              <p className="text-sm text-gray-500">{w.specialty_name}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              w.status === 'offered'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {w.status === 'offered' ? '🎉 Offer available' : `Position #${w.position}`}
            </span>
          </div>

          <div className="mb-4 text-sm">
            <p className="text-gray-600">
              Date: <span className="font-medium">{new Date(w.appointment_date).toLocaleDateString()}</span>
            </p>
            <p className="text-gray-600">
              Mode: <span className="font-medium capitalize">{w.consultation_mode}</span>
            </p>
            {w.offered_at && (
              <p className="text-xs text-gray-500 mt-1">
                Offer expires: {new Date(new Date(w.offered_at).getTime() + 24*60*60*1000).toLocaleString()}
              </p>
            )}
          </div>

          {w.status === 'offered' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(w.id)}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
              >
                <span className="mr-1">✓</span>
                Accept Offer (Book Now)
              </button>
              <button
                onClick={() => handleRemove(w.id)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50"
              >
                Decline
              </button>
            </div>
          )}

          {w.status === 'waiting' && (
            <button
              onClick={() => handleRemove(w.id)}
              className="w-full px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50"
            >
              <span className="mr-1">🗑️</span>
              Cancel Waitlist
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
