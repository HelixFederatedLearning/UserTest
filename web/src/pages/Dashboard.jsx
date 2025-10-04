// import React, { useEffect, useState } from 'react';
// import UploadCard from '../components/UploadCard.jsx';
// import HistoryTable from '../components/HistoryTable.jsx';
// import { fetchLogs } from '../api.js';

// export default function Dashboard() {
//   const [logs, setLogs] = useState([]);
//   const [refresh, setRefresh] = useState(0);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const d = await fetchLogs();
//         if (!cancelled && Array.isArray(d?.logs)) setLogs(d.logs);
//       } catch (e) {
//         console.warn('fetchLogs error (non-fatal):', e?.message || e);
//       }
//     })();
//     return () => { cancelled = true; };
//   }, [refresh]);

//   return (
//     <div className="space-y-6">
//       <UploadCard onComplete={() => setRefresh(x => x + 1)} />
//       <HistoryTable logs={logs} />
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import UploadCard from '../components/UploadCard.jsx';
import HistoryTable from '../components/HistoryTable.jsx';
import { fetchLogs } from '../api.js';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchLogs()
      .then(d => {
        if (!alive) return;
        // your fetchLogs may return { logs: [...] } or just an array
        const arr = Array.isArray(d) ? d : d?.logs || [];
        setLogs(arr);
      })
      .catch(console.error);
    return () => { alive = false; };
  }, [refresh]);

  return (
    <div className="space-y-6">
      <UploadCard logs={logs} onComplete={() => setRefresh(x => x + 1)} />
      <HistoryTable logs={logs} />
    </div>
  );
} 