import React, { useEffect, useState } from "react";
import { getStats } from "../api";

const S_COLOR = { new:"var(--blue)", contacted:"var(--amber)", converted:"var(--green)", lost:"var(--red)" };

function Bar({ label, value, total, color, mono }) {
  const pct = Math.round(value / Math.max(total,1) * 100);
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:13, color:"var(--text2)" }}>{label}</span>
        <span style={{ fontSize:12, color:"var(--text3)", fontFamily: mono?"'DM Mono',monospace":"inherit" }}>{mono ? value : `${value} (${pct}%)`}</span>
      </div>
      <div style={{ height:6, background:"var(--bg3)", borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color||"var(--accent)", borderRadius:3, transition:"width .6s ease" }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [stats, setStats] = useState(null);
  useEffect(() => { getStats().then(setStats); }, []);
  if (!stats) return <div style={{ padding:40, color:"var(--text3)" }}>Loading…</div>;

  const total    = Math.max(stats.total, 1);
  const convRate = Math.round((stats.byStatus?.converted||0)/total*100);
  const maxSrc   = Math.max(...(stats.bySources||[]).map((s)=>s.count), 1);

  const card = { background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"18px 20px" };

  return (
    <div style={{ padding:"24px 28px" }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:20, fontWeight:700, letterSpacing:"-0.02em" }}>Analytics</h1>
        <div style={{ fontSize:13, color:"var(--text3)", marginTop:2 }}>Pipeline health and lead source performance</div>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        {[
          { label:"Total Leads",    value:stats.total,                     color:"var(--text)" },
          { label:"Conversion Rate",value:`${convRate}%`,                  color:"var(--green)" },
          { label:"Pipeline Value", value:`₹${((stats.converted?.totalValue||0)/100000).toFixed(1)}L`, color:"var(--accent2)" },
          { label:"Avg Deal Size",  value:`₹${(stats.converted?.avgValue||0).toLocaleString()}`, color:"var(--amber)" }
        ].map(({ label, value, color }) => (
          <div key={label} style={card}>
            <div style={{ fontSize:11, color:"var(--text3)", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>{label}</div>
            <div style={{ fontSize:24, fontWeight:700, color, fontFamily:"'DM Mono',monospace", letterSpacing:"-0.02em" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Status breakdown */}
        <div style={card}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:18 }}>Lead Status</div>
          {["new","contacted","converted","lost"].map((s) => (
            <Bar key={s} label={s.charAt(0).toUpperCase()+s.slice(1)} value={stats.byStatus?.[s]||0} total={total} color={S_COLOR[s]} />
          ))}
        </div>

        {/* Sources */}
        <div style={card}>
          <div style={{ fontSize:11, color:"var(--text3)", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:18 }}>Top Lead Sources</div>
          {(stats.bySources||[]).slice(0,7).map(({ source, count }) => (
            <Bar key={source} label={source} value={count} total={maxSrc} color="var(--accent)" mono />
          ))}
        </div>
      </div>

      {/* Conversion funnel */}
      <div style={card}>
        <div style={{ fontSize:11, color:"var(--text3)", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:18 }}>Conversion Funnel</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:120 }}>
          {["new","contacted","converted","lost"].map((s) => {
            const count = stats.byStatus?.[s]||0;
            const h = Math.max(8, Math.round(count/total*100));
            return (
              <div key={s} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                <div style={{ fontSize:14, fontWeight:700, color:S_COLOR[s], fontFamily:"'DM Mono',monospace" }}>{count}</div>
                <div style={{ width:"100%", height:`${h}%`, background:S_COLOR[s], borderRadius:"6px 6px 0 0", opacity:0.8, minHeight:8, transition:"height .5s" }} />
                <div style={{ fontSize:11, color:"var(--text3)", textAlign:"center" }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
