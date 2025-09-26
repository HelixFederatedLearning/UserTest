const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function signup(username, password) {
  const r = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!r.ok) throw new Error((await r.json()).error || 'Signup failed');
  return r.json();
}

export async function login(username, password) {
  const r = await fetch(`${API_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!r.ok) throw new Error((await r.json()).error || 'Login failed');
  return r.json();
}

export async function uploadImages(files, consent) {
  const fd = new FormData();
  Array.from(files).forEach(f => fd.append('images', f));
  fd.append('consent', String(consent));
  const r = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: fd
  });
  if (!r.ok) throw new Error((await r.json()).error || 'Upload failed');
  return r.json();
}

export async function fetchLogs() {
  const r = await fetch(`${API_URL}/api/logs/me`, { headers: { ...authHeaders() } });
  if (!r.ok) throw new Error('Failed to load logs');
  return r.json();
}

export function exportLogsUrl() {
  return `${API_URL}/api/logs/me/export`;
}
