import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, Trash2, CheckCircle } from 'lucide-react';
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
        <Loader2 className="h-6 w-6 animate-spin" />
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
        <Clock className="mx-auto mb-2 h-8 w-8 text-gray-400" />
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
              <Button
                onClick={() => handleAccept(w.id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Accept Offer (Book Now)
              </Button>
              <Button
                onClick={() => handleRemove(w.id)}
                variant="outline"
                className="flex-1"
              >
                Decline
              </Button>
            </div>
          )}

          {w.status === 'waiting' && (
            <Button
              onClick={() => handleRemove(w.id)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Cancel Waitlist
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
