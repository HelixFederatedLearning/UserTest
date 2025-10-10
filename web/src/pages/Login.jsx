// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { login } from '../api.js';

// export default function Login() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const { token } = await login(username, password);
//       localStorage.setItem('token', token);
//       navigate('/');
//     } catch (e) { setError(e.message); }
//   };

//   return (
//     <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
//       <h1 className="text-xl font-semibold mb-2">Login</h1>
//       <form onSubmit={onSubmit} className="space-y-3">
//         <input className="w-full border p-2 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
//         <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
//         {error && <div className="text-red-600 text-sm">{error}</div>}
//         <button className="w-full bg-indigo-600 text-white py-2 rounded">Sign in</button>
//       </form>
//       <p className="text-sm mt-3">No account? <Link to="/register" className="text-indigo-600">Sign up</Link></p>
//     </div>
//   );
// }

import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api.js';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const pwRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setError('');
    setBusy(true);
    try {
      const { token } = await login(username.trim(), password);
      localStorage.setItem('token', token);
      navigate('/');
    } catch (e) {
      setError(e?.message || 'Sign in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  function onPwKey(event) {
    // Inform about Caps Lock (helpful on desktops)
    const caps = event.getModifierState && event.getModifierState('CapsLock');
    setCapsOn(!!caps);
  }

  const canSubmit = username.trim().length > 0 && password.length > 0 && !busy;

  return (
    <div className="lg-card max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="lg-logo" aria-hidden>🔒</div>
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">Welcome back</h1>
          <p className="text-xs text-gray-500">Sign in to continue</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="lg-alert" role="alert">
          <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
            <path fill="currentColor" d="M10 2a8 8 0 1 0 8 8A8.01 8.01 0 0 0 10 2Zm1 12H9v-2h2Zm0-3H9V6h2Z"/>
          </svg>
          <span className="sr-only">Error:</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Username */}
        <label className="lg-field">
          <span className="lg-label">Username</span>
          <div className="lg-input">
            <span className="lg-input__icon" aria-hidden>👤</span>
            <input
              type="text"
              name="username"
              inputMode="text"
              autoComplete="username"
              placeholder="your.username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={busy}
              required
              aria-invalid={!!error}
            />
          </div>
        </label>

        {/* Password */}
        <label className="lg-field">
          <span className="lg-label">Password</span>
          <div className="lg-input">
            <span className="lg-input__icon" aria-hidden>🔑</span>
            <input
              ref={pwRef}
              type={showPw ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={onPwKey}
              onKeyDown={onPwKey}
              disabled={busy}
              required
              aria-invalid={!!error}
            />
            <button
              type="button"
              className="lg-eye"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              disabled={busy}
            >
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
          {capsOn && (
            <div className="lg-hint" role="status">Caps Lock is ON</div>
          )}
        </label>

        {/* Extras */}
        <div className="flex items-center justify-between">
          <label className="lg-check">
            <input type="checkbox" disabled={busy} />
            <span>Remember me</span>
          </label>
          <Link to="/reset" className="lg-link">Forgot password?</Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="lg-btn lg-btn--primary w-full"
          disabled={!canSubmit}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <span className="lg-spinner" aria-hidden />
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="text-sm mt-4 text-center">
        No account?{' '}
        <Link to="/register" className="lg-link">Sign up</Link>
      </p>
    </div>
  );
}
