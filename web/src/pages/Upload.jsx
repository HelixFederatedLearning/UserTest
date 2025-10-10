// // web/src/pages/Upload.jsx
// import React, { useState } from 'react';
// import { useOnnxClient } from '../lib/useOnnxClient.js';
// import { predictOnServer } from '../lib/serverPredict.js';
// import PredictionPanel from '../components/PredictionPanel.jsx';

// export default function UploadPage() {
//   const [files, setFiles] = useState([]);
//   const [consent, setConsent] = useState(false);
//   const [predictions, setPredictions] = useState(null);
//   const [busy, setBusy] = useState(false);

//   // show the inline chooser on click
//   const [showChoice, setShowChoice] = useState(false);

//   const token = localStorage.getItem('token');
//   const { status, error, predictLocal } = useOnnxClient();

//   function handleSubmit(e) {
//     e.preventDefault();
//     if (!files.length) return alert('Choose up to 2 images');
//     setShowChoice(true);
//   }

//   async function runLocal() {
//     try {
//       setBusy(true);
//       if (status !== 'ready') {
//         alert('Local model not ready yet. Please wait a moment or choose "Use our services".');
//         return;
//       }
//       const preds = await predictLocal(files);
//       setPredictions(preds);

//       // optional: log locally-run prediction (no image upload)
//       try {
//         await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/client-log', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             ...(token ? { Authorization: `Bearer ${token}` } : {})
//           },
//           body: JSON.stringify({
//             filenames: Array.from(files || []).map(f => f.name),
//             consent: !!consent,
//             predictions: preds
//           })
//         });
//       } catch {}
//     } catch (err) {
//       alert(err.message || 'Local prediction failed');
//       setPredictions(null);
//     } finally {
//       setBusy(false);
//     }
//   }

//   async function runServer() {
//     try {
//       setBusy(true);
//       const preds = await predictOnServer({ files, consent, token });
//       setPredictions(preds);
//     } catch (err) {
//       alert(err.message || 'Server prediction failed');
//       setPredictions(null);
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <h1 className="text-xl font-bold mb-4">DR Test</h1>

//       <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl shadow p-4">
//         <div>
//           <label className="block font-medium mb-1">Select Images (max 2)</label>
//           <input
//             type="file"
//             accept="image/*"
//             multiple
//             onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0,2))}
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <input id="consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
//           <label htmlFor="consent" className="text-sm">
//             I consent to my images being used for research/training (applies only when images are uploaded to server).
//           </label>
//         </div>

//         <div className="text-xs text-gray-600">
//           Local model status: <strong>{status}</strong>
//           {error && <span className="text-red-600"> — {String(error.message || error)}</span>}
//         </div>

//         <div className="flex gap-3">
//           <button
//             type="submit"
//             className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
//             disabled={busy}
//           >
//             {busy ? 'Predicting…' : 'Upload & Predict'}
//           </button>
//           {busy && <span className="text-sm text-gray-600 self-center">Working…</span>}
//         </div>
//       </form>

//       {/* Inline chooser appears only when user clicks "Upload & Predict" */}
//       {showChoice && (
//         <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//           <div className="font-medium mb-2">Choose where to run prediction</div>
//           <p className="text-sm text-gray-700 mb-3">
//             <strong>On my device</strong>: runs locally in your browser — no image leaves your device.<br/>
//             <strong>Use our services</strong>: uploads image to the server for prediction.
//           </p>
//           <div className="flex gap-3">
//             <button className="px-4 py-2 rounded bg-gray-100" onClick={() => setShowChoice(false)}>Cancel</button>
//             <button
//               className="px-4 py-2 rounded bg-gray-200"
//               onClick={async () => { setShowChoice(false); await runServer(); }}
//             >
//               Use our services
//             </button>
//             <button
//               className="px-4 py-2 rounded bg-indigo-600 text-white"
//               onClick={async () => { setShowChoice(false); await runLocal(); }}
//             >
//               On my device
//             </button>
//           </div>
//         </div>
//       )}

//       <PredictionPanel predictions={predictions} />
//     </div>
//   );
// }


