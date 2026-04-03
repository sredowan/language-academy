import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import '../styles/GlobalStyles.css';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@renetech.com');
  const [password, setPassword] = useState('Redowan173123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the backend at port 5000. Start the API server and try again.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at 0% 0%, #32619A 0%, #010203 50%, #010203 100%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Decorative Glow */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(149, 192, 77, 0.05)', filter: 'blur(120px)', borderRadius: '50%' }}></div>

      <div className="glass-morphism" style={{ padding: '3.5rem', width: '100%', maxWidth: '480px', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontWeight: '900', fontSize: '1.5rem', color: '#fff', boxShadow: '0 8px 32px rgba(50, 97, 154, 0.4)' }}>LA</div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '2.2rem', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', margin: 0 }}>LANGUAGE ACADEMY</h1>
          <p style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Executive Cloud Infrastructure</p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.08)', 
            color: 'var(--danger)', 
            padding: '1rem', 
            borderRadius: 'var(--radius)', 
            marginBottom: '2rem',
            fontSize: '0.8rem',
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.6rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Corporate Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="email" 
                placeholder="name@languageacademy.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-input"
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem 0.9rem 3rem',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access Key</label>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600' }}>Forgot?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="password" 
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass-input"
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem 0.9rem 3rem',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ 
              padding: '1.1rem', 
              fontSize: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.8rem',
              marginTop: '0.5rem',
              width: '100%',
              borderRadius: '12px'
            }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Authorize Access'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.7rem', color: 'var(--text-dim)', opacity: 0.6 }}>
          <p>Secure Enterprise Gateway</p>
          <p style={{ marginTop: '0.3rem' }}>© 2026 Language Academy HQ</p>
        </div>
      </div>
    </div>
  );

};

export default LoginPage;
