export default function SkillChip({ label, matched = true, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        matched
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${matched ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {label}
    </button>
  );
}
