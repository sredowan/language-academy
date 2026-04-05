import React, { useState, useEffect } from 'react';
import { Bell, Plus, Search, Globe, Sun, Moon, Building2, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const Topbar = ({ title }) => {
  const { user, branch, switchBranch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (user?.role === 'super_admin' || user?.role === 'branch_admin') {
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

  // Resolve the current branch name and address
  const currentBranch = branches.find(b => b.id === branch) || null;
  const branchLabel = branch === 'all' || !branch
    ? 'Head Office (All Branches)'
    : currentBranch?.name || `Branch ${branch}`;
  const branchAddress = currentBranch?.address || '';

  return (
    <header className="topbar glass-morphism">
      <div>
        <h1 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Building2 size={18} color="var(--primary)" />
          Language Academy — {branchLabel}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2px' }}>
          {branchAddress && (
            <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <MapPin size={11} /> {branchAddress}
            </p>
          )}
          {!branchAddress && (
            <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', margin: 0 }}>
              {title || 'Dashboard'}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            style={{
              padding: '0.55rem 0.8rem 0.55rem 2.2rem',
              background: 'var(--glass)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-main)',
              width: '200px',
              fontSize: '0.8rem'
            }}
          />
        </div>

        {user?.role === 'super_admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-glow)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius)', border: '1px solid var(--primary)' }}>
            <Globe size={15} color="var(--primary)" />
            <select 
              value={branch || 'all'}
              onChange={(e) => switchBranch(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: '600',
                fontSize: '0.78rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="all" style={{ background: '#0f172a' }}>All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#0f172a' }}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <div 
            className="glass-morphism" 
            style={{ padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </div>
          <div className="glass-morphism" style={{ padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', position: 'relative' }}>
            <Bell size={16} />
            <span style={{ 
              position: 'absolute', top: '0', right: '0',
              width: '7px', height: '7px', background: 'var(--danger)', borderRadius: '50%' 
            }}></span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
