import { useState, useEffect } from 'react';
import { api } from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me()
      .then(data => setUser(data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={() => setUser(null)} />;
  }

  if (page === 'register') {
    return <Register onSuccess={setUser} onSwitch={() => setPage('login')} />;
  }

  return <Login onSuccess={setUser} onSwitch={() => setPage('register')} />;
}
