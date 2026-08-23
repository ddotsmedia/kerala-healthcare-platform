// Provider verification pipeline — kanban across pending / in_review / verified /
// rejected. Drag to move; approve auto-publishes. Server loads all lanes.

import { redirect } from 'next/navigation';
import { listQueue } from '@/lib/verification';
import { requireAdminRole } from '@/lib/auth';
import KanbanBoard from './KanbanBoard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Verification pipeline · KHP Admin' };

export default async function VerificationQueue() {
  if (!(await requireAdminRole())) redirect('/login');
  const [pending, in_review, verified, rejected] = await Promise.all([
    listQueue('pending'), listQueue('in_review'), listQueue('verified'), listQueue('rejected')
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-ink">Provider verification</h1>
        <p className="text-sm text-ink-soft">Drag providers through the pipeline — approving publishes them.</p>
      </div>
      <KanbanBoard lanes={{ pending, in_review, verified, rejected }} />
    </div>
  );
}
