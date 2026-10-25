'use client';

import { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';

export default function MonitoringPanels({ locale }) {
  const [health, setHealth] = useState(null);
  const [system, setSystem] = useState(null);
  const [db, setDb] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = async () => {
    try {
      const [h, s, d, j] = await Promise.all([
        fetch('/api/health').then(r => r.json()),
        fetch('/api/admin/monitoring/system').then(r => r.json()),
        fetch('/api/admin/monitoring/db').then(r => r.json()),
        fetch('/api/admin/monitoring/jobs').then(r => r.json())
      ]);
      setHealth(h);
      setSystem(s);
      setDb(d);
      setJobs(j);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const ml = locale === 'ml';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  const StatusBadge = ({ status }) => {
    const isOk = status === 'ok';
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
        isOk ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {isOk ? (ml ? 'സുഖം' : 'Healthy') : (ml ? 'വിനാശകരം' : 'Degraded')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {ml ? 'അപ്‌ഡേറ്റ് സമയം: ' : 'Last update: '}
          {lastUpdate.toLocaleTimeString(locale === 'ml' ? 'ml-IN' : 'en-US')}
        </span>
        <button
          onClick={fetchData}
          className="px-3 py-1 rounded bg-teal-600 text-white text-sm hover:bg-teal-700"
        >
          {ml ? 'പുതുക്കുക' : 'Refresh'}
        </button>
      </div>

      {/* Health Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {ml ? 'പ്ലാറ്റ്‌ഫോം ആരോഗ്യം' : 'Platform Health'}
        </h2>
        {health ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{ml ? 'നില' : 'Status'}:</span>
              <StatusBadge status={health.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{ml ? 'ഡാറ്റാബേസ്' : 'Database'}:</span>
              <span className={health.dbOk ? 'text-green-600' : 'text-red-600'}>
                {health.dbOk ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{ml ? 'അപ്‌ടൈം' : 'Uptime'}:</span>
              <span className="text-gray-900 font-mono">
                {Math.floor(health.uptimeSeconds / 3600)}h {Math.floor((health.uptimeSeconds % 3600) / 60)}m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{ml ? 'പതിപ്പ്' : 'Version'}:</span>
              <span className="text-gray-900 font-mono text-sm">{health.version}</span>
            </div>
          </div>
        ) : (
          <p className="text-red-600">{ml ? 'ലോഡ് ചെയ്യാൻ കഴിയുന്നില്ല' : 'Failed to load'}</p>
        )}
      </div>

      {/* System Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {ml ? 'സിസ്റ്റം മെട്രിക്സ്' : 'System Metrics'}
        </h2>
        {system ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">{ml ? 'മെമോറി' : 'Memory'}:</span>
                <span className="text-sm font-mono">
                  {system.memory.heapUsedMB}/{system.memory.heapTotalMB} MB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-teal-600 h-2 rounded"
                  style={{ width: `${(system.memory.heapUsedMB / system.memory.heapTotalMB) * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">{ml ? 'സിപിയു' : 'CPUs'}:</span>
                <span className="ml-2 font-mono">{system.cpuCount}</span>
              </div>
              <div>
                <span className="text-gray-600">{ml ? 'ലോഡ് (1m)' : 'Load (1m)'}:</span>
                <span className="ml-2 font-mono">{system.loadavg[0].toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">{ml ? 'Node' : 'Node'}:</span>
                <span className="ml-2 font-mono text-xs">{system.nodeVersion}</span>
              </div>
              <div>
                <span className="text-gray-600">{ml ? 'സിസ്റ്റം സ്വതന്ത്ര' : 'Free (OS)'}:</span>
                <span className="ml-2 font-mono">{system.freeMemMB} MB</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-600">{ml ? 'ലോഡ് ചെയ്യാൻ കഴിയുന്നില്ല' : 'Failed to load'}</p>
        )}
      </div>

      {/* Database Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {ml ? 'ഡാറ്റാബേസ് മെട്രിക്സ്' : 'Database Metrics'}
        </h2>
        {db ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">{ml ? 'പിംഗ്' : 'Ping'}:</span>
                <span className="ml-2 font-mono">{db.pingMs}ms</span>
              </div>
              <div>
                <span className="text-gray-600">{ml ? 'സജീവ കണക്ഷനുകൾ' : 'Active Conns'}:</span>
                <span className="ml-2 font-mono">{db.activeConnections}</span>
              </div>
              <div>
                <span className="text-gray-600">{ml ? 'നിഷ്‌ക്രിയ കണക്ഷനുകൾ' : 'Idle Conns'}:</span>
                <span className="ml-2 font-mono">{db.idleConnections}</span>
              </div>
            </div>
            {db.longestRunningQueries && db.longestRunningQueries.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {ml ? 'വേഗതയേറിയ ക്വെരികൾ' : 'Long Running Queries'}
                </h3>
                <div className="space-y-1 text-xs">
                  {db.longestRunningQueries.map((q, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-500 truncate flex-1">{q.query || 'N/A'}</span>
                      <span className="font-mono text-gray-600 ml-2">{q.durationSeconds?.toFixed(1)}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {db.largestTables && db.largestTables.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {ml ? 'വലിയ പട്ടികകൾ' : 'Largest Tables'}
                </h3>
                <div className="space-y-1 text-xs">
                  {db.largestTables.slice(0, 5).map((tbl, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-600">{tbl.name}</span>
                      <span className="font-mono text-gray-600">{tbl.sizeMB} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-600">{ml ? 'ലോഡ് ചെയ്യാൻ കഴിയുന്നില്ല' : 'Failed to load'}</p>
        )}
      </div>

      {/* Jobs Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {ml ? 'ജോബ് സ്ഥിതി' : 'Job Status'}
        </h2>
        {jobs ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{ml ? 'കാത്തിരിപ്പിലുള്ള അലർട്ടുകൾ' : 'Pending Alerts'}:</span>
              <span className="font-mono font-semibold text-lg">{jobs.pendingAlerts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{ml ? 'കാത്തിരിപ്പിലുള്ള റിമൈന്ദറുകൾ' : 'Pending Reminders'}:</span>
              <span className="font-mono font-semibold text-lg">{jobs.pendingReminders}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-gray-600 font-semibold">{ml ? 'മൊത്തം' : 'Total'} ({jobs.source}):</span>
              <span className="font-mono font-bold text-lg">{jobs.total}</span>
            </div>
          </div>
        ) : (
          <p className="text-red-600">{ml ? 'ലോഡ് ചെയ്യാൻ കഴിയുന്നില്ല' : 'Failed to load'}</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800 text-sm">{ml ? 'പിഴവ്' : 'Error'}: {error}</p>
        </div>
      )}
    </div>
  );
}
