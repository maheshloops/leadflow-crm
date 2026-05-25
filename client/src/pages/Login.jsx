import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [email, setEmail]       = useState("admin@leadflow.com");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { signIn }  = useAuth();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await login(email, password);
      signIn(data); navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      {/* Background accent */}
      <div style={{ position:"fixed", top:"-20%", left:"50%", transform:"translateX(-50%)", width:600, height:600, background:"radial-gradient(circle, rgba(124,106,247,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />

      <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:var_or(20), padding:"40px 36px", width:380, position:"relative" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <div style={{ width:40, height:40, background:"var(--accent)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>⚡</div>
          <div>
            <div style={{ fontSize:18, fontWeight:700, letterSpacing:"-0.02em" }}>LeadFlow CRM</div>
            <div style={{ fontSize:12, color:"var(--text3)" }}>Sign in to your workspace</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>Password</label>
            <input style={inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {error && (
            <div style={{ background:"var(--red-bg)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"var(--red)", marginBottom:16 }}>{error}</div>
          )}
          <button type="submit" disabled={loading} style={{ width:"100%", padding:"11px", background:"var(--accent)", border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition:"all .15s" }}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <div style={{ marginTop:20, padding:"12px 14px", background:"var(--bg3)", borderRadius:8, fontSize:12, color:"var(--text3)" }}>
          Default: <span style={{ color:"var(--accent2)", fontFamily:"'DM Mono',monospace" }}>admin@leadflow.com</span> / <span style={{ color:"var(--accent2)", fontFamily:"'DM Mono',monospace" }}>Admin@123</span>
          <div style={{ marginTop:4 }}>Run <code style={{ color:"var(--amber)", fontFamily:"'DM Mono',monospace" }}>node scripts/createAdmin.js</code> first</div>
        </div>
      </div>
    </div>
  );
}

const lbl = { display:"block", fontSize:11, fontWeight:500, color:"var(--text3)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6 };
const inp = { width:"100%", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"9px 12px", fontSize:13, color:"var(--text)", outline:"none", transition:"border .15s" };
function var_or(n){ return n; }
