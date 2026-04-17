import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerDemoUser } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (form.password.trim().length < 6) {
      setError('Password must be at least 6 digits or characters long');
      return;
    }

    try {
      registerDemoUser(form);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="mx-auto max-w-md card p-6">
      <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
      <p className="mt-2 text-sm text-slate-500">
        Create a demo account to unlock wishlist, order history, student deals, and alerts.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          className="input"
          placeholder="Full name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
        <input
          className="input"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <p className="-mt-2 text-xs text-slate-500">Password must be at least 6 digits or characters long.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" type="submit">
          Register
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already registered? <Link to="/login" className="font-medium text-slate-900">Login here</Link>
      </p>
    </div>
  );
}
