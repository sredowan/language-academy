import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { inputStyle, stageColors, stageLabels, stageIcons } from './CRMComponents';

const ContactsTab = ({ contacts, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', source: 'Walk-in', notes: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sources = [...new Set(contacts.map(c => c.source).filter(Boolean))];

  const filtered = contacts.filter(c => {
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) && !c.email?.toLowerCase().includes(search.toLowerCase()) && !c.phone?.includes(search)) return false;
    if (sourceFilter && c.source !== sourceFilter) return false;
    return true;
  });

  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', company: '', source: 'Walk-in', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) {
        await api.put(`/crm/contacts/${editingId}`, form);
      } else {
        await api.post('/crm/contacts', form);
      }
      resetForm(); onRefresh();
    } catch { alert('Failed to save contact'); }
    finally { setSaving(false); }
  };

  const startEdit = (c) => {
    setForm({ name: c.name || '', phone: c.phone || '', email: c.email || '', company: c.company || '', source: c.source || 'Walk-in', notes: c.notes || '' });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/crm/contacts/${id}`); setConfirmDelete(null); onRefresh(); }
    catch { alert('Failed to delete'); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Contact Directory</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{filtered.length} of {contacts.length} contacts</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(s => !s); }} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '2rem', width: '100%' }} />
        </div>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{ ...inputStyle, width: '180px' }}>
          <option value="">All Sources</option>
          {sources.map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || sourceFilter) && (
          <button onClick={() => { setSearch(''); setSourceFilter(''); }} style={{ padding: '0.5rem 0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.75rem' }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ marginBottom: '1.2rem', padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{editingId ? '✏️ Edit Contact' : '➕ New Contact'}</h4>
            <X size={16} style={{ cursor: 'pointer', color: 'var(--text-dim)' }} onClick={resetForm} />
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem' }}>
            <input required placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
            <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
            <input placeholder="Company / Institution" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} style={inputStyle} />
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} style={inputStyle}>
              {['Walk-in', 'Facebook', 'Instagram', 'WhatsApp', 'Referral', 'Website Enquiry', 'Website Purchase', 'Other'].map(s => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={inputStyle} />
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={resetForm} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>{saving ? '...' : editingId ? 'Update' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Contact Table */}
      <div className="glass-morphism" style={{ padding: '0.5rem', borderRadius: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.8fr 1fr 1fr 0.8fr 0.6fr', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', fontWeight: '700', letterSpacing: '0.5px' }}>
          <span>Name</span><span>Phone</span><span>Email</span><span>Source</span><span>Company</span><span>Since</span><span>Actions</span>
        </div>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem', fontSize: '0.85rem' }}>
            {contacts.length === 0 ? 'No contacts yet. They are auto-created when leads are enrolled.' : 'No contacts match your filters.'}
          </p>
        ) : filtered.map(c => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.8fr 1fr 1fr 0.8fr 0.6fr', gap: '0.5rem', padding: '0.65rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.82rem', alignItems: 'center', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div>
              <span style={{ fontWeight: '600' }}>{c.name}</span>
              {c.notes && <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>{c.notes.substring(0, 40)}{c.notes.length > 40 ? '...' : ''}</p>}
            </div>
            <span style={{ color: 'var(--text-dim)' }}>{c.phone || '—'}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{c.email || '—'}</span>
            <span style={{ fontSize: '0.62rem', padding: '2px 8px', background: 'var(--glass)', borderRadius: '8px', width: 'fit-content', fontWeight: '600' }}>{c.source || '—'}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{c.company || '—'}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button onClick={() => startEdit(c)} style={{ padding: '3px 6px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }} title="Edit">
                <Edit2 size={12} />
              </button>
              {confirmDelete === c.id ? (
                <button onClick={() => handleDelete(c.id)} style={{ padding: '3px 6px', background: '#ef444420', border: '1px solid #ef444440', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', fontSize: '0.6rem', fontWeight: '700' }}>
                  Sure?
                </button>
              ) : (
                <button onClick={() => setConfirmDelete(c.id)} style={{ padding: '3px 6px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }} title="Delete">
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      {contacts.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          {sources.map(s => {
            const count = contacts.filter(c => c.source === s).length;
            return <span key={s} style={{ padding: '3px 8px', background: 'var(--glass)', borderRadius: '6px' }}>{s}: {count}</span>;
          })}
        </div>
      )}
    </div>
  );
};

export default ContactsTab;
