import { useState, useEffect } from 'react';
import { api } from '../api';
import Button from '../components/Button';

const Row = ({ label, value, mono, badge }) => (
  <div className="flex items-center justify-between px-5 py-3.5 gap-4">
    <span className="text-xs text-zinc-500 shrink-0">{label}</span>
    {badge ? (
      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        {value}
      </span>
    ) : (
      <span
        className={`text-sm text-zinc-300 truncate text-right ${mono ? 'font-mono text-xs text-zinc-400' : ''}`}
      >
        {value}
      </span>
    )}
  </div>
);

const Dashboard = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  // tracks which key id was just copied, so we can show "Copied!" feedback
  const [copiedId, setCopiedId] = useState(null);
  // tracks which key id is currently being deleted
  const [deletingId, setDeletingId] = useState(null);

  // fetch the user's api keys when the dashboard first loads
  useEffect(() => {
    api.getKeys()
      .then(data => setKeys(data))
      .catch(() => {})
      .finally(() => setKeysLoading(false));
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    onLogout();
  };

  const handleCreateKey = async () => {
    setCreating(true);
    try {
      const newKey = await api.createKey();
      // add the new key to the top of the list
      setKeys(prev => [newKey, ...prev]);
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id) => {
    setDeletingId(id);
    try {
      await api.deleteKey(id);
      // remove it from local state so the UI updates instantly
      setKeys(prev => prev.filter(k => k.id !== id));
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    // reset "Copied!" back to "Copy" after 2 seconds
    setTimeout(() => setCopiedId(null), 2000);
  };

  // show first 10 chars then mask the rest: rk_abc12345••••••••
  const maskKey = (key) => key.slice(0, 10) + '•'.repeat(10);

  const initial = (user.name || user.email)?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center p-4 pt-12">
      <div className="w-full max-w-sm">
        {/* Avatar + greeting */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 text-xl font-semibold text-zinc-100 mb-4">
            {initial}
          </div>
          <h1 className="text-lg font-semibold text-zinc-100">
            {user.name ? `Hey, ${user.name}` : "You're in"}
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
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          />
        </div>

        {/* Session status */}
        <div className="flex items-center gap-2 px-1 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          <span className="text-xs text-zinc-500">Session active · stored in Postgres</span>
        </div>

        {/* API Keys section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-zinc-300">API Keys</h2>
            <button
              onClick={handleCreateKey}
              disabled={creating}
              className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Generating...' : '+ Generate new key'}
            </button>
          </div>

          {keysLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-4 h-4 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
            </div>
          ) : keys.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-6 text-center">
              <p className="text-sm text-zinc-500">No keys yet.</p>
              <p className="text-xs text-zinc-600 mt-1">Generate one to start making requests.</p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800 shadow-xl shadow-black/40">
              {keys.map(k => (
                <div key={k.id} className="flex items-center justify-between px-5 py-3.5 gap-3">
                  {/* masked key + name */}
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-xs text-zinc-300 truncate">{maskKey(k.key)}</span>
                    <span className="text-xs text-zinc-600 mt-0.5">{k.name ?? 'Default'}</span>
                  </div>

                  {/* copy + delete buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(k.key, k.id)}
                      className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      {copiedId === k.id ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      disabled={deletingId === k.id}
                      className="text-xs text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors"
                    >
                      {deletingId === k.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button variant="ghost" loading={loading} onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
