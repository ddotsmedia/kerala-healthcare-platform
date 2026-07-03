'use client';

// ReviewsSection — summary + review list + load-more + collapsible write form.
import { useState } from 'react';
import RatingSummary from './RatingSummary.js';
import ReviewCard from './ReviewCard.js';
import WriteReviewForm from './WriteReviewForm.js';

const PAGE_SIZE = 10;

export default function ReviewsSection({ entityType, entityId, locale = 'ml', initialReviews = [], summary, loginPath }) {
  const ml = locale === 'ml';
  const [reviews, setReviews] = useState(initialReviews);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialReviews.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const next = page + 1;
      const r = await fetch(`/api/reviews?entity_type=${entityType}&entity_id=${entityId}&page=${next}`);
      const j = await r.json();
      const more = Array.isArray(j.data) ? j.data : [];
      setReviews((prev) => [...prev, ...more]);
      setPage(next);
      setHasMore(more.length === PAGE_SIZE);
    } catch { setHasMore(false); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <RatingSummary summary={summary} locale={locale} />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">{ml ? 'റിവ്യൂകൾ' : 'Reviews'}</h3>
        <button type="button" onClick={() => setShowForm((s) => !s)}
          className="rounded-lg border border-brand px-3 py-1.5 text-sm font-semibold text-brand hover:bg-teal-50">
          {showForm ? (ml ? 'അടയ്ക്കുക' : 'Close') : (ml ? 'റിവ്യൂ എഴുതുക' : 'Write a Review')}
        </button>
      </div>

      {showForm && (
        <WriteReviewForm entityType={entityType} entityId={entityId} locale={locale} loginPath={loginPath}
          onSubmitted={() => setShowForm(false)} />
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">{ml ? 'ആദ്യ റിവ്യൂ എഴുതൂ!' : 'Be the first to write a review!'}</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((rv) => <ReviewCard key={rv.id} review={rv} locale={locale} />)}
        </div>
      )}

      {hasMore && (
        <button type="button" onClick={loadMore} disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand disabled:opacity-60">
          {loading ? (ml ? 'ലോഡ് ചെയ്യുന്നു…' : 'Loading…') : (ml ? 'കൂടുതൽ കാണിക്കുക' : 'Load more')}
        </button>
      )}

      <p className="text-xs text-gray-400">{ml ? 'റിവ്യൂകൾ പ്രസിദ്ധീകരണത്തിന് മുൻപ് പരിശോധിക്കപ്പെടും.' : 'Reviews are moderated before publication.'}</p>
    </div>
  );
}
