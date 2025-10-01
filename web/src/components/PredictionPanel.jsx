// web/src/components/PredictionPanel.jsx
import React from 'react';

export default function PredictionPanel({ predictions }) {
  if (!predictions?.length) return null;
  return (
    <div className="mt-4 bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-2">Prediction</h3>
      {predictions.map((p) => (
        <div key={p.label} className="mb-1">
          <div className="flex justify-between text-sm">
            <span>{p.label}</span><span>{(p.prob*100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded h-1.5">
            <div className="bg-indigo-600 h-1.5 rounded" style={{ width: `${Math.min(100, p.prob*100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
