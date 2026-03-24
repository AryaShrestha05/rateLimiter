import { useState } from 'react';
import { api } from '../api';
import Button from '../components/Button';

export default function Dashboard({ user, onLogout }) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await api.logout();
    } catch (_) {}
    onLogout();
  }

  const initial = (user.name || user.email)?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Avatar + greeting */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 text-xl font-semibold text-zinc-100 mb-4">
            {initial}
          </div>
          <h1 className="text-lg font-semibold text-zinc-100">
            {user.name ? `Hey, ${user.name}` : 'You\'re in'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{user.email}</p>
        </div>

        {/* Info card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800 mb-4 shadow-xl shadow-black/40">
          <Row label="User ID" value={user.id} mono />
          <Row label="Plan" value={user.plan ?? 'free'} badge />
          <Row
            label="Member since"
            value={new Date(user.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            })}
          />
        </div>

        {/* Session status */}
        <div className="flex items-center gap-2 px-1 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          <span className="text-xs text-zinc-500">Session active · stored in Postgres</span>
        </div>

        <Button variant="ghost" loading={loading} onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono, badge }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <span className="text-xs text-zinc-500 shrink-0">{label}</span>
      {badge ? (
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {value}
        </span>
      ) : (
        <span className={`text-sm text-zinc-300 truncate text-right ${mono ? 'font-mono text-xs text-zinc-400' : ''}`}>
          {value}
        </span>
      )}
    </div>
  );
}
