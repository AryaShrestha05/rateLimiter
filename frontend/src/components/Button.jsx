const Button = ({ children, loading, variant = 'primary', ...props }) => {
  const base =
    'w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-zinc-100 text-zinc-900 hover:bg-white active:scale-[0.98]',
    ghost: 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]}`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
      )}
      {children}
    </button>
  );
};

export default Button;
