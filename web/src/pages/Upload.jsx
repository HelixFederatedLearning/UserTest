// web/src/pages/Upload.jsx
import React, { useState } from 'react';
import { useOnnxClient } from '../lib/useOnnxClient.js';
import { predictOnServer } from '../lib/serverPredict.js';
import PredictionPanel from '../components/PredictionPanel.jsx';

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [consent, setConsent] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [busy, setBusy] = useState(false);

  // show the inline chooser on click
  const [showChoice, setShowChoice] = useState(false);

  const token = localStorage.getItem('token');
  const { status, error, predictLocal } = useOnnxClient();

  function handleSubmit(e) {
    e.preventDefault();
    if (!files.length) return alert('Choose up to 2 images');
    setShowChoice(true);
  }

  async function runLocal() {
    try {
      setBusy(true);
      if (status !== 'ready') {
        alert('Local model not ready yet. Please wait a moment or choose "Use our services".');
        return;
      }
      const preds = await predictLocal(files);
      setPredictions(preds);

      // optional: log locally-run prediction (no image upload)
      try {
        await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/client-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            filenames: Array.from(files || []).map(f => f.name),
            consent: !!consent,
            predictions: preds
          })
        });
      } catch {}
    } catch (err) {
      alert(err.message || 'Local prediction failed');
      setPredictions(null);
    } finally {
      setBusy(false);
    }
  }

  async function runServer() {
    try {
      setBusy(true);
      const preds = await predictOnServer({ files, consent, token });
      setPredictions(preds);
    } catch (err) {
      alert(err.message || 'Server prediction failed');
      setPredictions(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">DR Test</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl shadow p-4">
        <div>
          <label className="block font-medium mb-1">Select Images (max 2)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0,2))}
          />
        </div>

        <div className="flex items-center gap-2">
          <input id="consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
          <label htmlFor="consent" className="text-sm">
            I consent to my images being used for research/training (applies only when images are uploaded to server).
          </label>
        </div>

        <div className="text-xs text-gray-600">
          Local model status: <strong>{status}</strong>
          {error && <span className="text-red-600"> — {String(error.message || error)}</span>}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
            disabled={busy}
          >
            {busy ? 'Predicting…' : 'Upload & Predict'}
          </button>
          {busy && <span className="text-sm text-gray-600 self-center">Working…</span>}
        </div>
      </form>

      {/* Inline chooser appears only when user clicks "Upload & Predict" */}
      {showChoice && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-medium mb-2">Choose where to run prediction</div>
          <p className="text-sm text-gray-700 mb-3">
            <strong>On my device</strong>: runs locally in your browser — no image leaves your device.<br/>
            <strong>Use our services</strong>: uploads image to the server for prediction.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded bg-gray-100" onClick={() => setShowChoice(false)}>Cancel</button>
            <button
              className="px-4 py-2 rounded bg-gray-200"
              onClick={async () => { setShowChoice(false); await runServer(); }}
            >
              Use our services
            </button>
            <button
              className="px-4 py-2 rounded bg-indigo-600 text-white"
              onClick={async () => { setShowChoice(false); await runLocal(); }}
            >
              On my device
            </button>
          </div>
        </div>
      )}

      <PredictionPanel predictions={predictions} />
    </div>
  );
}
