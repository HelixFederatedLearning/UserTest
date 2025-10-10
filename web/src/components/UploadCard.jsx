// // import React, { useState } from 'react';
// // import PredictionPanel from './PredictionPanel.jsx';
// // import { useOnnxClient } from '../lib/useOnnxClient.js';
// // import { predictOnServer } from '../lib/serverPredict.js';

// // const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// // export default function UploadCard({ onComplete }) {
// //   const [files, setFiles] = useState([]);
// //   const [consent, setConsent] = useState(false);
// //   const [predictions, setPredictions] = useState(null);
// //   const [busy, setBusy] = useState(false);
// //   const [showChoice, setShowChoice] = useState(false);

// //   const token = localStorage.getItem('token');
// //   const { status: localStatus, error: localError, predictLocal } = useOnnxClient();

// //   function onSubmit(e) {
// //     e.preventDefault();
// //     if (!files.length) return alert('Choose up to 2 images');
// //     setShowChoice(true);
// //   }

// //   async function runLocal() {
// //     setShowChoice(false);
// //     try {
// //       setBusy(true);
// //       if (localStatus !== 'ready') {
// //         alert('Local model not ready yet. Please wait or choose "Use our services".');
// //         return;
// //       }
// //       const preds = await predictLocal(files);
// //       setPredictions(preds);

// //       // Log local predictions (no image upload) so history/CSV stay consistent
// //       try {
// //         await fetch(`${API}/api/client-log`, {
// //           method: 'POST',
// //           headers: {
// //             'Content-Type': 'application/json',
// //             ...(token ? { Authorization: `Bearer ${token}` } : {}),
// //           },
// //           body: JSON.stringify({
// //             filenames: files.map(f => f.name),
// //             consent: !!consent,
// //             predictions: preds, // [{label, prob}]
// //           }),
// //         });
// //       } catch (e) { console.warn('client-log failed (ignored):', e?.message || e); }

// //       onComplete?.();
// //     } catch (err) {
// //       alert(err.message || 'Local prediction failed');
// //       setPredictions(null);
// //     } finally {
// //       setBusy(false);
// //     }
// //   }

// //   async function runServer() {
// //     setShowChoice(false);
// //     try {
// //       setBusy(true);
// //       const preds = await predictOnServer({ files, consent, token });
// //       setPredictions(preds);
// //       onComplete?.();
// //     } catch (err) {
// //       alert(err.message || 'Server prediction failed');
// //       setPredictions(null);
// //     } finally {
// //       setBusy(false);
// //     }
// //   }

// //   return (
// //     <div className="bg-white rounded-xl shadow p-4">
// //       <h2 className="font-semibold mb-3">Upload & Predict</h2>
// //       <form onSubmit={onSubmit} className="space-y-4">
// //         <div>
// //           <label className="block font-medium mb-1">Select Image</label>
// //           <input
// //             type="file"
// //             accept="image/*"
// //             multiple
// //             onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 2))}
// //           />
// //         </div>

// //         <div className="flex items-center gap-2">
// //           <input id="consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
// //           <label htmlFor="consent" className="text-sm">
// //             I consent to my images being used for research/training (applies only when images are uploaded to server).
// //           </label>
// //         </div>

// //         <div className="text-xs text-gray-600">
// //           Local model status: <strong>{localStatus}</strong>
// //           {localError && <span className="text-red-600"> — {String(localError.message || localError)}</span>}
// //         </div>

// //         <div className="flex gap-3">
// //           <button
// //             type="submit"
// //             className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
// //             disabled={busy}
// //           >
// //             {busy ? 'Predicting…' : 'Upload & Predict'}
// //           </button>
// //         </div>
// //       </form>

// //       {/* Inline chooser after clicking Predict */}
// //       {showChoice && (
// //         <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
// //           <div className="font-medium mb-2">Choose where to run prediction</div>
// //           <p className="text-sm text-gray-700 mb-3">
// //             <strong>On my device</strong>: runs locally in your browser — no image leaves your device.<br />
// //             <strong>Use our services</strong>: uploads image to the server for prediction.
// //           </p>
// //           <div className="flex gap-3">
// //             <button className="px-4 py-2 rounded bg-gray-100" onClick={() => setShowChoice(false)}>Cancel</button>
// //             <button className="px-4 py-2 rounded bg-gray-200" onClick={runServer} disabled={busy}>
// //               Use our services
// //             </button>
// //             <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={runLocal} disabled={busy}>
// //               On my device
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       <PredictionPanel predictions={predictions} />
// //     </div>
// //   );
// // }
// import React, { useState } from 'react';
// import { useOnnxClient } from '../lib/useOnnxClient.js';
// import { predictOnServer } from '../lib/serverPredict.js';
// import TrendChart from './TrendChart.jsx';

