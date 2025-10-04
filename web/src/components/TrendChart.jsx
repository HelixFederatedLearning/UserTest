import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const CLASSES = ["No_DR","Mild","Moderate","Severe","Proliferative_DR"];

/** Build the series from logs: take last 10, keep top class per prediction */
function buildSeries(logs) {
  const recent = (logs || [])
    .slice(0)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .reverse();

  return recent.map((log, idx) => {
    const preds = Array.isArray(log.predictions) ? log.predictions : [];
    const top = preds.reduce((best, p) => (p && p.prob > (best?.prob ?? -1) ? p : best), null);
    const label = top?.label ?? 'No_DR';
    const classIdx = Math.max(0, CLASSES.indexOf(label));
    return {
      x: idx + 1,           // 1..N
      label,
      classIdx,
      prob: top?.prob ?? null,
      when: log.createdAt,
      files: log.filenames || [],
      consent: !!log.consent,
      source: Array.isArray(log.filenames) && log.filenames.length > 0 ? 'server' : 'client'
    };
  });
}

export default function TrendChart({ logs }) {
  const data = useMemo(() => buildSeries(logs), [logs]);
  const ticks = useMemo(() => CLASSES.map((_, i) => i), []);

  return (
    <div className="w-full h-64">
      {data.length === 0 ? (
        <div className="h-full grid place-items-center text-sm text-gray-500 border rounded-lg">
          No predictions yet — your next results will appear here.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              label={{ value: 'Most recent predictions', position: 'insideBottom', offset: -2 }}
              tickMargin={6}
              allowDecimals={false}
            />
            <YAxis
              domain={[0, CLASSES.length - 1]}
              ticks={ticks}
              tickFormatter={(v) => CLASSES[v] ?? v}
              label={{ value: 'Class', angle: -90, position: 'insideLeft' }}
              tickMargin={8}
            />
            <Tooltip
              formatter={(value, name, props) => {
                if (name === 'classIdx') return CLASSES[value] ?? value;
                return value;
              }}
              labelFormatter={(lab, payload) => {
                const p = payload?.[0]?.payload;
                if (!p) return `#${lab}`;
                const prob = p.prob != null ? ` (p=${p.prob.toFixed(3)})` : '';
                return `#${p.x} • ${new Date(p.when).toLocaleString()}${prob}`;
              }}
            />
            <Line
              type="monotone"
              dataKey="classIdx"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}