import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, Mail, MessageSquare } from 'lucide-react';
import api from '../services/api';

const inputStyle = {
  width: '100%',
  padding: '0.8rem 1.2rem',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  color: 'var(--text)',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s ease',
};

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localMods, setLocalMods] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        alert('Access denied. Super Admin privileges required.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Only send what was modified
    const updates = Object.keys(localMods).map(key => ({
      key,
      value: localMods[key]
    }));

    if (updates.length === 0) return;

    setSaving(true);
    try {
      await api.put('/settings', updates);
      alert('System settings updated securely!');
      setLocalMods({});
      fetchSettings();
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, val) => {
    setLocalMods(prev => ({ ...prev, [key]: val }));
  };

  const getValue = (key) => {
    if (localMods[key] !== undefined) return localMods[key];
    const s = settings.find(st => st.key === key);
    return s ? s.value : '';
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading System Configurations...</div>;
  }

  // Group settings
  const emailSettings = settings.filter(s => s.key.startsWith('SMTP_'));
  const smsSettings = settings.filter(s => s.key.startsWith('SMS_'));

  return (
    <div style={{ padding: '1rem 0', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
          <SettingsIcon size={28} color="#6366f1" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>System Settings</h2>
          <p style={{ color: 'var(--text-dim)', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Configure global API keys and credentials.
            <br />
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981' }}>🛡️ Values marked as secret are AES-256 encrypted in the database.</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Email Configuration */}
        <section style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <Mail size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Email Configuration (SMTP)</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {emailSettings.map(s => (
              <div key={s.key} style={{ gridColumn: s.description.includes('Password') ? '1 / -1' : 'auto' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dim)' }}>
                  {s.description}
                  {s.is_secret && <span style={{ color: '#f59e0b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }}><Key size={10}/> Encrypted</span>}
                </label>
                <input
                  type={s.is_secret ? 'password' : 'text'}
                  value={getValue(s.key)}
                  onChange={e => handleChange(s.key, e.target.value)}
                  style={inputStyle}
                  placeholder={s.is_secret ? "••••••••••••••••" : ""}
                />
              </div>
            ))}
          </div>
        </section>

        {/* SMS Configuration */}
        <section style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <MessageSquare size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>SMS Gateway API</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {smsSettings.map(s => (
              <div key={s.key}>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-dim)' }}>
                  {s.description}
                  {s.is_secret && <span style={{ color: '#f59e0b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }}><Key size={10}/> Encrypted</span>}
                </label>
                <input
                  type={s.is_secret ? 'password' : 'text'}
                  value={getValue(s.key)}
                  onChange={e => handleChange(s.key, e.target.value)}
                  style={inputStyle}
                  placeholder={s.is_secret ? "••••••••••••••••" : ""}
                />
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button 
            type="submit" 
            disabled={saving || Object.keys(localMods).length === 0}
            className="btn-primary" 
            style={{ 
              padding: '1rem 2.5rem', 
              fontSize: '1rem', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: Object.keys(localMods).length === 0 ? 0.5 : 1 
            }}>
            <Save size={20} />
            {saving ? 'Encrypting & Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
