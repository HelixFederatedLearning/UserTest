// // // web/src/components/HistoryTable.jsx
// // import React from 'react';

// // const CLASSES = ["No_DR", "Mild", "Moderate", "Severe", "Proliferative_DR"];

// // function pct(p) {
// //   if (p == null) return '-';
// //   return (p * 100).toFixed(1) + '%';
// // }

// // function ProbBars({ preds }) {
// //   const map = Object.fromEntries((preds || []).map(p => [p.label, p.prob]));
// //   return (
// //     <div className="space-y-1">
// //       {CLASSES.map(label => {
// //         const prob = map[label] ?? 0;
// //         return (
// //           <div key={label}>
// //             <div className="flex justify-between text-xs">
// //               <span>{label}</span><span>{pct(prob)}</span>
// //             </div>
// //             <div className="w-full bg-gray-200 rounded h-1.5">
// //               <div className="bg-indigo-600 h-1.5 rounded" style={{ width: `${Math.min(100, (prob || 0) * 100)}%` }} />
// //             </div>
// //           </div>
// //         );
// //       })}
// //     </div>
// //   );
// // }

// // export default function HistoryTable({ logs }) {
// //   const downloadCsv = async () => {
// //     const token = localStorage.getItem('token');
// //     try {
// //       const r = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/logs/me/export', {
// //         headers: token ? { Authorization: `Bearer ${token}` } : {}
// //       });
// //       if (!r.ok) throw new Error('Failed to export CSV');
// //       const blob = await r.blob();
// //       const url = window.URL.createObjectURL(blob);
// //       const a = document.createElement('a');
// //       a.href = url;
// //       a.download = 'dr_history.csv';
// //       document.body.appendChild(a);
// //       a.click();
// //       a.remove();
// //       window.URL.revokeObjectURL(url);
// //     } catch (e) {
// //       alert(e.message || 'Export failed');
// //     }
// //   };

// //   return (
// //     <div className="bg-white rounded-xl shadow p-4">
// //       <div className="flex items-center justify-between">
// //         <h2 className="text-lg font-semibold mb-2">History</h2>
// //         <button onClick={downloadCsv} className="text-indigo-600 underline">Export CSV</button>
// //       </div>
// //       <div className="overflow-x-auto">
// //         <table className="min-w-full text-sm">
// //           <thead>
// //             <tr className="text-left border-b">
// //               <th className="p-2">Timestamp</th>
// //               <th className="p-2">Files</th>
// //               <th className="p-2">Consent</th>
// //               <th className="p-2">Top class</th>
// //               <th className="p-2">Probabilities</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {logs.map((l, idx) => {
// //               const top = (l.predictions && l.predictions[0]) || null;
// //               return (
// //                 <tr key={idx} className="border-b align-top">
// //                   <td className="p-2 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
// //                   <td className="p-2">{(l.filenames || []).join(', ')}</td>
// //                   <td className="p-2">{l.consent ? 'Yes' : 'No'}</td>
// //                   <td className="p-2">{top ? `${top.label} (${pct(top.prob)})` : '-'}</td>
// //                   <td className="p-2 w-96"><ProbBars preds={l.predictions} /></td>
// //                 </tr>
// //               );
// //             })}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // }
// // web/src/components/HistoryTable.jsx
// import React from 'react';

// const CLASSES = ["No_DR", "Mild", "Moderate", "Severe", "Proliferative_DR"];

// function pct(p) {
//   if (p == null) return '-';
//   return (p * 100).toFixed(1) + '%';
// }

// function badgeColor(label) {
//   switch (label) {
//     case "No_DR": return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
//     case "Mild": return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
//     case "Moderate": return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
//     case "Severe": return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
//     case "Proliferative_DR": return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
//     default: return "bg-gray-100 text-gray-700";
//   }
// }

// function FileChips({ files = [] }) {
//   if (!files.length) return <span className="text-gray-400">—</span>;
//   return (
//     <div className="flex flex-wrap gap-1.5">
//       {files.map((f, i) => (
//         <span
//           key={`${f}-${i}`}
//           className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 ring-1 ring-gray-200"
//           title={f}
//         >
//           {f}
//         </span>
//       ))}
//     </div>
//   );
// }

