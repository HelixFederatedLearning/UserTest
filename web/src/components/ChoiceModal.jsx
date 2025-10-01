// web/src/components/ChoiceModal.jsx
import React from 'react';
import { createPortal } from 'react-dom';

export default function ChoiceModal({ open, onClose, onLocal, onServer }) {
  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Choose where to run prediction</h2>
        <p className="text-sm text-gray-600 mb-4">
          <strong>On my device</strong>: runs locally in your browser — no image leaves your device.<br/>
          <strong>Use our services</strong>: uploads image to the server for prediction.
        </p>
        <div className="flex gap-3 justify-end">
          <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 rounded bg-gray-100"
            onClick={() => { console.log('[ChoiceModal] server'); onServer(); }}
          >
            Use our services
          </button>
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white"
            onClick={() => { console.log('[ChoiceModal] local'); onLocal(); }}
          >
            On my device
          </button>
        </div>
      </div>
    </div>
  );

  // Try portal to <body>. If body missing (unlikely), fall back to inline render.
  const root = document.body || document.getElementById('root');
  return root ? createPortal(modal, root) : modal;
}
