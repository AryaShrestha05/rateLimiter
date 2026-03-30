import { useState } from 'react';
import { api } from '../api';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = ({ onSuccess, onSwitch }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login(form.email, form.password);
      onSuccess(data.user);
    } catch (err) {
      setError(
        err?.data?.message ||
        (Array.isArray(err?.data) ? err.data[0]?.msg : null) ||
        'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-lg font-semibold text-zinc-100 mb-1">Sign in</h1>
      <p className="text-sm text-zinc-500 mb-6">Welcome back.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          required
          autoFocus
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••••••"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="mt-1">
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        No account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2"
        >
          Register
        </button>
      </p>
    </AuthLayout>
  );
};

export default Login;
