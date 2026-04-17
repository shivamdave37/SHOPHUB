import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { demoUsers, loginDemoUser } = useAuth();
  const [form, setForm] = useState({ emailOrName: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    try {
      loginDemoUser(form);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="mx-auto max-w-md card p-6">
      <h1 className="text-3xl font-bold text-slate-900">Login</h1>
      <p className="mt-2 text-sm text-slate-500">
        Demo login is quick: use a saved email or username, and password is optional for testing.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          className="input"
          placeholder="Email or username"
          value={form.emailOrName}
          onChange={(event) => setForm({ ...form, emailOrName: event.target.value })}
        />
        <input
          className="input"
          placeholder="Password (optional for demo users)"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quick Demo Accounts</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            {demoUsers.map((demoUser) => (
              <button
                key={demoUser.id}
                type="button"
                onClick={() => setForm({ emailOrName: demoUser.email, password: demoUser.password })}
                className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-left shadow-sm transition hover:bg-slate-100"
              >
                <span>{demoUser.name}</span>
                <span className="text-xs uppercase tracking-wide text-slate-400">{demoUser.role}</span>
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-secondary w-full" type="submit">
          Login
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        New user? <Link to="/register" className="font-medium text-slate-900">Create an account</Link>
      </p>
    </div>
  );
}