// export default function UploadCard({ logs, onComplete }) {
//   const [files, setFiles] = useState([]);
//   const [consent, setConsent] = useState(false);
//   const [busy, setBusy] = useState(false);
//   const [mode, setMode] = useState('local'); // 'local' | 'server'
//   const [predictions, setPredictions] = useState(null);

//   const token = localStorage.getItem('token');
//   const { status, error, predictLocal } = useOnnxClient();

//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (!files.length) return alert('Choose up to 2 images');

//     try {
//       setBusy(true);
//       let preds;

//       if (mode === 'local') {
//         if (status !== 'ready') {
//           alert('Local model not ready. Please wait or choose "Use our services".');
//           return;
//         }
//         preds = await predictLocal(files);
//         setPredictions(preds);

//         // Save to history (client-log) without uploading images
//         try {
//           await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/client-log', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               ...(token ? { Authorization: `Bearer ${token}` } : {})
//             },
//             body: JSON.stringify({
//               filenames: Array.from(files || []).map(f => f.name),
//               consent: !!consent,
//               predictions: preds
//             })
//           });
//         } catch {}
//       } else {
//         // Server path (uploads image)
//         preds = await predictOnServer({ files, consent, token });
//         setPredictions(preds);
//       }

//       // Let Dashboard refetch logs
//       onComplete?.();
//     } catch (err) {
//       console.error(err);
//       alert(err?.message || 'Prediction failed');
//       setPredictions(null);
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="bg-white rounded-xl shadow p-4">
//       <h2 className="text-lg font-semibold mb-3">Upload & Predict</h2>

//       {/* 2-column: left = form/results, right = chart */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Left: upload form + last result */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block font-medium mb-1">Select Images (max 2)</label>
//             <input
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 2))}
//             />
//           </div>

//           <fieldset className="border rounded-lg p-3">
//             <legend className="px-1 text-sm font-medium">Where do you want to run the prediction?</legend>

//             <label className="flex items-start gap-3 py-2 cursor-pointer">
//               <input
//                 type="radio"
//                 name="mode"
//                 value="local"
//                 checked={mode === 'local'}
//                 onChange={() => setMode('local')}
//                 className="mt-1"
//               />
//               <div>
//                 <div className="font-medium">On my device (no image leaves this device)</div>
//                 <div className="text-xs text-gray-600">
//                   Local model status: <strong>{status}</strong>
//                   {error && <span className="text-red-600"> — {String(error.message || error)}</span>}
//                 </div>
//               </div>
//             </label>

//             <label className="flex items-start gap-3 py-2 cursor-pointer">
//               <input
//                 type="radio"
//                 name="mode"
//                 value="server"
//                 checked={mode === 'server'}
//                 onChange={() => setMode('server')}
//                 className="mt-1"
//               />
//               <div>
//                 <div className="font-medium">Use our services (image is uploaded to server)</div>
//                 <div className="text-xs text-gray-600">
//                   Recommended for low-memory devices or if local model fails to load.
//                 </div>
//               </div>
//             </label>
//           </fieldset>

//           <div className="flex items-center gap-2">
//             <input id="consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
//             <label htmlFor="consent" className="text-sm">
//               I consent to my images being used for research/training (applies only when images are uploaded to server).
//             </label>
//           </div>

//           <div className="flex gap-3">
//             <button
//               type="submit"
//               className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
//               disabled={busy}
//             >
//               {busy ? 'Predicting…' : 'Predict'}
//             </button>
//             {busy && <span className="text-sm text-gray-600 self-center">Running {mode}…</span>}
//           </div>

//           {/* Last result preview (optional simple render) */}
//           {Array.isArray(predictions) && predictions.length > 0 && (
//             <div className="border rounded-lg p-3 text-sm">
//               <div className="font-medium mb-1">Last prediction (top 5):</div>
//               <ul className="list-disc ml-5">
//                 {predictions.map((p, i) => (
//                   <li key={i}>
//                     {p.label}: {(p.prob * 100).toFixed(2)}%
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </form>

//         {/* Right: trend chart */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <h3 className="text-sm font-semibold text-gray-700">Recent Predictions (last 10)</h3>
//           </div>
//           <TrendChart logs={logs} />
//           <p className="text-xs text-gray-500 mt-2">
//             Y-axis shows the predicted class. X-axis shows the last up to 10 predictions (old → new).
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { useOnnxClient } from '../lib/useOnnxClient.js';
import { predictOnServer } from '../lib/serverPredict.js';
import TrendChart from './TrendChart.jsx';
import './UploadCard.css';

