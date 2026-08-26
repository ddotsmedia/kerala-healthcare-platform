import { useEffect, useState } from 'react';
import { AlertCircle, Clock, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WaitlistNotification({ waitlistId, doctorName, onAccept, onDismiss }) {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onDismiss) onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDismiss]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  async function handleDecline() {
    setDismissing(true);
    try {
      const res = await fetch(`/api/appointments/waitlist/${waitlistId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept: false }),
      });
      if (!res.ok) throw new Error('Failed to decline');
      if (onDismiss) onDismiss();
    } catch (err) {
      console.error('Decline error:', err);
      alert('Error: ' + err.message);
    } finally {
      setDismissing(false);
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border-l-4 border-green-500 bg-white shadow-lg md:left-auto md:right-4 md:w-96">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {doctorName} has an opening!
              </h3>
              <p className="text-sm text-gray-600">
                A slot has opened up for the appointment you're waiting for.
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm text-orange-600">
                <Clock className="h-4 w-4" />
                <span>
                  {hours}h {minutes}m to accept
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDecline}
            disabled={dismissing}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Accept & Book
          </Button>
          <Button
            onClick={handleDecline}
            disabled={dismissing}
            variant="outline"
            className="flex-1"
          >
            {dismissing ? 'Declining...' : 'Decline'}
          </Button>
        </div>

        <div className="mt-3 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
          <p>
            Accepting this offer will automatically book the appointment.
            You can always reschedule or cancel later.
          </p>
        </div>
      </div>
    </div>
  );
}
