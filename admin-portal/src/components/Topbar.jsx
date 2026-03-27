import React, { useState, useEffect } from 'react';
import { Bell, Plus, Search, Globe, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const Topbar = ({ title }) => {
  const { user, branch, switchBranch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchBranches();
    }
  }, [user]);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch (err) {
      console.error('Failed to fetch branches');
    }
  };

  return (
    <header className="topbar glass-morphism">
      <div>
        <h1 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{title || 'Dashboard'}</h1>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Welcome back to Language Academy</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            placeholder="Universal Search..." 
            style={{
              padding: '0.6rem 1rem 0.6rem 2.5rem',
              background: 'var(--glass)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'white',
              width: '250px'
            }}
          />
        </div>

        {user?.role === 'super_admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-glow)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
            <Globe size={16} color="var(--primary)" />
            <select 
              value={branch || 'all'}
              onChange={(e) => switchBranch(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: '600',
                fontSize: '0.8rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all" style={{ background: '#0f172a' }}>Global (All Branches)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#0f172a' }}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div 
            className="glass-morphism" 
            style={{ padding: '0.6rem', borderRadius: '50%', cursor: 'pointer' }}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </div>
          <div className="glass-morphism" style={{ padding: '0.6rem', borderRadius: '50%', cursor: 'pointer' }}>
            <Plus size={18} />
          </div>
          <div className="glass-morphism" style={{ padding: '0.6rem', borderRadius: '50%', cursor: 'pointer', position: 'relative' }}>
            <Bell size={18} />
            <span style={{ 
              position: 'absolute', 
              top: '0', 
              right: '0', 
              width: '8px', 
              height: '8px', 
              background: 'var(--danger)', 
              borderRadius: '50%' 
            }}></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
