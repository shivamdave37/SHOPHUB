import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      login(data.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md card p-6">
      <h1 className="text-3xl font-bold text-slate-900">Login</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
