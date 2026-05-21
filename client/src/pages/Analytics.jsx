import React, { useEffect, useState } from 'react';
import { getStats } from '../api';

export default function Analytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return <div style={{ padding: 40, color: '#5c5b72' }}>Loading…</div>;

  const total = Math.max(stats.total, 1);
  const STATUS_DATA = [
    { label: 'New', key: 'new', color: '#60a5fa' },
    { label: 'Contacted', key: 'contacted', color: '#fbbf24' },
    { label: 'Converted', key: 'converted', color: '#34d399' },
    { label: 'Lost', key: 'lost', color: '#f87171' }
  ];
  const maxSrc = Math.max(...(stats.bySources || []).map((s) => s.count), 1);

  const card = { background: '#16161a', border: '1px solid #2e2e38', borderRadius: 14, padding: '18px 20px' };

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Analytics</h1>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Leads', val: stats.total, color: '#f0eff4' },
          { label: 'Conversion Rate', val: `${Math.round((stats.byStatus?.converted||0)/total*100)}%`, color: '#34d399' },
          { label: 'Pipeline Value', val: `₹${((stats.converted?.totalValue||0)/100000).toFixed(1)}L`, color: '#a594ff' },
          { label: 'Avg Deal Size', val: `₹${(stats.converted?.avgValue||0).toLocaleString()}`, color: '#fbbf24' }
        ].map(({ label, val, color }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: 11, color: '#5c5b72', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'monospace' }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Status breakdown */}
        <div style={card}>
          <div style={{ fontSize: 11, color: '#5c5b72', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Lead Status Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {STATUS_DATA.map(({ label, key, color }) => {
              const count = stats.byStatus?.[key] || 0;
              const pct = Math.round(count / total * 100);
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: '#a09fb8' }}>{label}</span>
                    <span style={{ color: '#5c5b72', fontFamily: 'monospace' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#1e1e24', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top sources */}
        <div style={card}>
          <div style={{ fontSize: 11, color: '#5c5b72', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>Top Lead Sources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(stats.bySources || []).slice(0, 6).map(({ source, count }) => (
              <div key={source}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                  <span style={{ color: '#a09fb8' }}>{source}</span>
                  <span style={{ color: '#5c5b72', fontFamily: 'monospace' }}>{count}</span>
                </div>
                <div style={{ height: 5, background: '#1e1e24', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round(count/maxSrc*100)}%`, background: '#7c6af7', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
