// web/src/components/HistoryTable.jsx
import React from 'react';

const CLASSES = ["No_DR", "Mild", "Moderate", "Severe", "Proliferative_DR"];

function pct(p) {
  if (p == null) return '-';
  return (p * 100).toFixed(1) + '%';
}

function ProbBars({ preds }) {
  const map = Object.fromEntries((preds || []).map(p => [p.label, p.prob]));
  return (
    <div className="space-y-1">
      {CLASSES.map(label => {
        const prob = map[label] ?? 0;
        return (
          <div key={label}>
            <div className="flex justify-between text-xs">
              <span>{label}</span><span>{pct(prob)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded" style={{ width: `${Math.min(100, (prob || 0) * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HistoryTable({ logs }) {
  const downloadCsv = async () => {
    const token = localStorage.getItem('token');
    try {
      const r = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/logs/me/export', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
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
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold mb-2">History</h2>
        <button onClick={downloadCsv} className="text-indigo-600 underline">Export CSV</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Timestamp</th>
              <th className="p-2">Files</th>
              <th className="p-2">Consent</th>
              <th className="p-2">Top class</th>
              <th className="p-2">Probabilities</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, idx) => {
              const top = (l.predictions && l.predictions[0]) || null;
              return (
                <tr key={idx} className="border-b align-top">
                  <td className="p-2 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-2">{(l.filenames || []).join(', ')}</td>
                  <td className="p-2">{l.consent ? 'Yes' : 'No'}</td>
                  <td className="p-2">{top ? `${top.label} (${pct(top.prob)})` : '-'}</td>
                  <td className="p-2 w-96"><ProbBars preds={l.predictions} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
