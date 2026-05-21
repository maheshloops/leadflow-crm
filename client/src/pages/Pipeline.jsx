import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, updateStatus } from '../api';

const COLS = ['new','contacted','converted','lost'];
const COLORS = { new:'#60a5fa', contacted:'#fbbf24', converted:'#34d399', lost:'#f87171' };

export default function Pipeline() {
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const { leads } = await getLeads({ limit: 200 });
    setLeads(leads);
  };

  useEffect(() => { load(); }, []);

  const handleDrop = async (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId');
    await updateStatus(id, status);
    load();
  };

  const grouped = COLS.reduce((acc, s) => ({ ...acc, [s]: leads.filter((l) => l.status === s) }), {});

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Sales Pipeline</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {COLS.map((status) => (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            style={{ background: '#16161a', border: '1px solid #2e2e38', borderRadius: 14, overflow: 'hidden', minHeight: 300 }}
          >
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #2e2e38', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS[status], textTransform: 'uppercase', letterSpacing: '0.08em' }}>{status}</span>
              <span style={{ fontSize: 11, background: '#1e1e24', border: '1px solid #2e2e38', borderRadius: 20, padding: '1px 8px', color: '#5c5b72', fontFamily: 'monospace' }}>{grouped[status]?.length || 0}</span>
            </div>
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {grouped[status]?.map((lead) => (
                <div
                  key={lead._id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('leadId', lead._id)}
                  onClick={() => navigate(`/leads/${lead._id}`)}
                  style={{ background: '#1e1e24', border: '1px solid #2e2e38', borderRadius: 10, padding: '10px 12px', cursor: 'grab', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.border = `1px solid ${COLORS[status]}40`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.border = '1px solid #2e2e38'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{lead.first} {lead.last}</div>
                  <div style={{ fontSize: 11, color: '#5c5b72', marginBottom: 8 }}>{lead.company}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: '#5c5b72' }}>{lead.source}</span>
                    <span style={{ fontSize: 11, color: COLORS[status], fontFamily: 'monospace' }}>₹{(lead.value/1000).toFixed(0)}K</span>
                  </div>
                </div>
              ))}
              {!grouped[status]?.length && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#2e2e38', fontSize: 12 }}>Drop leads here</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#5c5b72', marginTop: 16 }}>💡 Drag and drop cards to update lead status</div>
    </div>
  );
}
