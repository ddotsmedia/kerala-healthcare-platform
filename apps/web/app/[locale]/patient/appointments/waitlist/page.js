import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { WaitlistDashboard } from '@/components/appointments/WaitlistDashboard';

export const metadata = {
  title: 'Waiting Lists — MalayaliDoctor',
  description: 'Manage your appointment waiting lists',
};

export default async function WaitlistPage({ params }) {
  const session = await getSession();

  if (!session) {
    redirect(`/${params.locale}/auth/login?from=/patient/appointments/waitlist`);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Waiting Lists</h1>
          <p className="mt-2 text-gray-600">
            Get notified when a slot opens up for appointments you're waiting for.
          </p>
        </div>

        <WaitlistDashboard />
      </div>
    </div>
  );
}
