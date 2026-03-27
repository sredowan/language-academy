import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, DollarSign, Settings, LogOut, Map as RoomMap,
  FileText, BarChart3, Calendar, Layers, GraduationCap, CreditCard, Package, Zap,
  ChevronRight, ChevronDown, Sun, Moon, Wallet, PieChart, TrendingUp, BookOpenCheck,
  Receipt, Shield, Scale, Globe
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/GlobalStyles.css';

const Sidebar = () => {
  const { user, branch, switchBranch, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [branches, setBranches] = React.useState([]);
  const [collapsed, setCollapsed] = useState({});

  React.useEffect(() => {
    if (user?.role === 'super_admin') fetchBranches();
  }, [user]);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch (err) { console.error('Failed to fetch branches'); }
  };

  const toggleSection = (label) => setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  const sections = {
    super_admin: [
      {
        label: 'OPERATIONS',
        items: [
          { name: 'Cockpit', icon: <LayoutDashboard size={18} />, id: 'dashboard' },
          { name: 'Intelligence Hub', icon: <BarChart3 size={18} />, id: 'reports' },
          { name: 'CRM Pipeline', icon: <Layers size={18} />, id: 'crm' },
          { name: 'Students', icon: <GraduationCap size={18} />, id: 'students' },
          { name: 'LMS Batches', icon: <BookOpen size={18} />, id: 'lms' },
        ]
      },
      {
        label: 'FINANCE & ACCOUNTING',
        items: [
          { name: 'POS & Fees', icon: <CreditCard size={18} />, id: 'pos' },
          { name: 'Accounts Overview', icon: <DollarSign size={18} />, id: 'finance' },
          { name: 'Bank & Cash', icon: <Wallet size={18} />, id: 'liquid-accounts' },
          { name: 'Invoices', icon: <FileText size={18} />, id: 'invoices' },
          { name: 'Expenses', icon: <Wallet size={18} />, id: 'expenses' },
          { name: 'Reconciliation', icon: <Scale size={18} />, id: 'reconciliation' },
          { name: 'Budget Tracker', icon: <PieChart size={18} />, id: 'budget' },
          { name: 'General Ledger', icon: <BookOpenCheck size={18} />, id: 'ledger' },
          { name: 'Journal Entry', icon: <Receipt size={18} />, id: 'journal' },
          { name: 'Cash Flow', icon: <TrendingUp size={18} />, id: 'cashflow' },
          { name: 'Financial Reports', icon: <BarChart3 size={18} />, id: 'finance-reports' },
        ]
      },
      {
        label: 'MANAGEMENT',
        items: [
          { name: 'PTE Engine', icon: <BarChart3 size={18} />, id: 'pte' },
          { name: 'ERP Spaces', icon: <RoomMap size={18} />, id: 'erp' },
          { name: 'Asset Inventory', icon: <Package size={18} />, id: 'assets' },
          { name: 'Staff & Payroll', icon: <Users size={18} />, id: 'payroll' },
          { name: 'Attendance', icon: <Calendar size={18} />, id: 'attendance' },
          { name: 'Network', icon: <Settings size={18} />, id: 'branches' },
          { name: 'Automation', icon: <Zap size={18} />, id: 'automation' },
          { name: 'Website Mgt.', icon: <Globe size={18} />, id: 'website-management' },
        ]
      }
    ],
    branch_admin: [
      {
        label: 'OPERATIONS',
        items: [
          { name: 'Cockpit', icon: <LayoutDashboard size={18} />, id: 'dashboard' },
          { name: 'CRM Pipeline', icon: <Layers size={18} />, id: 'crm' },
          { name: 'Students', icon: <GraduationCap size={18} />, id: 'students' },
          { name: 'LMS Batches', icon: <BookOpen size={18} />, id: 'lms' },
        ]
      },
      {
        label: 'FINANCE',
        items: [
          { name: 'Fee Collection', icon: <CreditCard size={18} />, id: 'pos' },
          { name: 'Invoices', icon: <FileText size={18} />, id: 'invoices' },
          { name: 'Expenses', icon: <Wallet size={18} />, id: 'expenses' },
        ]
      },
      {
        label: 'MANAGEMENT',
        items: [
          { name: 'ERP Spaces', icon: <RoomMap size={18} />, id: 'erp' },
          { name: 'Asset Inventory', icon: <Package size={18} />, id: 'assets' },
          { name: 'Staff & Payroll', icon: <Users size={18} />, id: 'payroll' },
        ]
      }
    ],
    accounts: [
      {
        label: 'ACCOUNTING',
        items: [
          { name: 'Accounting Desk', icon: <DollarSign size={18} />, id: 'finance' },
          { name: 'Intelligence Hub', icon: <BarChart3 size={18} />, id: 'reports' },
          { name: 'Fee Collection', icon: <CreditCard size={18} />, id: 'pos' },
          { name: 'Payroll Run', icon: <Users size={18} />, id: 'payroll' },
        ]
      }
    ],
    trainer: [
      {
        label: 'TRAINER',
        items: [
          { name: 'Trainer Deck', icon: <LayoutDashboard size={18} />, id: 'dashboard' },
          { name: 'My Batches', icon: <BookOpen size={18} />, id: 'lms' },
          { name: 'Material Center', icon: <Layers size={18} />, id: 'materials' },
          { name: 'PTE Analytics', icon: <BarChart3 size={18} />, id: 'pte' },
          { name: 'Attendance', icon: <Calendar size={18} />, id: 'attendance' },
        ]
      }
    ],
    counselor: [
      {
        label: 'CRM',
        items: [
          { name: 'Lead Pipeline', icon: <Layers size={18} />, id: 'crm' },
          { name: 'Students', icon: <GraduationCap size={18} />, id: 'students' },
          { name: 'LMS Batches', icon: <BookOpen size={18} />, id: 'lms' },
        ]
      }
    ],
    hr: [
      {
        label: 'HUMAN RESOURCES',
        items: [
          { name: 'Staff Directory', icon: <Users size={18} />, id: 'payroll' },
          { name: 'Attendance', icon: <Calendar size={18} />, id: 'attendance' },
          { name: 'Staff Reports', icon: <BarChart3 size={18} />, id: 'reports' },
          { name: 'Website Mgt.', icon: <Globe size={18} />, id: 'website-management' },
        ]
      }
    ]
  };

  const sectionList = sections[user?.role] || sections['counselor'];

  return (
    <aside className="sidebar glass-morphism" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Logo */}
      <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem', color: '#fff', boxShadow: '0 4px 12px rgba(50, 97, 154, 0.4)' }}>LA</div>
          <div>
            <h2 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '800', letterSpacing: '0.5px', margin: 0, fontFamily: 'var(--font-heading)' }}>LANGUAGE ACADEMY</h2>
            <p style={{ fontSize: '10px', color: 'var(--accent)', margin: 0, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>Executive Cloud</p>
          </div>
        </div>
      </div>

      {/* Branch Selector removed - locked to Main HQ for MVP */}

      {/* Scrollable Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.6rem' }}>
        {sectionList.map((section, si) => (
          <div key={si} style={{ marginBottom: '0.3rem' }}>
            {/* Section Header */}
            <div onClick={() => toggleSection(section.label)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.8rem', cursor: 'pointer', userSelect: 'none' }}>
              <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '600', margin: 0 }}>{section.label}</p>
              {collapsed[section.label] ? <ChevronRight size={12} color="var(--text-dim)" /> : <ChevronDown size={12} color="var(--text-dim)" />}
            </div>

            {/* Section Items */}
            {!collapsed[section.label] && section.items.map((item) => {
              const isActive = location.pathname === `/${item.id}`;
              return (
                <div key={item.id} onClick={() => navigate(`/${item.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    padding: '0.6rem 0.8rem', borderRadius: '8px', cursor: 'pointer',
                    color: isActive ? 'var(--primary)' : 'var(--text-dim)',
                    background: isActive ? 'var(--primary-glow)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: '4px', fontSize: '0.85rem',
                    borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                    paddingLeft: isActive ? '0.6rem' : '0.8rem'
                  }}
                  onMouseOver={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--glass)'; } }}
                  onMouseOut={(e) => { if (!isActive) { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'none'; } }}
                >
                  {item.icon}
                  <span style={{ fontWeight: '500' }}>{item.name}</span>
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — fixed at bottom, not absolute */}
      <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '0.75rem' }}>
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', margin: 0 }}>{user?.name || 'Admin'}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', margin: 0 }}>Branch: {branch || 'All'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </div>
          <LogOut size={16} style={{ cursor: 'pointer', color: 'var(--text-dim)' }} onClick={logout} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
