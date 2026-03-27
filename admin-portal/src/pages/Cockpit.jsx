import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  BookOpen, 
  Loader2, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const PulseCard = ({ title, value, trend, icon, color }) => (
  <div className="glass-morphism pulse-card" style={{ padding: '1.5rem', flex: '1', minWidth: '240px', position: 'relative', overflow: 'hidden', borderBottom: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
        <h2 style={{ fontSize: '2.2rem', margin: '0.4rem 0', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{value}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ padding: '2px 6px', borderRadius: '4px', background: trend.startsWith('+') ? 'rgba(149, 192, 77, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} color={trend.startsWith('+') ? 'var(--success)' : 'var(--danger)'} />
            <span style={{ fontSize: '0.7rem', color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)', fontWeight: '700' }}>
              {trend}
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>vs last month</span>
        </div>
      </div>
      <div style={{ background: color, padding: '0.8rem', borderRadius: '12px', color: 'white', boxShadow: `0 4px 12px ${color}44` }}>{icon}</div>
    </div>
  </div>
);

const Cockpit = () => {
  const { branch, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardContent();
  }, [branch, user.role]);

  const fetchDashboardContent = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/stats?branchId=${branch}`);
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="canvas"><Loader2 className="animate-spin" color="var(--primary)" size={48} /></div>;

  const renderTeacherView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <PulseCard title="My Active Batches" value={data?.totalBatches || 0} trend="+1" icon={<BookOpen size={24} />} color="var(--primary)" />
        <PulseCard title="Student PTE Avg" value="68.5" trend="+2.4" icon={<Activity size={24} />} color="var(--success)" />
        <PulseCard title="Avg Attendance" value="84%" trend="-2%" icon={<CheckCircle2 size={24} />} color="var(--warning)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Classes & Material Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {[1, 2].map(i => (
               <div key={i} className="glass-morphism" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between' }}>
                 <div>
                   <p style={{ fontWeight: '600' }}>PTE Batch A{i} - Speaking Intro</p>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>04:00 PM | Room 10{i}</p>
                 </div>
                 <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Join Link</button>
               </div>
             ))}
          </div>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Student Performance Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
             <p style={{ fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <AlertCircle size={14} /> 3 Students failing Speaking
             </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountingView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <PulseCard title="Monthly Revenue" value={`৳${data?.revenue?.toLocaleString() || 0}`} trend="+15%" icon={<DollarSign size={24} />} color="var(--success)" />
        <PulseCard title="Pending Collections" value="৳142,000" trend="+5%" icon={<AlertCircle size={24} />} color="var(--danger)" />
        <PulseCard title="Payroll Liability" value="৳285,000" trend="0%" icon={<Briefcase size={24} />} color="var(--primary)" />
      </div>
      <div className="glass-morphism" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Departmental Financial Exposure</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2.5rem', height: '220px', padding: '1rem' }}>
             {['Academic', 'Marketing', 'Admin', 'Research'].map((dept, i) => (
                <div key={dept} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                   <div style={{ width: '100%', height: `${[65, 45, 35, 85][i]}%`, background: i % 2 === 0 ? 'var(--primary)' : 'var(--accent)', opacity: 0.8, borderRadius: '8px 8px 0 0', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}></div>
                   <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dim)' }}>{dept}</span>
                </div>
             ))}
          </div>
      </div>
    </div>
  );

  const renderHRView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <PulseCard title="Total Workforce" value={data?.staffCount || 12} trend="+2" icon={<Users size={24} />} color="var(--primary)" />
        <PulseCard title="Pending Attendance" value="4 Alerts" trend="-10%" icon={<Activity size={24} />} color="var(--warning)" />
        <PulseCard title="Active Trainers" value="8 active" trend="+1" icon={<GraduationCap size={24} />} color="var(--success)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <div className="glass-morphism" style={{ padding: '2rem' }}>
          <h3>Recent Personnel Actions</h3>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Joined: Tanvir Hossain (Trainer)', 'Payroll Generated: Feb 2026', 'Status Update: Maria (Inactive)'].map((log, i) => (
              <div key={i} style={{ padding: '1rem', borderLeft: '3px solid var(--accent)', background: 'var(--primary-glow)', fontSize: '0.85rem' }}>{log}</div>
            ))}
          </div>
        </div>
        <div className="glass-morphism" style={{ padding: '2rem' }}>
          <h3>Staff Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Trainers</span><span>65%</span></div>
             <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px' }}><div style={{ width: '65%', height: '100%', background: 'var(--success)', borderRadius: '4px' }}></div></div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>General Staff</span><span>35%</span></div>
             <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px' }}><div style={{ width: '35%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuperAdminView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <PulseCard title="Global Revenue" value={`৳${data?.revenue?.toLocaleString()}`} trend="+12%" icon={<DollarSign size={24} />} color="var(--success)" />
        <PulseCard title="Total Students" value={data?.totalStudents} trend="+8%" icon={<GraduationCap size={24} />} color="var(--primary)" />
        <PulseCard title="Active Leads" value={data?.totalLeads} trend="+22%" icon={<Activity size={24} />} color="var(--accent)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Enterprise Growth Analytics</h3>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
             Visual Analytics for {branch === 'all' ? 'Consolidated Branches' : 'Selected Branch'}
          </div>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Branch Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {/* Mock health indicators */}
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--glass)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.85rem' }}>HQ banani</span>
                <span style={{ color: 'var(--success)', fontSize: '0.7rem' }}>Optimal</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--glass)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.85rem' }}>Uttara Branch</span>
                <span style={{ color: 'var(--warning)', fontSize: '0.7rem' }}>High Expense</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>
          Welcome back, <span style={{ color: 'var(--primary)' }}>{user.name}</span>
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          {user.role === 'super_admin' ? 'Organization-wide enterprise insights' : `Accessing your ${user.role} workspace`}
        </p>
      </div>

      {user.role === 'super_admin' && renderSuperAdminView()}
      {user.role === 'trainer' && renderTeacherView()}
      {user.role === 'accounts' && renderAccountingView()}
      {user.role === 'hr' && renderHRView()}
      {user.role === 'branch_admin' && renderSuperAdminView() /* Reuse admin view */}
      {user.role === 'counselor' && renderSuperAdminView() /* Reuse for now */}
    </div>
  );
};

export default Cockpit;
