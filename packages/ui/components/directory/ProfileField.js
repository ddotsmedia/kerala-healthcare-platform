// ProfileField.js — read-only labelled value row for profile displays.

export default function ProfileField({ label, value, children }) {
  if (value == null && !children) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-100 py-2">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{children || value}</span>
    </div>
  );
}
