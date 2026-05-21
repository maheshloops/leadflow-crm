import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@leadflow.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      signIn(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f11', fontFamily: 'system-ui, sans-serif' },
    card: { background: '#16161a', border: '1px solid #2e2e38', borderRadius: 16, padding: '36px 32px', width: 360 },
    title: { fontSize: 22, fontWeight: 700, color: '#f0eff4', marginBottom: 4 },
    sub: { fontSize: 13, color: '#5c5b72', marginBottom: 28 },
    label: { display: 'block', fontSize: 11, fontWeight: 500, color: '#5c5b72', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 },
    input: { width: '100%', background: '#1e1e24', border: '1px solid #2e2e38', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#f0eff4', fontFamily: 'system-ui', outline: 'none', boxSizing: 'border-box' },
    btn: { width: '100%', background: '#7c6af7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 20, opacity: loading ? 0.7 : 1 },
    error: { color: '#f87171', fontSize: 12, marginTop: 12, background: 'rgba(248,113,113,0.08)', borderRadius: 8, padding: '8px 12px' }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.title}>⚡ LeadFlow CRM</div>
        <div style={s.sub}>Sign in to your workspace</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          {error && <div style={s.error}>{error}</div>}
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>
      </div>
    </div>
  );
}
