// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { signup } from '../api.js';

// export default function Register() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const { token } = await signup(username, password);
//       localStorage.setItem('token', token);
//       navigate('/');
//     } catch (e) { setError(e.message); }
//   };

//   return (
//     <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
//       <h1 className="text-xl font-semibold mb-2">Create account</h1>
//       <form onSubmit={onSubmit} className="space-y-3">
//         <input className="w-full border p-2 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
//         <input className="w-full border p-2 rounded" placeholder="Password (min 6 chars)" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
//         {error && <div className="text-red-600 text-sm">{error}</div>}
//         <button className="w-full bg-indigo-600 text-white py-2 rounded">Sign up</button>
//       </form>
//       <p className="text-sm mt-3">Have an account? <Link to="/login" className="text-indigo-600">Log in</Link></p>
//     </div>
//   );
// }


import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api.js';
import './Register.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [capsOn, setCapsOn]       = useState(false);
  const [accept, setAccept]       = useState(false);
  const [busy, setBusy]           = useState(false);
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  function onPwKey(e) {
    const caps = e.getModifierState && e.getModifierState('CapsLock');
    setCapsOn(!!caps);
  }

  // Simple password strength: 0–4
  const strength = useMemo(() => {
    let s = 0;
    if (password.length >= 6) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const usernameValid = username.trim().length > 0;
  const pwValid       = password.length >= 6;
  const matchValid    = confirm === password && pwValid;
  const canSubmit     = usernameValid && matchValid && accept && !busy;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setBusy(true);
    try {
      const { token } = await signup(username.trim(), password);
      localStorage.setItem('token', token);
      navigate('/');
    } catch (e) {
      setError(e?.message || 'Sign up failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rg-card max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="rg-logo" aria-hidden>🆕</div>
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">Create account</h1>
          <p className="text-xs text-gray-500">Sign up to get started</p>
        </div>
      </div>

      {error && (
        <div className="rg-alert" role="alert">
          <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
            <path fill="currentColor" d="M10 2a8 8 0 1 0 8 8A8.01 8.01 0 0 0 10 2Zm1 12H9v-2h2Zm0-3H9V6h2Z"/>
          </svg>
          <span className="sr-only">Error:</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Username */}
        <label className="rg-field">
          <span className="rg-label">Username</span>
          <div className={`rg-input ${username && !usernameValid ? 'is-invalid' : ''}`}>
            <span className="rg-input__icon" aria-hidden>👤</span>
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
            />
          </div>
        </label>

        {/* Password */}
        <label className="rg-field">
          <span className="rg-label">Password <span className="rg-hint-inline">(min 6 chars)</span></span>
          <div className={`rg-input ${password && !pwValid ? 'is-invalid' : ''}`}>
            <span className="rg-input__icon" aria-hidden>🔑</span>
            <input
              type={showPw ? 'text' : 'password'}
              name="new-password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={onPwKey}
              onKeyDown={onPwKey}
              disabled={busy}
              required
              aria-invalid={password && !pwValid}
            />
            <button
              type="button"
              className="rg-eye"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              disabled={busy}
            >
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Strength meter */}
          <div className="rg-strength" aria-hidden>
            {[0,1,2,3].map((i) => (
              <span
                key={i}
                className={`rg-strength__bar ${strength > i ? `s-${strength}` : ''}`}
              />
            ))}
          </div>
          <div className="rg-strength__label">
            {password ? (
              strength <= 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'
            ) : 'Enter a password'}
          </div>

          {capsOn && <div className="rg-hint mt-1">Caps Lock is ON</div>}
        </label>

        {/* Confirm password */}
        <label className="rg-field">
          <span className="rg-label">Confirm password</span>
          <div className={`rg-input ${confirm && !matchValid ? 'is-invalid' : ''}`}>
            <span className="rg-input__icon" aria-hidden>✅</span>
            <input
              type={showPw ? 'text' : 'password'}
              name="confirm-password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={busy}
              required
              aria-invalid={confirm && !matchValid}
            />
          </div>
          {confirm && !matchValid && (
            <div className="rg-hint rg-hint--error">Passwords don’t match</div>
          )}
        </label>

        {/* Terms */}
        <label className="rg-check">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            disabled={busy}
            required
          />
          <span>I agree to the <Link to="/terms" className="rg-link">Terms</Link> and <Link to="/privacy" className="rg-link">Privacy Policy</Link></span>
        </label>

        {/* Submit */}
        <button type="submit" className="rg-btn rg-btn--primary w-full" disabled={!canSubmit}>
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <span className="rg-spinner" aria-hidden />
              Creating account…
            </span>
          ) : (
            'Sign up'
          )}
        </button>
      </form>

      <p className="text-sm mt-4 text-center">
        Have an account? <Link to="/login" className="rg-link">Log in</Link>
      </p>
    </div>
  );
}
