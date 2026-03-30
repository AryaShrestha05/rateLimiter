import { useState } from 'react';
import { api } from '../api';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';

const Register = ({ onSuccess, onSwitch }) => {
  const [form, setForm] = useState({ f_name: '', l_name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const updateField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');
    try {
      await api.register(form.f_name, form.l_name, form.email, form.password);
      const data = await api.login(form.email, form.password);
      onSuccess(data.user);
    } catch (err) {
      const data = err?.data;
      if (Array.isArray(data)) {
        const fieldErrors = data.reduce((acc, { path, msg }) => {
          if (path) acc[path] = msg;
          return acc;
        }, {});
        setErrors(fieldErrors);
      } else {
        setServerError(data?.msg || data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-lg font-semibold text-zinc-100 mb-1">Create account</h1>
      <p className="text-sm text-zinc-500 mb-6">Get started for free.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="First Name"
          type="text"
          placeholder="First name"
          value={form.f_name}
          onChange={(e) => updateField('f_name', e.target.value)}
          error={errors.f_name}
          autoFocus
          required
        />
        <Input
          label="Last Name"
          type="text"
          placeholder="Last name"
          value={form.l_name}
          onChange={(e) => updateField('l_name', e.target.value)}
          error={errors.l_name}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min 3 characters"
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          error={errors.password}
          required
        />

        {serverError && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={loading} className="mt-1">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-6">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-zinc-300 hover:text-white transition-colors underline underline-offset-2"
        >
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
};

export default Register;
