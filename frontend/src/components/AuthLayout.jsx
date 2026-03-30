const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
    <div className="w-full max-w-sm">
      {/* Logo / brand */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
            Rate Limiter
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl shadow-black/40">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
