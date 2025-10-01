// web/src/lib/serverPredict.js
export async function predictOnServer({ files, consent, token }) {
  const form = new FormData();
  for (const f of files) form.append('images', f);
  form.append('consent', consent ? 'true' : 'false');

  const r = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form
  });
  if (!r.ok) {
    const t = await r.text().catch(()=> '');
    throw new Error(t || 'Server inference failed');
  }
  const json = await r.json();
  return json.predictions || [];
}
