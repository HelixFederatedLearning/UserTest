import React, { useState } from 'react';
import { uploadImages } from '../api.js';

export default function UploadCard({ onComplete }) {
  const [files, setFiles] = useState([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preds, setPreds] = useState([]);
  const [error, setError] = useState('');

  const onFiles = (e) => {
    const arr = Array.from(e.target.files).slice(0, 2);
    setFiles(arr);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setPreds([]);
    try {
      const res = await uploadImages(files, consent);
      setPreds(res.predictions || []);
      onComplete && onComplete();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Run a test</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="file" accept="image/*" multiple onChange={onFiles} />
        <div className="flex items-center space-x-2">
          <input id="consent" type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} />
          <label htmlFor="consent">I consent to my images being used for research and model improvement.</label>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button disabled={busy || files.length===0} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">
          {busy ? 'Running…' : 'Upload & Predict'}
        </button>
      </form>

      {preds.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Results</h3>
          <ul className="list-disc ml-5 space-y-1">
            {preds.map((p, i) => (
              <li key={i}>
                <span className="font-mono">{p.originalName}</span>: <strong>{p.label}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
