import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, getStats, createLead, deleteLead, updateStatus } from '../api';

const SOURCES = ['Website Form','LinkedIn','Referral','Cold Email','Google Ads','Instagram','Demo Request'];
const STATUSES = ['new','contacted','converted','lost'];
const STATUS_COLORS = { new: '#60a5fa', contacted: '#fbbf24', converted: '#34d399', lost: '#f87171' };

const EMPTY_FORM = { first:'', last:'', email:'', phone:'', company:'', source:'Website Form', status:'new', value:'' };

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const params = {};
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    const [leadsData, statsData] = await Promise.all([getLeads(params), getStats()]);
    setLeads(leadsData.leads);
    setStats(statsData);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createLead({ ...form, value: parseInt(form.value) || 0 });
      setForm(EMPTY_FORM);
      setShowAdd(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return;
    await deleteLead(id);
    load();
  };

  const handleStatusChange = async (id, status) => {
    await updateStatus(id, status);
    load();
  };

  const cs = (status) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: STATUS_COLORS[status] + '18', color: STATUS_COLORS[status]
  });

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Leads', val: stats.total, color: '#f0eff4' },
            { label: 'New', val: stats.byStatus?.new || 0, color: '#60a5fa' },
            { label: 'Converted', val: stats.byStatus?.converted || 0, color: '#34d399' },
            { label: 'Pipeline ₹', val: `₹${((stats.converted?.totalValue || 0)/1000).toFixed(0)}K`, color: '#a594ff' }
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: '#16161a', border: '1px solid #2e2e38', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: '#5c5b72', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: 'monospace' }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Search leads…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: '#1e1e24', border: '1px solid #2e2e38', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#f0eff4', width: 220, outline: 'none' }}
        />
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid', background: filter === s ? '#7c6af7' : 'transparent', color: filter === s ? '#fff' : '#a09fb8', borderColor: filter === s ? '#7c6af7' : '#2e2e38' }}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button
          onClick={() => setShowAdd(true)}
          style={{ marginLeft: 'auto', background: '#7c6af7', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          + Add Lead
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#16161a', border: '1px solid #2e2e38', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.2fr 1fr 100px', padding: '10px 18px', borderBottom: '1px solid #2e2e38', gap: 12 }}>
          {['Name', 'Company', 'Source', 'Status', 'Date', ''].map((h) => (
            <div key={h} style={{ fontSize: 11, fontWeight: 500, color: '#5c5b72', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
          ))}
        </div>
        {leads.map((lead) => (
          <div
            key={lead._id}
            style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.2fr 1fr 100px', padding: '13px 18px', borderBottom: '1px solid #1e1e24', gap: 12, alignItems: 'center', cursor: 'pointer', transition: 'background 0.12s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1e1e24'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={() => navigate(`/leads/${lead._id}`)}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.first} {lead.last}</div>
              <div style={{ fontSize: 11, color: '#5c5b72', fontFamily: 'monospace' }}>{lead.email}</div>
            </div>
            <div style={{ fontSize: 13, color: '#a09fb8' }}>{lead.company}</div>
            <div style={{ fontSize: 12, color: '#a09fb8' }}>{lead.source}</div>
            <div>
              <select
                style={cs(lead.status)}
                value={lead.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => { e.stopPropagation(); handleStatusChange(lead._id, e.target.value); }}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 11, color: '#5c5b72', fontFamily: 'monospace' }}>
              {new Date(lead.createdAt).toLocaleDateString('en-IN')}
            </div>
            <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => navigate(`/leads/${lead._id}`)} style={{ padding: '4px 8px', fontSize: 11, background: '#1e1e24', border: '1px solid #2e2e38', borderRadius: 6, color: '#a09fb8', cursor: 'pointer' }}>View</button>
              <button onClick={() => handleDelete(lead._id)} style={{ padding: '4px 8px', fontSize: 11, background: 'transparent', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, color: '#f87171', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#5c5b72' }}>No leads found. Add your first lead.</div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowAdd(false)}>
          <div style={{ background: '#16161a', border: '1px solid #2e2e38', borderRadius: 16, padding: 28, width: 500, maxWidth: '95vw' }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#f0eff4' }}>Add New Lead</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[['first','First Name','Priya'],['last','Last Name','Sharma'],['email','Email','priya@co.com'],['phone','Phone','+91...'],['company','Company','Company Inc'],['value','Deal Value ₹','50000']].map(([key,label,ph]) => (
                  <div key={key} style={key==='email'?{gridColumn:'1/-1'}:{}}>
                    <label style={{ display: 'block', fontSize: 11, color: '#5c5b72', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                    <input
                      value={form[key]}
                      onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                      required={['first','email'].includes(key)}
                      placeholder={ph}
                      style={{ width: '100%', background: '#1e1e24', border: '1px solid #2e2e38', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#f0eff4', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                {[['source','Source',SOURCES],['status','Status',STATUSES]].map(([key,label,opts]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 11, color: '#5c5b72', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
                    <select value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: '100%', background: '#1e1e24', border: '1px solid #2e2e38', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#f0eff4', outline: 'none', boxSizing: 'border-box' }}>
                      {opts.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid #2e2e38', color: '#a09fb8', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, background: '#7c6af7', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                  {saving ? 'Saving…' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