// function ProbBars({ preds }) {
//   const map = Object.fromEntries((preds || []).map(p => [p.label, p.prob]));
//   return (
//     <div className="space-y-2">
//       {CLASSES.map(label => {
//         const prob = map[label] ?? 0;
//         return (
//           <div key={label}>
//             <div className="flex justify-between text-[11px] text-gray-600 mb-1">
//               <span className="truncate">{label}</span>
//               <span className="tabular-nums">{pct(prob)}</span>
//             </div>
//             <div className="w-full bg-gray-100 rounded-full h-2.5 ring-1 ring-gray-200/60">
//               <div
//                 className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-[width] duration-500"
//                 style={{ width: `${Math.min(100, (prob || 0) * 100)}%` }}
//               />
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// export default function HistoryTable({ logs = [] }) {
//   const downloadCsv = async () => {
//     const token = localStorage.getItem('token');
//     try {
//       const r = await fetch(
//         (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/logs/me/export',
//         { headers: token ? { Authorization: `Bearer ${token}` } : {} }
//       );
//       if (!r.ok) throw new Error('Failed to export CSV');
//       const blob = await r.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'dr_history.csv';
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch (e) {
//       alert(e.message || 'Export failed');
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/70 p-6">
//       <div className="flex items-center justify-between gap-4 mb-4">
//         <div>
//           <h2 className="text-xl font-semibold text-gray-900">History</h2>
//           <p className="text-sm text-gray-500">Your recent predictions and probabilities.</p>
//         </div>
//         <button
//           onClick={downloadCsv}
//           className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium
//                      bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800
//                      focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
//         >
//           {/* download icon */}
//           <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//             <path d="M3 14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 1 1 2 0v1a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4v-1a1 1 0 1 1 2 0v1z"/>
//             <path d="M10 2a1 1 0 0 1 1 1v7.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4.007 4.007a1.25 1.25 0 0 1-1.4.247 1.25 1.25 0 0 1-.247-.247L5.046 9.707a1 1 0 1 1 1.414-1.414L8.75 10.586V3a1 1 0 0 1 1-1z"/>
//           </svg>
//           Export CSV
//         </button>
//       </div>

//       {logs.length === 0 ? (
//         <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
//           <p className="text-gray-500">No history yet. Run a prediction to see it here.</p>
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border border-gray-200">
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead className="bg-gray-50 sticky top-0">
//                 <tr className="text-left text-gray-600">
//                   <th className="p-3 font-medium">Timestamp</th>
//                   <th className="p-3 font-medium min-w-[220px]">Files</th>
//                   <th className="p-3 font-medium">Consent</th>
//                   <th className="p-3 font-medium">Top class</th>
//                   <th className="p-3 font-medium w-[420px]">Probabilities</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {logs.map((l, idx) => {
//                   const top = (l.predictions && l.predictions[0]) || null;
//                   return (
//                     <tr
//                       key={idx}
//                       className="hover:bg-indigo-50/30 transition-colors"
//                     >
//                       <td className="p-3 whitespace-nowrap text-gray-800">
//                         {new Date(l.createdAt).toLocaleString()}
//                       </td>
//                       <td className="p-3">
//                         <FileChips files={l.filenames || []} />
//                       </td>
//                       <td className="p-3">
//                         <span className={`px-2 py-0.5 rounded-full text-xs ring-1 ${
//                           l.consent
//                             ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
//                             : "bg-gray-100 text-gray-600 ring-gray-200"
//                         }`}>
//                           {l.consent ? 'Yes' : 'No'}
//                         </span>
//                       </td>
//                       <td className="p-3">
//                         {top ? (
//                           <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor(top.label)}`}>
//                             {top.label} • {pct(top.prob)}
//                           </span>
//                         ) : (
//                           <span className="text-gray-400">—</span>
//                         )}
//                       </td>
//                       <td className="p-3 align-top">
//                         <div className="max-w-[28rem]">
//                           <ProbBars preds={l.predictions} />
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React from 'react';
import './HistoryTable.css';

const CLASSES = ["No_DR", "Mild", "Moderate", "Severe", "Proliferative_DR"];

function pct(p) {
  if (p == null) return '—';
  return (p * 100).toFixed(1) + '%';
}

function badgeTone(label) {
  switch (label) {
    case "No_DR": return "ht-pill ht-pill--emerald";
    case "Mild": return "ht-pill ht-pill--blue";
    case "Moderate": return "ht-pill ht-pill--amber";
    case "Severe": return "ht-pill ht-pill--orange";
    case "Proliferative_DR": return "ht-pill ht-pill--rose";
    default: return "ht-pill";
  }
}

function FileChips({ files = [] }) {
  if (!files.length) return <span className="text-gray-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {files.map((f, i) => (
        <span
          key={`${f}-${i}`}
          className="ht-chip"
          title={f}
        >
          {f}
        </span>
      ))}
    </div>
  );
}

