import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { signOut(); navigate("/login"); };

  const navItem = (to, icon, label, end = false, badge = null) => (
    <NavLink to={to} end={end} style={({ isActive }) => ({
      display:"flex", alignItems:"center", gap:10, padding:"8px 12px",
      borderRadius:8, marginBottom:2, fontSize:13, fontWeight:500,
      textDecoration:"none", color: isActive ? "var(--accent2)" : "var(--text2)",
      background: isActive ? "var(--accent-bg)" : "transparent", transition:"all .15s"
    })}>
      <span style={{ fontSize:16 }}>{icon}</span>
      {!collapsed && <span style={{ flex:1 }}>{label}</span>}
      {!collapsed && badge != null && (
        <span style={{ fontSize:10, fontWeight:700, background:"var(--accent)", color:"#fff", padding:"1px 7px", borderRadius:20, fontFamily:"'DM Mono',monospace" }}>{badge}</span>
      )}
    </NavLink>
  );

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? 56 : 220, flexShrink:0, background:"var(--bg2)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", transition:"width .2s" }}>
        
        {/* Logo */}
        <div style={{ padding:"18px 14px 14px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"var(--accent)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>⚡</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize:14, fontWeight:700, letterSpacing:"-0.02em" }}>LeadFlow</div>
              <div style={{ fontSize:10, color:"var(--text3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>CRM</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ marginLeft:"auto", background:"none", border:"none", color:"var(--text3)", cursor:"pointer", fontSize:18, lineHeight:1 }}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
          <div style={{ fontSize:10, color:"var(--text3)", fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 12px 8px" }}>{!collapsed && "Workspace"}</div>
          {navItem("/", "📋", "All Leads", true)}
          {navItem("/pipeline",  "🏗️", "Pipeline")}
          {navItem("/analytics", "📊", "Analytics")}
        </nav>

        {/* Footer */}
        <div style={{ padding:"10px 8px", borderTop:"1px solid var(--border)" }}>
          <div style={{ background:"var(--bg3)", borderRadius:10, padding:"10px 12px", display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={handleLogout}>
            <div style={{ width:28, height:28, background:"var(--accent-bg)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"var(--accent2)", flexShrink:0 }}>
              {user?.name?.[0] || "A"}
            </div>
            {!collapsed && (
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name || "Admin"}</div>
                <div style={{ fontSize:10, color:"var(--text3)" }}>Sign out</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflow:"auto", display:"flex", flexDirection:"column" }}>
        <Outlet />
      </main>
    </div>
  );
}
