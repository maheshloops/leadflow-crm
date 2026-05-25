import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLead, updateLead, updateStatus, addNote, generateFollowup, deleteLead } from "../api";

const STATUSES = ["new","contacted","converted","lost"];
const S_COLOR  = { new:"var(--blue)", contacted:"var(--amber)", converted:"var(--green)", lost:"var(--red)" };
const S_BG     = { new:"var(--blue-bg)", contacted:"var(--amber-bg)", converted:"var(--green-bg)", lost:"var(--red-bg)" };

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead]       = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [noteText, setNoteText] = useState("");
  const [aiEmail, setAiEmail] = useState("");
  const [aiLoad, setAiLoad]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = async () => {
    const data = await getLead(id);
    setLead(data);
    setForm({ first:data.first, last:data.last, email:data.email, phone:data.phone, company:data.company, source:data.source, status:data.status, value:data.value });
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (status) => {
    await updateStatus(id, status); load(); showToast(`Status → ${status}`);
  };

  const handleSave = async () => {
    setSaving(true);
    try { await updateLead(id, { ...form, value: parseInt(form.value)||0 }); setEditing(false); load(); showToast("Lead updated!"); }
    catch { showToast("Error saving", "error"); }
    finally { setSaving(false); }
  };

  const handleNote = async () => {
    if (!noteText.trim()) return;
    await addNote(id, noteText.trim()); setNoteText(""); load(); showToast("Note saved");
  };

  const handleAI = async () => {
    setAiLoad(true); setAiEmail("");
    try { const { email } = await generateFollowup(id); setAiEmail(email); }
    catch (err) { setAiEmail(err.response?.data?.error || "AI unavailable — check ANTHROPIC_API_KEY in .env"); }
    finally { setAiLoad(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this lead permanently?")) return;
    await deleteLead(id); navigate("/");
  };

  if (!lead) return <div style={{ padding:40, color:"var(--text3)" }}>Loading…</div>;

  const initials = lead.first[0] + (lead.last[0] || "");

  return (
    <div style={{ padding:"24px 28px", maxWidth:780 }}>
      {/* Back */}
      <button onClick={() => navigate("/")} style={{ background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:13, marginBottom:18, padding:0, display:"flex", alignItems:"center", gap:6 }}>
        ← Back to leads
      </button>

      {/* Hero header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          <div style={{ width:52, height:52, background:"var(--accent-bg)", border:"1px solid rgba(124,106,247,0.2)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"var(--accent2)", flexShrink:0 }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.02em" }}>{lead.first} {lead.last}</h1>
            <div style={{ fontSize:13, color:"var(--text3)", marginTop:3 }}>
              {lead.company && <><span style={{ color:"var(--text2)" }}>{lead.company}</span> · </>}
              {lead.source}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setEditing(!editing)} style={{ padding:"7px 16px", borderRadius:8, background: editing?"var(--accent)":"transparent", border:"1px solid var(--border)", color: editing?"#fff":"var(--text2)", cursor:"pointer", fontSize:13, fontWeight:500 }}>
            {editing ? "Cancel edit" : "✏ Edit"}
          </button>
          <button onClick={handleDelete} style={{ padding:"7px 14px", borderRadius:8, background:"var(--red-bg)", border:"1px solid rgba(248,113,113,0.2)", color:"var(--red)", cursor:"pointer", fontSize:13 }}>Delete</button>
        </div>
      </div>

      {/* Status strip */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"16px 20px", marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Pipeline Status</div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => handleStatusChange(s)} style={{
              padding:"7px 18px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer",
              border:"1px solid", fontFamily:"'DM Sans',sans-serif",
              background: lead.status===s ? S_BG[s] : "transparent",
              color: S_COLOR[s],
              borderColor: lead.status===s ? S_COLOR[s] : "var(--border)",
              opacity: lead.status===s ? 1 : 0.6
            }}>{s}</button>
          ))}
          <span style={{ marginLeft:"auto", fontSize:13, color:"var(--green)", background:"var(--green-bg)", padding:"4px 14px", borderRadius:20, fontFamily:"'DM Mono',monospace" }}>
            ₹{(lead.value||0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Details card */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"18px 20px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Contact Details</div>
          {editing && <button onClick={handleSave} disabled={saving} style={{ padding:"5px 14px", borderRadius:7, background:"var(--accent)", border:"none", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>{saving?"Saving…":"Save"}</button>}
        </div>
        {editing ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[["first","First"],["last","Last"],["email","Email"],["phone","Phone"],["company","Company"],["value","Value ₹"]].map(([k,l]) => (
              <div key={k} style={k==="email"||k==="company"?{gridColumn:"1/-1"}:{}}>
                <label style={lbl}>{l}</label>
                <input style={inp} value={form[k]||""} onChange={(e)=>setForm(f=>({...f,[k]:e.target.value}))} />
              </div>
            ))}
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <tbody>
              {[["Email",lead.email,true],["Phone",lead.phone||"—",false],["Company",lead.company||"—",false],["Source",lead.source,false],["Created",new Date(lead.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}),false]].map(([k,v,mono]) => (
                <tr key={k} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{ padding:"9px 0", color:"var(--text3)", fontSize:12, width:100 }}>{k}</td>
                  <td style={{ padding:"9px 0", fontSize:13, color: mono?"var(--accent2)":"var(--text2)", fontFamily: mono?"'DM Mono',monospace":"inherit" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* AI follow-up */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"18px 20px", marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>AI Follow-up Generator</div>
        <button onClick={handleAI} disabled={aiLoad} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"var(--accent-bg)", border:"1px solid rgba(124,106,247,0.25)", borderRadius:"var(--radius)", cursor: aiLoad?"default":"pointer", textAlign:"left", transition:"all .15s" }}>
          <div style={{ width:34, height:34, background:"var(--accent)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>✨</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--accent2)" }}>{aiLoad ? "Writing email…" : "Generate personalized follow-up email"}</div>
            <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>Claude writes a tailored outreach based on this lead's profile</div>
          </div>
        </button>
        {aiLoad && (
          <div style={{ display:"flex", gap:5, padding:"16px 0 4px" }}>
            {[0,200,400].map((d) => (
              <div key={d} style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent)", animation:`bounce 1.2s ${d}ms infinite` }} />
            ))}
          </div>
        )}
        {aiEmail && !aiLoad && (
          <pre style={{ marginTop:12, background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"14px 16px", fontSize:12, color:"var(--text2)", whiteSpace:"pre-wrap", lineHeight:1.65, fontFamily:"'DM Mono',monospace", overflowX:"auto" }}>
            {aiEmail}
          </pre>
        )}
      </div>

      {/* Notes */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"18px 20px" }}>
        <div style={{ fontSize:11, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:14 }}>
          Notes & Follow-ups ({lead.notes?.length || 0})
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
          {lead.notes?.length ? lead.notes.map((n, i) => (
            <div key={i} style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"12px 14px" }}>
              <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"'DM Mono',monospace", marginBottom:6 }}>
                {new Date(n.createdAt).toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.6 }}>{n.text}</div>
            </div>
          )) : (
            <div style={{ fontSize:12, color:"var(--text3)", padding:"8px 0" }}>No notes yet. Add your first follow-up below.</div>
          )}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <input
            value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note or follow-up action…"
            onKeyDown={(e) => e.key==="Enter" && handleNote()}
            style={{ ...inp, flex:1 }}
          />
          <button onClick={handleNote} style={{ padding:"8px 18px", borderRadius:8, background:"var(--accent)", border:"none", color:"#fff", fontWeight:600, cursor:"pointer", fontSize:13, flexShrink:0 }}>Add</button>
        </div>
      </div>

      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, background:"var(--bg2)", border:"1px solid var(--border)", borderLeft:`3px solid ${toast.type==="error"?"var(--red)":"var(--green)"}`, borderRadius:10, padding:"12px 18px", fontSize:13, color:"var(--text)", zIndex:9999 }}>
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

const lbl = { display:"block", fontSize:11, fontWeight:500, color:"var(--text3)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6 };
const inp = { width:"100%", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", fontSize:13, color:"var(--text)", outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif" };
