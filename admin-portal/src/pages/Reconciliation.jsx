import React, { useState, useEffect } from 'react';
import { 
  Loader2, Scale, CheckCircle, XCircle, AlertTriangle, 
  RefreshCw, FileText, ChevronRight, Filter, Plus,
  Eye, Check, Lock, Unlock, History, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const KPICard = ({ label, value, subtext, color, icon }) => (
  <div className="glass-morphism" style={{ 
    padding: '1.2rem', 
    borderLeft: `4px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }}>
    <div style={{ 
      width: '40px', height: '40px', 
      borderRadius: '10px', 
      background: `${color}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{label}</p>
      <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{value}</h3>
      {subtext && <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>{subtext}</p>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    draft: { bg: '#e0e7ff', color: '#3730a3' },
    reviewed: { bg: '#fef3c7', color: '#92400e' },
    approved: { bg: '#d1fae5', color: '#065f46' },
    locked: { bg: '#f3f4f6', color: '#1f2937' },
    matched: { bg: '#d1fae5', color: '#065f46' },
    variance_minor: { bg: '#fff7ed', color: '#c2410c' },
    variance_major: { bg: '#fef2f2', color: '#991b1b' }
  };
  const s = styles[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ 
      padding: '3px 10px', borderRadius: '12px', 
      fontSize: '0.7rem', fontWeight: '600',
      background: s.bg, color: s.color 
    }}>
      {status?.toUpperCase()}
    </span>
  );
};

const Reconciliation = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [dateToGenerate, setDateToGenerate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        api.get('/reconciliation/stats'),
        api.get('/reconciliation/sessions')
      ]);
      setStats(statsRes.data);
      setSessions(sessionsRes.data);
    } catch (err) {
      console.error('Failed to fetch initial reconciliation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetail = async (sessionId) => {
    setLoading(true);
    try {
      const res = await api.get(`/reconciliation/sessions/${sessionId}`);
      setSessionDetail(res.data);
      setSelectedSession(sessionId);
    } catch (err) {
      console.error('Failed to fetch session details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/reconciliation/generate', { recon_date: dateToGenerate });
      await fetchInitialData();
      alert('Session generated successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate session');
    } finally {
      setGenerating(false);
    }
  };

  const handleSessionAction = async (id, action) => {
    try {
      await api.post(`/reconciliation/sessions/${id}/${action}`);
      if (selectedSession === id) fetchSessionDetail(id);
      else fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} session`);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val) || 0;
    return `৳${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  if (loading && !selectedSession && sessions.length === 0) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} className="animate-spin" color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Finance &gt; Reconciliation</p>
          <h2 style={{ fontSize: '1.5rem', marginTop: '0.3rem' }}>
            {selectedSession ? `Session Detail: ${sessionDetail?.session?.recon_date}` : 'Reconciliation Center'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          {selectedSession ? (
            <button className="btn-secondary" onClick={() => { setSelectedSession(null); setSessionDetail(null); }}>
              Back to Sessions
            </button>
          ) : (
            <>
              <input 
                type="date" 
                value={dateToGenerate} 
                onChange={e => setDateToGenerate(e.target.value)}
                style={{ 
                  padding: '0.5rem 1rem', borderRadius: '8px', 
                  background: 'var(--bg-deep)', border: '1px solid var(--border)',
                  color: 'white'
                }}
              />
              <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} style={{ marginRight: '6px' }} /> Generate Session</>}
              </button>
            </>
          )}
        </div>
      </div>

      {!selectedSession ? (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <KPICard 
              label="Today's Inflows" 
              value={formatCurrency(stats?.today?.inflows)} 
              subtext={`${stats?.today?.inflow_count || 0} Transactions`}
              color="var(--success)"
              icon={<ArrowUpRight size={20} />}
            />
            <KPICard 
              label="Today's Outflows" 
              value={formatCurrency(stats?.today?.outflows)} 
              subtext={`${stats?.today?.outflow_count || 0} Expenses`}
              color="var(--danger)"
              icon={<ArrowDownRight size={20} />}
            />
            <KPICard 
              label="Pending Review" 
              value={stats?.sessions?.draft || 0} 
              subtext="Draft sessions"
              color="var(--warning)"
              icon={<FileText size={20} />}
            />
            <KPICard 
              label="Total Variance" 
              value={formatCurrency(stats?.unresolved_variance)} 
              subtext="Needs reconciliation"
              color="#8b5cf6"
              icon={<Scale size={20} />}
            />
          </div>

          {/* Sessions List */}
          <div className="glass-morphism">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Reconciliation Sessions</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-dim)' }}>RECON DATE</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-dim)' }}>STATUS</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-dim)' }}>INFLOWS</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-dim)' }}>OUTFLOWS</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-dim)' }}>VARIANCE</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-dim)' }}>PREPARED BY</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }} className="transition-hover">
                      <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '600' }}>{s.recon_date}</td>
                      <td style={{ padding: '1rem' }}><StatusBadge status={s.status} /></td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success)' }}>{formatCurrency(s.total_inflows)}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--danger)' }}>{formatCurrency(s.total_outflows)}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: parseFloat(s.total_variance) > 100 ? 'var(--danger)' : 'white' }}>
                        {formatCurrency(s.total_variance)}
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>{s.Preparer?.name || 'System'}</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => fetchSessionDetail(s.id)}>
                          <Eye size={14} style={{ marginRight: '4px' }} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                        No sessions found. Generate a session to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Session Detail View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            {/* Main Lines Table */}
            <div className="glass-morphism">
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Reconciliation Lines</h3>
                <StatusBadge status={sessionDetail?.session?.status} />
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-deep)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-dim)' }}>CHANNEL / ACCOUNT</th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-dim)' }}>OPERATIONAL NET</th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-dim)' }}>LEDGER NET</th>
                      <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-dim)' }}>VARIANCE</th>
                      <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionDetail?.lines?.map(l => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem' }}>
                          <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{l.channel.toUpperCase()}</p>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-dim)' }}>{l.Account?.name} ({l.Account?.code})</p>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(l.operational_net)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(l.ledger_net)}</td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(l.variance)}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}><StatusBadge status={l.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Session Sidebar: Workflow & History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Workflow Actions */}
              <div className="glass-morphism" style={{ padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 1rem' }}>Workflow Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {sessionDetail?.session?.status === 'draft' && (
                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleSessionAction(selectedSession, 'review')}>
                      <Check size={16} style={{ marginRight: '8px' }} /> Mark as Reviewed
                    </button>
                  )}
                  {sessionDetail?.session?.status === 'reviewed' && (
                    <button className="btn-primary" style={{ width: '100%', background: 'var(--success)', border: 'none' }} onClick={() => handleSessionAction(selectedSession, 'approve')}>
                      <CheckCircle size={16} style={{ marginRight: '8px' }} /> Approve & Lock
                    </button>
                  )}
                  {sessionDetail?.session?.status === 'approved' && (
                    <button className="btn-secondary" style={{ width: '100%' }} onClick={() => handleSessionAction(selectedSession, 'lock')}>
                      <Lock size={16} style={{ marginRight: '8px' }} /> Archival Lock
                    </button>
                  )}
                  {sessionDetail?.session?.status !== 'draft' && sessionDetail?.session?.status !== 'locked' && (
                    <button className="btn-secondary" style={{ width: '100%', color: 'var(--danger)' }} onClick={() => {
                      const reason = prompt('Reason for reopening:');
                      if (reason) handleSessionAction(selectedSession, 'reopen', { reason });
                    }}>
                      <Unlock size={16} style={{ marginRight: '8px' }} /> Reopen to Draft
                    </button>
                  )}
                </div>
              </div>

              {/* Event Log */}
              <div className="glass-morphism" style={{ padding: '1.5rem', flex: 1 }}>
                <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={18} color="var(--primary)" /> Audit Trail
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {sessionDetail?.events?.map(ev => (
                    <div key={ev.id} style={{ borderLeft: '2px solid var(--border)', paddingLeft: '1rem', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600' }}>{ev.action.toUpperCase()}</p>
                      <p style={{ margin: '2px 0', fontSize: '0.75rem', color: 'var(--text-main)' }}>{ev.details}</p>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                        {new Date(ev.created_at).toLocaleString()} by {ev.User?.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reconciliation;