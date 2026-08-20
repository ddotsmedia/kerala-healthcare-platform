// Publications & Awards editor — doctor manages what appears on their profile.

import Link from 'next/link';
import { EmptyState } from '@khp/ui';
import { currentDoctorId } from '@/lib/profile';
import { listPublications, listAwards } from '@/lib/publications';
import { addPublicationAction, deletePublicationAction, addAwardAction, deleteAwardAction } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Publications & awards · KHP Portal' };

const PUB_TYPES = ['paper', 'book', 'chapter', 'case_report', 'poster'];
const inputCls = 'rounded-lg border border-gray-300 px-3 py-2 text-sm';

export default async function PublicationsPage() {
  const id = await currentDoctorId();
  if (!id) return <EmptyState message="Sign in as a doctor to manage publications." />;
  const [pubs, awards] = await Promise.all([listPublications(id), listAwards(id)]);

  return (
    <div className="space-y-8">
      <nav className="text-xs text-gray-500"><Link href="/profile" className="hover:text-brand">Profile</Link> › Publications &amp; awards</nav>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Publications</h2>
        {pubs.length === 0 ? <EmptyState message="No publications yet." /> : (
          <ul className="space-y-2">
            {pubs.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{p.title}</p>
                  <p className="text-xs text-gray-500">{[p.journal, p.year, p.type].filter(Boolean).join(' · ')}{p.doi ? ` · DOI: ${p.doi}` : ''}</p>
                </div>
                <form action={deletePublicationAction}><input type="hidden" name="id" value={p.id} /><button className="text-gray-400 hover:text-red-500" aria-label="Delete">✕</button></form>
              </li>
            ))}
          </ul>
        )}
        <form action={addPublicationAction} className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
          <input name="title" required placeholder="Title" className={`${inputCls} sm:col-span-2`} />
          <input name="journal" placeholder="Journal" className={inputCls} />
          <input name="year" type="number" placeholder="Year" className={inputCls} />
          <input name="doi" placeholder="DOI (10.xxxx/…)" className={inputCls} />
          <input name="pubmedId" placeholder="PubMed ID" className={inputCls} />
          <input name="url" placeholder="URL" className={inputCls} />
          <select name="type" className={inputCls}>{PUB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Add publication</button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Awards</h2>
        {awards.length === 0 ? <EmptyState message="No awards yet." /> : (
          <ul className="space-y-2">
            {awards.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm">
                <div>
                  <p className="font-medium text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-500">{[a.awarded_by, a.year].filter(Boolean).join(' · ')}</p>
                  {a.description ? <p className="mt-1 text-gray-600">{a.description}</p> : null}
                </div>
                <form action={deleteAwardAction}><input type="hidden" name="id" value={a.id} /><button className="text-gray-400 hover:text-red-500" aria-label="Delete">✕</button></form>
              </li>
            ))}
          </ul>
        )}
        <form action={addAwardAction} className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-2">
          <input name="title" required placeholder="Award title" className={`${inputCls} sm:col-span-2`} />
          <input name="awardedBy" placeholder="Awarded by" className={inputCls} />
          <input name="year" type="number" placeholder="Year" className={inputCls} />
          <input name="description" placeholder="Description" className={`${inputCls} sm:col-span-2`} />
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white sm:col-span-2">Add award</button>
        </form>
      </section>
    </div>
  );
}
