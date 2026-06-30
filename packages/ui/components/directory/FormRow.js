// FormRow.js — labelled form control wrapper for edit forms.

export default function FormRow({ label, htmlFor, hint, children }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {hint && <span className="ml-2 text-xs text-gray-400">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}
