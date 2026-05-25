import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getLeads, getStats, createLead, deleteLead, updateStatus } from "../api";

const SOURCES  = ["Website Form","LinkedIn","Referral","Cold Email","Google Ads","Instagram","Demo Request"];
const STATUSES = ["new","contacted","converted","lost"];
const S_COLOR  = { new:"var(--blue)", contacted:"var(--amber)", converted:"var(--green)", lost:"var(--red)" };
const S_BG     = { new:"var(--blue-bg)", contacted:"var(--amber-bg)", converted:"var(--green-bg)", lost:"var(--red-bg)" };
const EMPTY    = { first:"",last:"",email:"",phone:"",company:"",source:"Website Form",status:"new",value:"" };

function Badge({ status }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:S_BG[status], color:S_COLOR[status], textTransform:"uppercase", letterSpacing:"0.04em" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:S_COLOR[status] }} />
      {status}
    </span>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"16px 20px" }}>
      <div style={{ fontSize:11, color:"var(--text3)", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:700, color: color||"var(--text)", fontFamily:"'DM Mono',monospace", letterSpacing:"-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [leads, setLeads]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);
  const navigate = useNavigate();

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    const params = {};
    if (filter !== "all") params.status = filter;
    if (search) params.search = search;
    const [ld, st] = await Promise.all([getLeads(params), getStats()]);
    setLeads(ld.leads); setStats(st);
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await createLead({ ...form, value: parseInt(form.value) || 0 });
      setForm(EMPTY); setShowAdd(false); load(); showToast("Lead added!");
    } catch (err) { showToast(err.response?.data?.error || "Error creating lead", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this lead?")) return;
    await deleteLead(id); load(); showToast("Lead deleted", "error");
  };

  const handleStatus = async (id, status, e) => {
    e.stopPropagation();
    await updateStatus(id, status); load();
  };

  const convRate = stats ? Math.round((stats.byStatus?.converted||0)/Math.max(stats.total,1)*100) : 0;

  return (
    <div style={{ padding:"24px 28px", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.02em" }}>Lead Management</h1>
          <div style={{ fontSize:13, color:"var(--text3)", marginTop:2 }}>Track, manage and convert your leads</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", background:"var(--accent)", border:"none", borderRadius:"var(--radius)", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          + Add Lead
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          <StatCard label="Total Leads"    value={stats.total}              color="var(--text)"    sub="All time" />
          <StatCard label="New"            value={stats.byStatus?.new||0}   color="var(--blue)"    sub="Awaiting contact" />
          <StatCard label="Converted"      value={stats.byStatus?.converted||0} color="var(--green)" sub={`${convRate}% rate`} />
          <StatCard label="Pipeline Value" value={`₹${((stats.converted?.totalValue||0)/1000).toFixed(0)}K`} color="var(--accent2)" sub="Converted deals" />
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ position:"relative", marginRight:4 }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", fontSize:14 }}>🔍</span>
          <input
            placeholder="Search leads…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"7px 12px 7px 32px", fontSize:13, color:"var(--text)", outline:"none", width:220, transition:"border .15s" }}
          />
        </div>
        {["all",...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            display:"flex", alignItems:"center", gap:5, padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:500,
            cursor:"pointer", border:"1px solid", fontFamily:"'DM Sans',sans-serif",
            background: filter===s ? (s==="all"?"var(--accent)":S_BG[s]) : "transparent",
            color: filter===s ? (s==="all"?"#fff":S_COLOR[s]) : "var(--text2)",
            borderColor: filter===s ? (s==="all"?"var(--accent)":`${S_COLOR[s]}40`) : "var(--border)"
          }}>
            {s!=="all" && <span style={{ width:6,height:6,borderRadius:"50%",background:S_COLOR[s] }} />}
            {s==="all" ? "All leads" : s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:12, color:"var(--text3)" }}>{leads.length} result{leads.length!==1?"s":""}</span>
      </div>

      {/* Table */}
      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", overflow:"hidden" }}>
        {/* Head */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1.8fr 1.2fr 1.3fr 1fr 90px", padding:"10px 20px", borderBottom:"1px solid var(--border)", gap:12 }}>
          {["Name / Email","Company","Source","Status","Created",""].map((h) => (
            <div key={h} style={{ fontSize:11, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</div>
          ))}
        </div>
        {/* Rows */}
        {leads.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text3)" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>📭</div>
            <div style={{ fontSize:14, fontWeight:500 }}>No leads found</div>
            <div style={{ fontSize:12, marginTop:4 }}>Try adjusting your filters or add a new lead</div>
          </div>
        ) : leads.map((l, i) => (
          <div key={l._id} onClick={() => navigate(`/leads/${l._id}`)}
            style={{ display:"grid", gridTemplateColumns:"2fr 1.8fr 1.2fr 1.3fr 1fr 90px", padding:"13px 20px", borderBottom: i<leads.length-1?"1px solid var(--border)":"none", gap:12, alignItems:"center", cursor:"pointer", transition:"background .12s" }}
            onMouseEnter={(e) => e.currentTarget.style.background="var(--bg3)"}
            onMouseLeave={(e) => e.currentTarget.style.background="transparent"}
          >
            <div>
              <div style={{ fontSize:13, fontWeight:500 }}>{l.first} {l.last}</div>
              <div style={{ fontSize:11, color:"var(--text3)", fontFamily:"'DM Mono',monospace", marginTop:2 }}>{l.email}</div>
            </div>
            <div>
              <div style={{ fontSize:13, color:"var(--text2)" }}>{l.company||"—"}</div>
              {l.value > 0 && <div style={{ fontSize:11, color:"var(--green)", fontFamily:"'DM Mono',monospace", marginTop:2 }}>₹{l.value.toLocaleString()}</div>}
            </div>
            <div style={{ fontSize:12, color:"var(--text2)" }}>{l.source}</div>
            <div>
              <select onClick={(e) => e.stopPropagation()} onChange={(e) => handleStatus(l._id, e.target.value, e)} value={l.status}
                style={{ background:"transparent", border:"none", cursor:"pointer", outline:"none", padding:0, color:"inherit", fontFamily:"inherit" }}>
                <option value="" disabled>—</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{ marginTop:4 }}><Badge status={l.status} /></div>
            </div>
            <div style={{ fontSize:11, color:"var(--text3)", fontFamily:"'DM Mono',monospace" }}>
              {new Date(l.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}
            </div>
            <div style={{ display:"flex", gap:6 }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => navigate(`/leads/${l._id}`)} style={actionBtn("#fff")}>View</button>
              <button onClick={(e) => handleDelete(l._id, e)} style={actionBtn("var(--red)")}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }} onClick={() => setShowAdd(false)}>
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", padding:28, width:520, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700 }}>Add New Lead</div>
                <div style={{ fontSize:12, color:"var(--text3)", marginTop:2 }}>Capture a new client lead</div>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:6, width:28, height:28, cursor:"pointer", color:"var(--text2)", fontSize:16 }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[["first","First Name","Priya"],["last","Last Name","Sharma"]].map(([k,l,ph]) => (
                  <div key={k}><label style={lbl}>{l}</label><input required style={inp} value={form[k]} onChange={(e)=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} /></div>
                ))}
                <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Email</label><input required type="email" style={inp} value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} placeholder="priya@company.com" /></div>
                <div><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91 98765 43210" /></div>
                <div><label style={lbl}>Company</label><input style={inp} value={form.company} onChange={(e)=>setForm(f=>({...f,company:e.target.value}))} placeholder="Company name" /></div>
                <div><label style={lbl}>Source</label>
                  <select style={sel} value={form.source} onChange={(e)=>setForm(f=>({...f,source:e.target.value}))}>
                    {SOURCES.map((s)=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Status</label>
                  <select style={sel} value={form.status} onChange={(e)=>setForm(f=>({...f,status:e.target.value}))}>
                    {STATUSES.map((s)=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Deal Value (₹)</label><input type="number" style={inp} value={form.value} onChange={(e)=>setForm(f=>({...f,value:e.target.value}))} placeholder="50000" /></div>
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:22 }}>
                <button type="button" onClick={()=>setShowAdd(false)} style={{ padding:"9px 18px", borderRadius:8, background:"transparent", border:"1px solid var(--border)", color:"var(--text2)", cursor:"pointer", fontSize:13 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:"9px 22px", borderRadius:8, background:"var(--accent)", border:"none", color:"#fff", fontWeight:600, cursor: saving?"not-allowed":"pointer", fontSize:13, opacity: saving?0.7:1 }}>
                  {saving ? "Adding…" : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, background:"var(--bg2)", border:"1px solid var(--border)", borderLeft:`3px solid ${toast.type==="error"?"var(--red)":"var(--green)"}`, borderRadius:10, padding:"12px 18px", fontSize:13, color:"var(--text)", zIndex:9999, boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

const lbl = { display:"block", fontSize:11, fontWeight:500, color:"var(--text3)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6 };
const inp = { width:"100%", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", fontSize:13, color:"var(--text)", outline:"none", boxSizing:"border-box" };
const sel = { ...inp, appearance:"none", cursor:"pointer" };
const actionBtn = (color) => ({ padding:"4px 10px", fontSize:11, fontWeight:500, background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:6, color, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" });