function ProbBars({ preds }) {
  // Map label -> prob for quick lookup
  const map = Object.fromEntries((preds || []).map(p => [p.label, p.prob]));
  return (
    <div className="space-y-2">
      {CLASSES.map(label => {
        const prob = Math.max(0, Math.min(1, map[label] ?? 0));
        const width = `${(prob * 100).toFixed(1)}%`;
        return (
          <div key={label} className="ht-bar">
            <div className="flex justify-between text-[11px] text-gray-600 mb-1">
              <span className="truncate">{label}</span>
              <span className="tabular-nums">{pct(prob)}</span>
            </div>
            <div
              className={`ht-bar__track ht-bar__track--${label}`}
              aria-label={`${label} probability`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(prob * 100)}
            >
              <div className="ht-bar__fill" style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HistoryTable({ logs = [] }) {
  const downloadCsv = async () => {
    const token = localStorage.getItem('token');
    try {
      const r = await fetch(
        (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/logs/me/export',
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!r.ok) throw new Error('Failed to export CSV');
      const blob = await r.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dr_history.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || 'Export failed');
    }
  };

  return (
    <div className="ht-card">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">History</h2>
          <p className="text-sm text-gray-500">Your recent predictions and probabilities.</p>
        </div>
        <button
          onClick={downloadCsv}
          className="ht-btn ht-btn--primary"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M3 14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 1 1 2 0v1a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4v-1a1 1 0 1 1 2 0v1z"/>
            <path d="M10 2a1 1 0 0 1 1 1v7.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4.007 4.007a1.25 1.25 0 0 1-1.4.247 1.25 1.25 0 0 1-.247-.247L5.046 9.707a1 1 0 1 1 1.414-1.414L8.75 10.586V3a1 1 0 0 1 1-1z"/>
          </svg>
          Export CSV
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="ht-empty">
          <div className="ht-empty__icon" aria-hidden>🗂️</div>
          <p className="text-gray-700 font-medium">No history yet</p>
          <p className="text-gray-500 text-sm">Run a prediction to see it here.</p>
        </div>
      ) : (
        <div className="ht-tablewrap">
          <div className="ht-scroll">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-left text-gray-600">
                  <th className="p-3 font-medium">Timestamp</th>
                  <th className="p-3 font-medium min-w-[220px]">Files</th>
                  <th className="p-3 font-medium">Consent</th>
                  <th className="p-3 font-medium">Top class</th>
                  <th className="p-3 font-medium w-[420px]">Probabilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((l, idx) => {
                  const top = Array.isArray(l.predictions) ? l.predictions[0] : null;
                  const dateStr = new Date(l.createdAt).toLocaleString();
                  return (
                    <tr key={idx} className="ht-row">
                      <td className="p-3 whitespace-nowrap text-gray-800">
                        <span className="ht-time" title={l.createdAt}>{dateStr}</span>
                      </td>
                      <td className="p-3">
                        <FileChips files={l.filenames || []} />
                      </td>
                      <td className="p-3">
                        <span className={`ht-pill ${l.consent ? 'ht-pill--emerald' : 'ht-pill--muted'}`}>
                          {l.consent ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-3">
                        {top ? (
                          <span className={`${badgeTone(top.label)} font-medium`}>
                            {top.label} • {pct(top.prob)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3 align-top">
                        <div className="max-w-[28rem]">
                          <ProbBars preds={l.predictions} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Scroll shadows (left/right) */}
            <div className="ht-shadow ht-shadow--left" aria-hidden />
            <div className="ht-shadow ht-shadow--right" aria-hidden />
          </div>
        </div>
      )}
    </div>
  );
}
