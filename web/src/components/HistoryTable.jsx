import React from 'react';

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
              <th className="p-2">Predictions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="p-2">{(l.filenames || []).join(', ')}</td>
                <td className="p-2">{l.consent ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  {(l.predictions || []).map((p, i) => (
                    <div key={i}><strong>{p.label}</strong></div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