export default function UploadCard({ logs, onComplete }) {
  const [files, setFiles] = useState([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('local'); // 'local' | 'server'
  const [predictions, setPredictions] = useState(null);

  const token = localStorage.getItem('token');
  const { status, error, predictLocal } = useOnnxClient();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!files.length) return alert('Choose up to 2 images');

    try {
      setBusy(true);
      let preds;

      if (mode === 'local') {
        if (status !== 'ready') {
          alert('Local model not ready. Please wait or choose "Use our services".');
          return;
        }
        preds = await predictLocal(files);
        setPredictions(preds);

        // Save to history (client-log) without uploading images
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
      } else {
        // Server path (uploads image)
        preds = await predictOnServer({ files, consent, token });
        setPredictions(preds);
      }

      onComplete?.();
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Prediction failed');
      setPredictions(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="uc-card">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Upload &amp; Predict</h2>
          <p className="text-xs text-gray-500">Choose images, pick where to run, then view your trend.</p>
        </div>
        {busy && (
          <span className="uc-badge uc-badge--busy" aria-live="polite">Running {mode}…</span>
        )}
      </div>

      {/* 2-column: left = form/results, right = chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: upload form + last result */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Select Images (max 2)</label>

            {/* File input wrapper for better visuals */}
            <label className="uc-file">
              <div className="uc-file__icon" aria-hidden>📁</div>
              <div className="uc-file__meta">
                <div className="uc-file__title">Drag & drop or click to select</div>
                <div className="uc-file__hint">PNG, JPG — up to 2 files</div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 2))}
              />
            </label>

            {/* Selected files list */}
            {files.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-2 text-xs text-gray-700">
                {files.map((f, i) => (
                  <li key={i} className="uc-chip" title={f.name}>{f.name}</li>
                ))}
              </ul>
            )}
          </div>

          <fieldset className="uc-fieldset">
            <legend className="uc-legend">Where do you want to run the prediction?</legend>

            <label className={`uc-choice ${mode === 'local' ? 'uc-choice--active' : ''}`}>
              <input
                type="radio"
                name="mode"
                value="local"
                checked={mode === 'local'}
                onChange={() => setMode('local')}
              />
              <div className="uc-choice__body">
                <div className="uc-choice__title">On my device</div>
                <div className="uc-choice__desc">No image leaves this device.</div>
                <div className="uc-choice__meta">
                  Local model status:&nbsp;
                  <strong className={status === 'ready' ? 'text-emerald-600' : 'text-gray-700'}>
                    {status}
                  </strong>
                  {error && <span className="text-red-600"> — {String(error.message || error)}</span>}
                </div>
              </div>
            </label>

            <label className={`uc-choice ${mode === 'server' ? 'uc-choice--active' : ''}`}>
              <input
                type="radio"
                name="mode"
                value="server"
                checked={mode === 'server'}
                onChange={() => setMode('server')}
              />
              <div className="uc-choice__body">
                <div className="uc-choice__title">Use our services</div>
                <div className="uc-choice__desc">Uploads images to the server.</div>
                <div className="uc-choice__meta">Best for low-memory devices or if the local model fails.</div>
              </div>
            </label>
          </fieldset>

          <div className="flex items-center gap-3">
            {/* Consent switch look (still a checkbox underneath) */}
            <button
              type="button"
              role="switch"
              aria-checked={consent}
              onClick={() => setConsent(v => !v)}
              className={`uc-switch ${consent ? 'uc-switch--on' : ''}`}
            >
              <span className="uc-switch__dot" />
            </button>
            <label className="text-sm text-gray-700">
              I consent to my images being used for research/training (applies only when images are uploaded to server).
            </label>
            {/* Hidden actual checkbox for forms/compat (optional) */}
            <input
              id="consent"
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="hidden"
              tabIndex={-1}
              aria-hidden
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="uc-btn uc-btn--primary"
              disabled={busy}
            >
              {busy ? 'Predicting…' : 'Predict'}
            </button>
            <button
              type="button"
              className="uc-btn uc-btn--ghost"
              onClick={() => { setFiles([]); setPredictions(null); }}
              disabled={busy}
            >
              Reset
            </button>
          </div>

          {/* Last result preview */}
          {Array.isArray(predictions) && predictions.length > 0 && (
            <div className="uc-panel">
              <div className="font-medium mb-1">Last prediction (top 5)</div>
              <ul className="list-disc ml-5 text-sm">
                {predictions.map((p, i) => (
                  <li key={i}>
                    <span className="font-medium">{p.label}</span>: {(p.prob * 100).toFixed(2)}%
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>

        {/* Right: trend chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Recent Predictions (last 10)</h3>
          </div>
          <TrendChart logs={logs} />
          <p className="text-xs text-gray-500 mt-2">
            Y-axis shows the predicted class. X-axis shows the last up to 10 predictions (old → new).
          </p>
        </div>
      </div>
    </div>
  );
}