// web/src/pages/Upload.jsx
import React, { useCallback, useRef, useState } from 'react';
import { useOnnxClient } from '../lib/useOnnxClient.js';
import { predictOnServer } from '../lib/serverPredict.js';
import PredictionPanel from '../components/PredictionPanel.jsx';
import './UploadPage.css';

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [consent, setConsent] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showChoice, setShowChoice] = useState(false);

  const token = localStorage.getItem('token');
  const { status, error: localError, predictLocal } = useOnnxClient();

  const inputRef = useRef(null);

  const clampFiles = useCallback((fileList) => {
    const arr = Array.from(fileList || []).slice(0, 2);
    // Optional: basic image mime check
    const accepted = arr.filter(f => /^image\//.test(f.type));
    return accepted.slice(0, 2);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    if (!files.length) {
      setErrorMsg('Choose up to 2 image files.');
      return;
    }
    setShowChoice(true);
  }

  async function runLocal() {
    setErrorMsg('');
    try {
      setBusy(true);
      if (status !== 'ready') {
        setErrorMsg('Local model not ready yet. Please try again in a moment or use our services.');
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
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            filenames: Array.from(files || []).map(f => f.name),
            consent: !!consent,
            predictions: preds,
          }),
        });
      } catch { /* non-blocking */ }
    } catch (err) {
      setPredictions(null);
      setErrorMsg(err.message || 'Local prediction failed');
    } finally {
      setBusy(false);
    }
  }

  async function runServer() {
    setErrorMsg('');
    try {
      setBusy(true);
      const preds = await predictOnServer({ files, consent, token });
      setPredictions(preds);
    } catch (err) {
      setPredictions(null);
      setErrorMsg(err.message || 'Server prediction failed');
    } finally {
      setBusy(false);
    }
  }

  // Drag & drop handlers
  const onDrop = useCallback((e) => {
    e.preventDefault();
    if (busy) return;
    const picked = clampFiles(e.dataTransfer.files);
    setFiles(picked);
  }, [busy, clampFiles]);

  const onPaste = useCallback((e) => {
    const imgs = Array.from(e.clipboardData?.items || [])
      .map(i => i.getAsFile?.())
      .filter(Boolean);
    if (imgs.length) setFiles(clampFiles(imgs));
  }, [clampFiles]);

  const onPick = (e) => setFiles(clampFiles(e.target.files));

  const removeAt = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="up-wrap max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="up-logo" aria-hidden>🩺</div>
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">DR Test</h1>
          <p className="text-xs text-gray-500">Choose images, pick where to run, view results.</p>
        </div>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="up-alert" role="alert">
          <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
            <path fill="currentColor" d="M10 2a8 8 0 1 0 8 8A8.01 8.01 0 0 0 10 2Zm1 12H9v-2h2Zm0-3H9V6h2Z"/>
          </svg>
          <span className="sr-only">Error:</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 up-card" onPaste={onPaste}>
        {/* File input (drag & drop + click + paste) */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Select Images (max 2)</label>

          <div
            className="up-drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
            aria-label="Upload images. Drag & drop, paste, or click to choose"
          >
            <div className="up-drop__icon" aria-hidden>📁</div>
            <div className="up-drop__copy">
              <div className="up-drop__title">Drag & drop, paste, or click to select</div>
              <div className="up-drop__hint">PNG, JPG • Up to 2 files</div>
            </div>
            <button type="button" className="up-btn up-btn--ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
              Browse
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onPick}
              className="hidden"
            />
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <li key={i} className="up-chip" title={f.name}>
                  <span className="truncate max-w-[14rem]">{f.name}</span>
                  <button
                    type="button"
                    className="up-chip__x"
                    onClick={() => removeAt(i)}
                    aria-label={`Remove ${f.name}`}
                    disabled={busy}
                  >×</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Consent switch */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={consent}
            onClick={() => setConsent(v => !v)}
            className={`up-switch ${consent ? 'up-switch--on' : ''}`}
            disabled={busy}
          >
            <span className="up-switch__dot" />
          </button>
        <label className="text-sm text-gray-700">
            I consent to my images being used for research/training
            <span className="text-gray-500"> (applies only when images are uploaded to server).</span>
          </label>
        </div>

        {/* Local model status */}
        <div className="text-xs text-gray-600">
          Local model status:&nbsp;
          <strong className={status === 'ready' ? 'text-emerald-600' : 'text-gray-800'}>{status}</strong>
          {localError && <span className="text-red-600"> — {String(localError.message || localError)}</span>}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="up-btn up-btn--primary"
            disabled={busy}
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <span className="up-spinner" aria-hidden />
                Upload &amp; Predict
              </span>
            ) : 'Upload & Predict'}
          </button>
          {busy && <span className="text-sm text-gray-600 self-center">Working…</span>}
          <button
            type="button"
            className="up-btn"
            onClick={() => { setFiles([]); setPredictions(null); setErrorMsg(''); }}
            disabled={busy}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Inline chooser (sheet) */}
      {showChoice && (
        <div className="up-choice" role="dialog" aria-modal="true" aria-label="Choose where to run prediction">
          <div className="up-choice__card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="font-medium text-gray-900">Choose where to run prediction</div>
                <p className="text-sm text-gray-600">Local keeps data on-device. “Our services” uploads to server.</p>
              </div>
              <button className="up-x" onClick={() => setShowChoice(false)} aria-label="Close">×</button>
            </div>

            <div className="grid gap-3 mt-2">
              <button
                className="up-choice__btn"
                onClick={async () => { setShowChoice(false); await runLocal(); }}
                disabled={busy}
              >
                <span className="up-choice__title">On my device</span>
                <span className="up-choice__desc">Runs locally in your browser — no image leaves your device.</span>
              </button>

              <button
                className="up-choice__btn"
                onClick={async () => { setShowChoice(false); await runServer(); }}
                disabled={busy}
              >
                <span className="up-choice__title">Use our services</span>
                <span className="up-choice__desc">Uploads images to the server for prediction.</span>
              </button>

              <button
                className="up-btn up-btn--ghost"
                onClick={() => setShowChoice(false)}
                disabled={busy}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <PredictionPanel predictions={predictions} />
    </div>
  );
}
