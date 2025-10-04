const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchLogs() {
  const token = localStorage.getItem('token') || '';
  const r = await fetch(`${API}/api/logs/me`, {
    headers: { Authorization: token ? `Bearer ${token}` : undefined }
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => `${r.status} ${r.statusText}`);
    console.warn('fetchLogs failed:', msg);
    return { logs: [] };
  }
  const data = await r.json().catch(() => ({}));
  const logs = Array.isArray(data) ? data : (Array.isArray(data?.logs) ? data.logs : []);
  return { logs };
}