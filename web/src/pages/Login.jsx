import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token } = await login(username, password);
      localStorage.setItem('token', token);
      navigate('/');
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
      <h1 className="text-xl font-semibold mb-2">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full bg-indigo-600 text-white py-2 rounded">Sign in</button>
      </form>
      <p className="text-sm mt-3">No account? <Link to="/register" className="text-indigo-600">Sign up</Link></p>
    </div>
  );
}
