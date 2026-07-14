'use client';

// NewsAutoRefresh.js — refresh the server feed every 5 min (no polling library).
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const FIVE_MIN_MS = 5 * 60 * 1000;

export default function NewsAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const id = window.setInterval(() => router.refresh(), FIVE_MIN_MS);
    return () => window.clearInterval(id);
  }, [router]);
  return null;
}
