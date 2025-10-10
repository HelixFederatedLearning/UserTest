// import React, { useMemo } from 'react';
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
// } from 'recharts';

// const CLASSES = ["No_DR","Mild","Moderate","Severe","Proliferative_DR"];

// /** Build the series from logs: take last 10, keep top class per prediction */
// function buildSeries(logs) {
//   const recent = (logs || [])
//     .slice(0)
//     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//     .slice(0, 10)
//     .reverse();

//   return recent.map((log, idx) => {
//     const preds = Array.isArray(log.predictions) ? log.predictions : [];
//     const top = preds.reduce((best, p) => (p && p.prob > (best?.prob ?? -1) ? p : best), null);
//     const label = top?.label ?? 'No_DR';
//     const classIdx = Math.max(0, CLASSES.indexOf(label));
//     return {
//       x: idx + 1,           // 1..N
//       label,
//       classIdx,
//       prob: top?.prob ?? null,
//       when: log.createdAt,
//       files: log.filenames || [],
//       consent: !!log.consent,
//       source: Array.isArray(log.filenames) && log.filenames.length > 0 ? 'server' : 'client'
//     };
//   });
// }

// export default function TrendChart({ logs }) {
//   const data = useMemo(() => buildSeries(logs), [logs]);
//   const ticks = useMemo(() => CLASSES.map((_, i) => i), []);

//   return (
//     <div className="w-full h-64">
//       {data.length === 0 ? (
//         <div className="h-full grid place-items-center text-sm text-gray-500 border rounded-lg">
//           No predictions yet — your next results will appear here.
//         </div>
//       ) : (
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis
//               dataKey="x"
//               label={{ value: 'Most recent predictions', position: 'insideBottom', offset: -2 }}
//               tickMargin={6}
//               allowDecimals={false}
//             />
//             <YAxis
//               domain={[0, CLASSES.length - 1]}
//               ticks={ticks}
//               tickFormatter={(v) => CLASSES[v] ?? v}
//               label={{ value: 'Class', angle: -90, position: 'insideLeft' }}
//               tickMargin={8}
//             />
//             <Tooltip
//               formatter={(value, name, props) => {
//                 if (name === 'classIdx') return CLASSES[value] ?? value;
//                 return value;
//               }}
//               labelFormatter={(lab, payload) => {
//                 const p = payload?.[0]?.payload;
//                 if (!p) return `#${lab}`;
//                 const prob = p.prob != null ? ` (p=${p.prob.toFixed(3)})` : '';
//                 return `#${p.x} • ${new Date(p.when).toLocaleString()}${prob}`;
//               }}
//             />
//             <Line
//               type="monotone"
//               dataKey="classIdx"
//               dot={{ r: 3 }}
//               activeDot={{ r: 5 }}
//               isAnimationActive={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       )}
//     </div>
//   );
// }

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import './TrendChart.css';

const CLASSES = ['No_DR', 'Mild', 'Moderate', 'Severe', 'Proliferative_DR'];

/** Build the series from logs: take last 10, keep top class per prediction */
function buildSeries(logs) {
  const recent = (logs || [])
    .slice(0)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .reverse();

  return recent.map((log, idx) => {
    const preds = Array.isArray(log.predictions) ? log.predictions : [];
    const top = preds.reduce(
      (best, p) => (p && typeof p.prob === 'number' && p.prob > (best?.prob ?? -1) ? p : best),
      null
    );
    const label = top?.label ?? 'No_DR';
    const classIdxRaw = CLASSES.indexOf(label);
    const classIdx = Math.max(0, classIdxRaw === -1 ? 0 : classIdxRaw);

    return {
      x: idx + 1, // 1..N
      label,
      classIdx,
      prob: typeof top?.prob === 'number' ? top.prob : null,
      when: log.createdAt,
      files: Array.isArray(log.filenames) ? log.filenames : [],
      consent: !!log.consent,
      source: Array.isArray(log.filenames) && log.filenames.length > 0 ? 'server' : 'client',
    };
  });
}

function severityColor(idx) {
  // Subtle ramp from safe → critical
  const palette = [
    'var(--tc-green-600)',
    'var(--tc-amber-500)',
    'var(--tc-orange-500)',
    'var(--tc-red-500)',
    'var(--tc-rose-600)',
  ];
  return palette[Math.max(0, Math.min(idx, palette.length - 1))];
}

function PrettyTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;

  const when = new Date(p.when);
  const whenStr = isNaN(+when) ? 'Unknown time' : when.toLocaleString();
  const probStr = p.prob != null ? `p=${p.prob.toFixed(3)}` : '—';

  return (
    <div className="tc-tooltip shadow-lg rounded-xl border tc-border bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-gray-900">{p.label}</span>
        <span className={`tc-badge ${p.source === 'server' ? 'tc-badge--server' : 'tc-badge--client'}`}>
          {p.source}
        </span>
      </div>
      <div className="mt-1 text-xs text-gray-500">#{p.x} • {whenStr}</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div className="tc-kv">
          <span className="tc-k">Class idx</span>
          <span className="tc-v">{p.classIdx}</span>
        </div>
        <div className="tc-kv">
          <span className="tc-k">Confidence</span>
          <span className="tc-v">{probStr}</span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {p.consent ? <span className="tc-chip">consented</span> : <span className="tc-chip tc-chip--muted">no consent</span>}
        {p.files?.slice(0, 3).map((f, i) => (
          <span key={i} className="tc-chip">{f}</span>
        ))}
        {p.files?.length > 3 && <span className="tc-chip">+{p.files.length - 3} more</span>}
      </div>
    </div>
  );
}

export default function TrendChart({ logs }) {
  const data = useMemo(() => buildSeries(logs), [logs]);
  const ticks = useMemo(() => CLASSES.map((_, i) => i), []);

  return (
    <div className="tc-card group">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">DR Trend</h3>
          <p className="text-xs text-gray-500">Top-class across your last 10 predictions</p>
        </div>
        {data.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-block w-2.5 h-2.5 rounded-full tc-dot" />
            live
          </div>
        )}
      </div>

      <div className="w-full h-64 md:h-72">
        {data.length === 0 ? (
          <div className="h-full grid place-items-center text-sm text-gray-500 border tc-border rounded-xl bg-gradient-to-b from-white to-gray-50/80">
            <div className="text-center px-6">
              <div className="mx-auto mb-2 h-10 w-10 rounded-full grid place-items-center tc-emptystate">
                📈
              </div>
              <div className="font-medium text-gray-700">No predictions yet</div>
              <div className="text-xs text-gray-500">Your next results will appear here.</div>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 12, right: 16, bottom: 12, left: 12 }}
            >
              {/* Soft banding per class for readability */}
              {CLASSES.map((name, i) => (
                <ReferenceArea
                  key={name}
                  y1={i - 0.5}
                  y2={i + 0.5}
                  ifOverflow="extendDomain"
                  fill={severityColor(i)}
                  fillOpacity={0.06}
                  strokeOpacity={0}
                />
              ))}

              <CartesianGrid strokeDasharray="3 3" className="tc-grid" />

              <XAxis
                dataKey="x"
                label={{ value: 'Most recent predictions', position: 'insideBottom', offset: -2 }}
                tickMargin={6}
                allowDecimals={false}
                tick={{ className: 'tc-axis-tick' }}
                axisLine={{ className: 'tc-axis' }}
              />
              <YAxis
                domain={[0, CLASSES.length - 1]}
                ticks={ticks}
                tickFormatter={(v) => CLASSES[v] ?? v}
                label={{ value: 'Class', angle: -90, position: 'insideLeft' }}
                tickMargin={8}
                tick={{ className: 'tc-axis-tick' }}
                axisLine={{ className: 'tc-axis' }}
              />

              {/* Today marker if the last point is from today */}
              {(() => {
                const last = data[data.length - 1];
                const lastDate = last ? new Date(last.when) : null;
                const now = new Date();
                const isSameDay =
                  lastDate &&
                  lastDate.getFullYear() === now.getFullYear() &&
                  lastDate.getMonth() === now.getMonth() &&
                  lastDate.getDate() === now.getDate();
                return isSameDay ? (
                  <ReferenceLine
                    x={last.x}
                    strokeDasharray="4 2"
                    stroke="var(--tc-primary)"
                    strokeOpacity={0.6}
                  />
                ) : null;
              })()}

              <Tooltip content={<PrettyTooltip />} />

              {/* Smooth line with gentle glow */}
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--tc-primary)" stopOpacity="1" />
                  <stop offset="100%" stopColor="var(--tc-accent)" stopOpacity="1" />
                </linearGradient>
              </defs>

              <Line
                type="monotone"
                dataKey="classIdx"
                dot={{ r: 3, strokeWidth: 2, className: 'tc-dot-stroke' }}
                activeDot={{ r: 6, className: 'tc-dot-active' }}
                stroke="url(#lineGradient)"
                strokeWidth={2.5}
                isAnimationActive={false}
                filter="url(#glow)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend pills */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {CLASSES.map((c, i) => (
          <span
            key={c}
            className="tc-legend"
            style={{ backgroundColor: `${severityColor(i)}20`, color: severityColor(i) }}
            title={`Index ${i}`}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
