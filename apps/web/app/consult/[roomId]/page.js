// /consult/[roomId] — online consultation room placeholder.
// Video embed (Jitsi/Daily.co) is deferred to Phase 5; for now show the room
// code and a manual join link. Room ids are generated at booking time for
// video-mode appointments (services/appointments).

export const dynamic = 'force-dynamic';

export async function generateMetadata(props) {
  const params = await props.params;
  return { title: `Consultation room ${String(params.roomId).slice(0, 8)}` };
}

export default async function ConsultRoom(props) {
  const params = await props.params;
  const room = params.roomId;
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-5 px-4 text-center">
      <h1 className="text-2xl font-bold text-brand">Consultation room</h1>
      <p className="text-sm text-gray-600">
        Share this room code with your provider to start the consultation.
      </p>
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">Room code</p>
        <p className="mt-1 break-all font-mono text-lg">{room}</p>
      </div>
      <a href={`#${room}`} className="rounded-lg bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark">
        Join consultation
      </a>
      <p className="max-w-sm text-xs text-gray-400">
        Video calling is coming soon. This information is for general awareness only and is not a
        medical diagnosis. In an emergency call 112 or ambulance 108.
      </p>
    </div>
  );
}
