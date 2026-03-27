import React, { useState } from 'react';
import { Search, Plus, Phone, Mail, X, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { ScoreBadge, PriorityBadge, stageColors, stageLabels, stageIcons, actIcons, inputStyle } from './CRMComponents';

const LeadPanel = ({ lead, onClose, onRefresh, courses }) => {
  const [activities, setActivities] = useState([]);
  const [actForm, setActForm] = useState({ type: 'call', subject: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loadedActs, setLoadedActs] = useState(false);

  if (!loadedActs && lead) {
    api.get(`/crm/activities?lead_id=${lead.id}`).then(r => setActivities(r.data)).catch(() => {});
    setLoadedActs(true);
  }

  if (!lead) return null;

  const logActivity = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/crm/activities', { ...actForm, lead_id: lead.id });
      setActForm({ type: 'call', subject: '', description: '' });
      const r = await api.get(`/crm/activities?lead_id=${lead.id}`);
      setActivities(r.data); onRefresh();
    } catch { alert('Failed'); } finally { setSaving(false); }
  };

  const updateStatus = async (status) => {
    try { await api.patch(`/crm/leads/${lead.id}/status`, { status }); onRefresh(); onClose(); }
    catch { alert('Failed'); }
  };

  const [selectedBatch, setSelectedBatch] = useState('');

  const handleEnroll = async () => {
    if (!lead.course_id) return alert('Please select a course for this lead first.');
    setEnrolling(true);
    try {
      const r = await api.post(`/crm/leads/${lead.id}/enroll`, { course_id: lead.course_id, batch_id: selectedBatch || undefined });
      alert(`✅ ${r.data.message}`);
      onRefresh(); onClose();
    } catch (err) { alert(err.response?.data?.error || 'Failed to enroll'); }
    finally { setEnrolling(false); }
  };

  const changeCourse = async (courseId) => {
    try { await api.put(`/crm/leads/${lead.id}`, { course_id: parseInt(courseId) }); onRefresh(); }
    catch { alert('Failed to update course'); }
  };

  const selectedCourse = courses.find(c => c.id === lead.course_id);

  const statusFlow = ['new', 'contacted', 'interested', 'trial', 'enrolled', 'fees_pending', 'successful'];
  const daysAge = Math.floor((Date.now() - new Date(lead.created_at)) / 86400000);

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '440px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', zIndex: 500, overflowY: 'auto', boxShadow: '-10px 0 40px rgba(0,0,0,0.4)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', background: `linear-gradient(135deg, ${stageColors[lead.status]}15, transparent)`, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{lead.name}</h3>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              <ScoreBadge score={lead.score || 0} />
              <PriorityBadge priority={lead.priority} />
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', background: `${stageColors[lead.status]}20`, color: stageColors[lead.status], fontWeight: '700' }}>{stageIcons[lead.status]} {stageLabels[lead.status]}</span>
            </div>
          </div>
          <X size={18} style={{ cursor: 'pointer', color: 'var(--text-dim)' }} onClick={onClose} />
        </div>
      </div>

      {/* Contact Info */}
      <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}><Phone size={13} color="var(--text-dim)" />{lead.phone || '—'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}><Mail size={13} color="var(--text-dim)" />{lead.email || '—'}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.8rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          <div>📚 {lead.batch_interest || lead.Course?.title || '—'}</div>
          <div>💰 ৳{parseFloat(lead.deal_value || 0).toLocaleString()}</div>
          <div>🔗 {lead.source}</div>
          <div>📅 {daysAge}d ago</div>
        </div>
        {lead.notes && <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: 'var(--glass)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-dim)', borderLeft: '3px solid var(--border)' }}>{lead.notes}</div>}
      </div>

      {/* Course & Batch Picker */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', fontWeight: '700' }}>Course & Batch Assignment</p>
        <select value={lead.course_id || ''} onChange={e => changeCourse(e.target.value)} style={{ ...inputStyle, fontSize: '0.82rem', marginBottom: '0.5rem' }}>
          <option value="">— Select Course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title} — ৳{parseFloat(c.base_fee).toLocaleString()}</option>)}
        </select>
        {selectedCourse && selectedCourse.Batches && selectedCourse.Batches.length > 0 && (
          <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={{ ...inputStyle, fontSize: '0.82rem' }}>
            <option value="">— Select Batch (optional) —</option>
            {selectedCourse.Batches.map(b => <option key={b.id} value={b.id}>{b.name || b.code} · {b.status} · Starts {b.start_date || 'TBD'}</option>)}
          </select>
        )}
        {selectedCourse && (!selectedCourse.Batches || selectedCourse.Batches.length === 0) && (
          <p style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '0.3rem' }}>⚠ No active batches for this course</p>
        )}
      </div>

      {/* Stage Flow + Actions */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', marginBottom: '0.6rem' }}>Pipeline Stage</p>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {statusFlow.map(s => (
            <button key={s} onClick={() => updateStatus(s)} style={{ padding: '4px 10px', fontSize: '0.6rem', border: `1px solid ${stageColors[s]}`, background: lead.status === s ? stageColors[s] : 'transparent', color: lead.status === s ? '#fff' : stageColors[s], borderRadius: '12px', cursor: 'pointer', fontWeight: '700', transition: 'all 0.15s' }}>
              {stageIcons[s]} {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexDirection: 'column' }}>
          {!['fees_pending', 'successful', 'lost'].includes(lead.status) && (
            <button onClick={handleEnroll} disabled={enrolling || !lead.course_id} style={{ padding: '0.6rem', background: lead.course_id ? '#06b6d4' : '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: lead.course_id ? 'pointer' : 'not-allowed', opacity: lead.course_id ? 1 : 0.6 }}>
              {enrolling ? '...' : '📝 Enroll → Create Invoice for POS'}
            </button>
          )}
          {lead.status === 'fees_pending' && (
            <div style={{ padding: '0.8rem', background: '#f59e0b10', border: '1px solid #f59e0b30', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700', marginBottom: '0.3rem' }}>⏳ Waiting for Fee Collection</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Go to <strong>Finance → POS</strong> to collect fees. Student will be auto-created and this lead will be marked successful once fees are collected.</p>
            </div>
          )}
          {lead.status === 'successful' && (
            <div style={{ padding: '0.8rem', background: '#10b98110', border: '1px solid #10b98130', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>🏆 Sale Complete — Student Created & Fees Collected</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!['lost', 'successful'].includes(lead.status) && (
              <button onClick={() => updateStatus('lost')} style={{ flex: 1, padding: '0.5rem', background: '#ef444415', color: '#ef4444', border: '1px solid #ef444430', borderRadius: '8px', fontWeight: '700', fontSize: '0.72rem', cursor: 'pointer' }}>
                ✗ Mark Lost
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Log Activity */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', marginBottom: '0.6rem' }}>Log Activity</p>
        <form onSubmit={logActivity} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {['call', 'email', 'meeting', 'whatsapp', 'demo', 'note'].map(t => (
              <button key={t} type="button" onClick={() => setActForm(f => ({ ...f, type: t }))} style={{ padding: '4px 8px', fontSize: '0.65rem', border: '1px solid var(--border)', background: actForm.type === t ? 'var(--primary)' : 'transparent', color: actForm.type === t ? '#000' : 'var(--text-dim)', borderRadius: '6px', cursor: 'pointer' }}>{actIcons[t]}</button>
            ))}
          </div>
          <input required placeholder="Subject" value={actForm.subject} onChange={e => setActForm(f => ({ ...f, subject: e.target.value }))} style={inputStyle} />
          <textarea placeholder="Notes..." value={actForm.description} onChange={e => setActForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, height: '50px', resize: 'none' }} />
          <button type="submit" disabled={saving} style={{ padding: '0.5rem', background: 'var(--primary)', border: 'none', borderRadius: '6px', color: '#000', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}>{saving ? '...' : '+ Log'}</button>
        </form>
      </div>

      {/* Timeline */}
      <div style={{ padding: '1rem 1.5rem' }}>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.6rem', fontWeight: '700' }}>Activity Timeline</p>
        {activities.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', opacity: 0.5 }}>No activities yet</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {activities.map(a => (
              <div key={a.id} style={{ padding: '0.6rem 0.8rem', background: 'var(--glass)', borderRadius: '8px', borderLeft: `3px solid ${a.is_done ? '#10b981' : 'var(--primary)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>{actIcons[a.type]} {a.subject}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                {a.description && <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{a.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LeadCard = ({ lead, onClick }) => {
  const daysSince = lead.last_activity_at ? Math.floor((Date.now() - new Date(lead.last_activity_at)) / 86400000) : null;
  const daysAge = Math.floor((Date.now() - new Date(lead.created_at)) / 86400000);

  return (
    <div onClick={() => onClick(lead)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.9rem', marginBottom: '0.5rem', cursor: 'pointer', transition: 'all 0.15s', borderLeft: `3px solid ${stageColors[lead.status]}` }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
          <ScoreBadge score={lead.score || 0} />
          <PriorityBadge priority={lead.priority} />
        </div>
        {daysSince !== null && <span style={{ fontSize: '0.55rem', color: daysSince > 3 ? '#ef4444' : 'var(--text-dim)', fontWeight: '600' }}>{daysSince === 0 ? '🟢 Today' : `${daysSince}d`}</span>}
      </div>
      <p style={{ fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.2rem' }}>{lead.name}</p>
      {(lead.batch_interest || lead.Course?.title) && <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>📚 {lead.Course?.title || lead.batch_interest}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {lead.deal_value > 0 && <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#10b981' }}>৳{parseFloat(lead.deal_value).toLocaleString()}</span>}
        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', background: 'var(--glass)', padding: '1px 6px', borderRadius: '6px' }}>{lead.source || '—'}</span>
      </div>
    </div>
  );
};

const PipelineTab = ({ leads, courses, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'Walk-in', course_id: '', priority: 'medium' });
  const [saving, setSaving] = useState(false);

  const stages = [
    { key: 'new', label: 'New Leads', desc: 'Fresh enquiries' },
    { key: 'contacted', label: 'Contacted', desc: 'First touchpoint done' },
    { key: 'interested', label: 'Interested', desc: 'Showing intent' },
    { key: 'trial', label: 'Trial Class', desc: 'Demo/trial booked' },
    { key: 'enrolled', label: 'Enrolled', desc: 'Course & batch selected' },
    { key: 'fees_pending', label: 'Fees Pending', desc: 'Collect via POS' },
    { key: 'successful', label: 'Successful', desc: 'Fees collected · Student created' },
  ];

  const filtered = leads.filter(l => l.status !== 'lost' && (!search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.batch_interest?.toLowerCase().includes(search.toLowerCase())));
  const lostCount = leads.filter(l => l.status === 'lost').length;

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/crm/leads', form);
      setShowForm(false); setForm({ name: '', phone: '', email: '', source: 'Walk-in', course_id: '', priority: 'medium' });
      onRefresh();
    } catch { alert('Failed'); } finally { setSaving(false); }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '2rem', width: '100%' }} />
          </div>
          {lostCount > 0 && <span style={{ fontSize: '0.7rem', color: '#ef4444', background: '#ef444410', padding: '4px 10px', borderRadius: '8px' }}>❌ {lostCount} lost</span>}
        </div>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
          <Plus size={16} /> New Lead
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '1.2rem', padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', fontWeight: '700' }}>➕ New Lead</h4>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem' }}>
            <input required placeholder="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
            <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
            <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} style={inputStyle}>
              <option value="">Select Course (auto-fills ৳)</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title} — ৳{parseFloat(c.base_fee).toLocaleString()}</option>)}
            </select>
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} style={inputStyle}>
              {['Walk-in', 'Facebook', 'Instagram', 'WhatsApp', 'Referral', 'Website Enquiry', 'Other'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={inputStyle}>
              {['low', 'medium', 'high', 'hot'].map(p => <option key={p}>{p}</option>)}
            </select>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.82rem' }}>{saving ? '...' : 'Create Lead'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {stages.map(stage => {
          const stageLeads = filtered.filter(l => l.status === stage.key);
          const totalVal = stageLeads.reduce((s, l) => s + parseFloat(l.deal_value || 0), 0);
          return (
            <div key={stage.key} style={{ flex: '0 0 230px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border)' }}>
              <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border)', background: `${stageColors[stage.key]}08` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>{stageIcons[stage.key]}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3px', color: stageColors[stage.key] }}>{stage.label}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', background: `${stageColors[stage.key]}20`, color: stageColors[stage.key], padding: '2px 7px', borderRadius: '8px' }}>{stageLeads.length}</span>
                </div>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{stage.desc}</p>
                {totalVal > 0 && <p style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: '700', marginTop: '0.2rem' }}>৳{totalVal.toLocaleString()}</p>}
              </div>
              <div style={{ padding: '0.5rem', maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
                {stageLeads.length === 0
                  ? <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem 0', opacity: 0.4 }}>Empty</p>
                  : stageLeads.map(l => <LeadCard key={l.id} lead={l} onClick={setSelectedLead} />)
                }
              </div>
            </div>
          );
        })}
      </div>

      {selectedLead && <LeadPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onRefresh={onRefresh} courses={courses} />}
    </>
  );
};

export default PipelineTab;
