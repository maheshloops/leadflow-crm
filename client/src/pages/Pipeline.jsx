import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLeads, updateStatus } from "../api";

const COLS   = ["new","contacted","converted","lost"];
const COLORS = { new:"var(--blue)", contacted:"var(--amber)", converted:"var(--green)", lost:"var(--red)" };
const ICONS  = { new:"🔵", contacted:"🟡", converted:"🟢", lost:"🔴" };

export default function Pipeline() {
  const [leads, setLeads]   = useState([]);
  const [dragOver, setDragOver] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    const { leads } = await getLeads({ limit:200 });
    setLeads(leads);
  };
  useEffect(() => { load(); }, []);

  const handleDrop = async (e, status) => {
    e.preventDefault(); setDragOver(null);
    const id = e.dataTransfer.getData("leadId");
    if (!id) return;
    await updateStatus(id, status); load();
  };

  const grouped = COLS.reduce((acc, s) => ({ ...acc, [s]: leads.filter((l) => l.status === s) }), {});
  const totalValue = (status) => grouped[status].reduce((s, l) => s + (l.value||0), 0);

  return (
    <div style={{ padding:"24px 28px" }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.02em" }}>Sales Pipeline</h1>
        <div style={{ fontSize:13, color:"var(--text3)", marginTop:2 }}>Drag cards between columns to update lead status</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {COLS.map((status) => (
          <div key={status}
            onDragOver={(e) => { e.preventDefault(); setDragOver(status); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, status)}
            style={{ background: dragOver===status?"var(--bg3)":"var(--bg2)", border:`1px solid ${dragOver===status?COLORS[status]+"40":"var(--border)"}`, borderRadius:"var(--radius-lg)", overflow:"hidden", minHeight:320, transition:"all .15s" }}
          >
            {/* Column header */}
            <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--border)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:11, fontWeight:700, color:COLORS[status], textTransform:"uppercase", letterSpacing:"0.09em" }}>
                  {ICONS[status]} {status}
                </span>
                <span style={{ fontSize:11, background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:20, padding:"1px 9px", color:"var(--text3)", fontFamily:"'DM Mono',monospace" }}>
                  {grouped[status]?.length || 0}
                </span>
              </div>
              {totalValue(status) > 0 && (
                <div style={{ fontSize:11, color:COLORS[status], fontFamily:"'DM Mono',monospace", opacity:0.8 }}>
                  ₹{(totalValue(status)/1000).toFixed(0)}K pipeline
                </div>
              )}
            </div>

            {/* Cards */}
            <div style={{ padding:"10px", display:"flex", flexDirection:"column", gap:8 }}>
              {grouped[status]?.map((lead) => (
                <div key={lead._id}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData("leadId", lead._id); }}
                  onClick={() => navigate(`/leads/${lead._id}`)}
                  style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"11px 13px", cursor:"grab", transition:"all .15s", userSelect:"none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor=`${COLORS[status]}50`; e.currentTarget.style.transform="translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="none"; }}
                >
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{lead.first} {lead.last}</div>
                  <div style={{ fontSize:11, color:"var(--text3)", marginBottom:8 }}>{lead.company||"—"}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:10, color:"var(--text3)", background:"var(--bg4)", padding:"2px 8px", borderRadius:20 }}>{lead.source}</span>
                    {lead.value>0 && <span style={{ fontSize:11, color:COLORS[status], fontFamily:"'DM Mono',monospace" }}>₹{(lead.value/1000).toFixed(0)}K</span>}
                  </div>
                  {lead.notes?.length > 0 && (
                    <div style={{ marginTop:8, fontSize:10, color:"var(--text3)" }}>📝 {lead.notes.length} note{lead.notes.length!==1?"s":""}</div>
                  )}
                </div>
              ))}
              {!grouped[status]?.length && (
                <div style={{ textAlign:"center", padding:"28px 0", color:"var(--border2)", fontSize:12, border:"1px dashed var(--border)", borderRadius:"var(--radius)", marginTop:4 }}>
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
