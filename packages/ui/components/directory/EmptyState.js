// EmptyState.js — neutral empty/no-results placeholder.

export default function EmptyState({ message }) {
  return (
    <p className="py-8 text-center text-sm text-gray-500">{message}</p>
  );
}
