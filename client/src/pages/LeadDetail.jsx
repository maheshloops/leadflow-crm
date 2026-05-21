import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLead, updateLead, updateStatus, addNote, generateFollowup, deleteLead } from '../api';

const STATUSES = ['new','contacted','converted','lost'];
const STATUS_COLORS = { new:'#60a5fa', contacted:'#fbbf24', converted:'#34d399', lost:'#f87171' };

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [aiEmail, setAiEmail] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await getLead(id);
    setLead(data);
    setForm({ first: data.first, last: data.last, email: data.email, phone: data.phone, company: data.company, source: data.source, status: data.status, value: data.value });
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (status) => {
    await updateStatus(id, status);
    load();
  };

  const handleNote = async () => {
    if (!noteText.trim()) return;
    await addNote(id, noteText.trim());
    setNoteText('');
    load();
  };

  const handleAI = async () => {
    setAiLoading(true);
    setAiEmail('');
    try {
      const { email } = await generateFollowup(id);
      setAiEmail(email);
    } finally { setAiLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLead(id, { ...form, value: parseInt(form.value) || 0 });
      setEditing(false);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this lead permanently?')) return;
    await deleteLead(id);
    navigate('/');
  };

  if (!lead) return <div style={{ padding: 40, color: '#5c5b72' }}>Loading…</div>;

  const labelStyle = { fontSize: 11, color: '#5c5b72', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, display: 'block' };
  const inputStyle = { background: '#1e1e24', border: '1px solid #2e2e38', borderRadius: 8, padding: '7px 11px', fontSize: 13, color: '#f0eff4', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'system-ui' };
  const cardStyle = { background: '#16161a', border: '1px solid #2e2e38', borderRadius: 14, padding: '18px 20px', marginBottom: 16 };

  return (
    <div style={{ padding: '24px 28px', fontFamily: 'system-ui, sans-serif', maxWidth: 760 }}>
      {/* Back */}
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#5c5b72', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>← Back to leads</button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, background: 'rgba(124,106,247,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#a594ff' }}>
            {lead.first[0]}{lead.last[0]}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{lead.first} {lead.last}</h1>
            <div style={{ fontSize: 13, color: '#5c5b72', marginTop: 2 }}>{lead.company} · {lead.source}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditing(!editing)} style={{ padding: '7px 14px', borderRadius: 8, background: editing ? '#7c6af7' : 'transparent', border: '1px solid #2e2e38', color: editing ? '#fff' : '#a09fb8', cursor: 'pointer', fontSize: 13 }}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={handleDelete} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', fontSize: 13 }}>Delete</button>
        </div>
      </div>

      {/* Status */}
      <div style={cardStyle}>
        <label style={labelStyle}>Status</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', background: lead.status === s ? STATUS_COLORS[s] + '22' : 'transparent', color: STATUS_COLORS[s], borderColor: lead.status === s ? STATUS_COLORS[s] : '#2e2e38' }}
            >
              {s}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#34d399', padding: '6px 12px', background: 'rgba(52,211,153,0.08)', borderRadius: 20, fontFamily: 'monospace' }}>₹{lead.value?.toLocaleString()}</span>
        </div>
      </div>

      {/* Details (edit or view) */}
      <div style={cardStyle}>
        <label style={labelStyle}>Contact Details</label>
        {editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['first','First'],['last','Last'],['email','Email'],['phone','Phone'],['company','Company'],['value','Value ₹']].map(([k, lbl]) => (
              <div key={k} style={k==='email'?{gridColumn:'1/-1'}:{}}>
                <label style={labelStyle}>{lbl}</label>
                <input style={inputStyle} value={form[k]||''} onChange={(e) => setForm(f => ({...f,[k]:e.target.value}))} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, background: '#7c6af7', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {[['Email', lead.email],['Phone', lead.phone||'—'],['Company', lead.company||'—'],['Source', lead.source],['Created', new Date(lead.createdAt).toLocaleDateString('en-IN')]].map(([k, v]) => (
                <tr key={k}>
                  <td style={{ color: '#5c5b72', padding: '7px 0', width: 100 }}>{k}</td>
                  <td style={{ color: '#f0eff4', padding: '7px 0', fontFamily: k==='Email'?'monospace':'inherit' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* AI Follow-up */}
      <div style={cardStyle}>
        <label style={labelStyle}>AI Follow-up Generator</label>
        <button
          onClick={handleAI}
          disabled={aiLoading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)', borderRadius: 10, cursor: aiLoading ? 'default' : 'pointer', textAlign: 'left' }}
        >
          <div style={{ width: 32, height: 32, background: '#7c6af7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>✨</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#a594ff' }}>{aiLoading ? 'Generating email…' : 'Generate personalized follow-up email'}</div>
            <div style={{ fontSize: 11, color: '#5c5b72', marginTop: 2 }}>Claude AI writes a tailored outreach for this lead</div>
          </div>
        </button>
        {aiEmail && (
          <pre style={{ marginTop: 12, background: '#1e1e24', border: '1px solid #2e2e38', borderRadius: 10, padding: 14, fontSize: 12, color: '#a09fb8', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'system-ui' }}>
            {aiEmail}
          </pre>
        )}
      </div>

      {/* Notes */}
      <div style={cardStyle}>
        <label style={labelStyle}>Notes & Follow-ups ({lead.notes?.length || 0})</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {lead.notes?.map((note, i) => (
            <div key={i} style={{ background: '#1e1e24', border: '1px solid #2e2e38', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: '#5c5b72', fontFamily: 'monospace', marginBottom: 6 }}>{new Date(note.createdAt).toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 13, color: '#a09fb8', lineHeight: 1.55 }}>{note.text}</div>
            </div>
          ))}
          {!lead.notes?.length && <div style={{ fontSize: 12, color: '#5c5b72' }}>No notes yet. Add your first follow-up note below.</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note or follow-up action…"
            style={{ ...inputStyle, flex: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && handleNote()}
          />
          <button onClick={handleNote} style={{ padding: '7px 16px', borderRadius: 8, background: '#7c6af7', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontSize: 13 }}>Add</button>
        </div>
      </div>
    </div>
  );
}
