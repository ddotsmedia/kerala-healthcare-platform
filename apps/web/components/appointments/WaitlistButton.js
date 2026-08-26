import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Clock } from 'lucide-react';

export function WaitlistButton({ doctorId, appointmentDate, consultationMode, onJoined }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [waitTime, setWaitTime] = useState(null);
  const [error, setError] = useState(null);

  async function handleJoinWaitlist() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/appointments/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          appointmentDate,
          consultationMode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to join waitlist');
      }

      const data = await res.json();
      setPosition(data.position);
      setWaitTime(data.estimatedWaitTime);

      if (onJoined) {
        onJoined(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (position !== null) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">You're on the waitlist!</p>
            <p className="text-green-700">Position: {position}</p>
            <p className="text-xs text-green-600">Est. wait: {waitTime}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full"
      >
        Join Waiting List
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Waiting List</DialogTitle>
            <DialogDescription>
              Be notified when a slot opens up for {new Date(appointmentDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="rounded bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ You'll be notified via SMS and email</p>
              <p>✓ You'll have 24 hours to confirm</p>
              <p>✓ No commitment until you accept</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinWaitlist}
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join Waitlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
