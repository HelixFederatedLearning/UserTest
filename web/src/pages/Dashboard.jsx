import React, { useEffect, useState } from 'react';
import UploadCard from '../components/UploadCard.jsx';
import HistoryTable from '../components/HistoryTable.jsx';
import { fetchLogs } from '../api.js';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchLogs().then(d => setLogs(d.logs)).catch(console.error);
  }, [refresh]);

  return (
    <div className="space-y-6">
      <UploadCard onComplete={() => setRefresh(x=>x+1)} />
      <HistoryTable logs={logs} />
    </div>
  );
}
