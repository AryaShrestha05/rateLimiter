export default function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-zinc-400 tracking-wide">
          {label}
        </label>
      )}
      <input
        {...props}
        className={[
          'w-full bg-zinc-800 border rounded-lg px-3.5 py-2.5 text-sm text-zinc-100',
          'placeholder:text-zinc-600 outline-none transition-all',
          'focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-500/60 focus:ring-red-500/30'
            : 'border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500/20',
        ].join(' ')}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
