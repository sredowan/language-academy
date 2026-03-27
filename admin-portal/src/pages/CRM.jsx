import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Users, Target, Activity, Megaphone, BarChart2, Trophy } from 'lucide-react';
import api from '../services/api';
import PipelineTab from '../components/crm/PipelineTab';
import ContactsTab from '../components/crm/ContactsTab';
import OpportunitiesTab from '../components/crm/OpportunitiesTab';
import ActivitiesTab from '../components/crm/ActivitiesTab';
import CampaignsTab from '../components/crm/CampaignsTab';
import AnalyticsTab from '../components/crm/AnalyticsTab';
import '../styles/GlobalStyles.css';

const TABS = [
  { id: 'pipeline', label: 'Pipeline', icon: <Target size={16} /> },
  { id: 'contacts', label: 'Contacts', icon: <Users size={16} /> },
  { id: 'opportunities', label: 'Deals', icon: <Trophy size={16} /> },
  { id: 'activities', label: 'Activities', icon: <Activity size={16} /> },
  { id: 'campaigns', label: 'Campaigns', icon: <Megaphone size={16} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
];

const CRMHub = () => {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState({ funnel: null, source: [], forecast: null });

  const fetchAll = useCallback(async () => {
    try {
      const [lRes, cRes, oRes, aRes, camRes, crRes, fRes, sRes, fcRes] = await Promise.all([
        api.get('/crm/leads').catch(() => ({ data: [] })),
        api.get('/crm/contacts').catch(() => ({ data: [] })),
        api.get('/crm/opportunities').catch(() => ({ data: [] })),
        api.get('/crm/activities').catch(() => ({ data: [] })),
        api.get('/crm/campaigns').catch(() => ({ data: [] })),
        api.get('/crm/courses').catch(() => ({ data: [] })),
        api.get('/crm/analytics/funnel').catch(() => ({ data: null })),
        api.get('/crm/analytics/source').catch(() => ({ data: [] })),
        api.get('/crm/analytics/forecast').catch(() => ({ data: null })),
      ]);
      setLeads(lRes.data); setContacts(cRes.data); setOpportunities(oRes.data);
      setActivities(aRes.data); setCampaigns(camRes.data); setCourses(crRes.data);
      setAnalytics({ funnel: fRes.data, source: sRes.data, forecast: fcRes.data });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const totalPipeline = opportunities.filter(o => !['won','lost'].includes(o.stage)).reduce((s,o) => s + parseFloat(o.value||0), 0);
  const overdueAct = activities.filter(a => !a.is_done && a.due_date && new Date(a.due_date) < new Date()).length;
  const newCount = leads.filter(l => l.status === 'new').length;
  const pendingFees = leads.filter(l => l.status === 'fees_pending').length;
  const successCount = leads.filter(l => l.status === 'successful').length;
  const successRevenue = leads.filter(l => l.status === 'successful').reduce((s,l) => s + parseFloat(l.deal_value||0), 0);

  if (loading) return (
    <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={48} className="animate-spin" color="var(--primary)" />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.3rem' }}>
              CRM <span style={{ fontSize: '0.7rem', fontWeight: '600', background: 'linear-gradient(135deg, var(--primary), #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginLeft: '0.5rem' }}>SALESFORCE ENGINE</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Manage leads, deals, and revenue in one place</p>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'var(--glass)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            🌐 Website Auto-Sync Active
          </div>
        </div>

        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem', marginTop: '1.2rem' }}>
          {[
            { label: 'NEW LEADS', value: newCount, color: '#3b82f6', icon: '🎯' },
            { label: 'PENDING FEES', value: pendingFees, color: '#f59e0b', icon: '⏳' },
            { label: 'SUCCESSFUL', value: successCount, color: '#10b981', icon: '✅' },
            { label: 'REVENUE', value: `৳${successRevenue.toLocaleString()}`, color: '#06b6d4', icon: '💰' },
            { label: 'PIPELINE', value: `৳${totalPipeline.toLocaleString()}`, color: '#8b5cf6', icon: '📊' },
          ].map(k => (
            <div key={k.label} style={{ padding: '1rem 1.2rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', borderBottom: `3px solid ${k.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{k.label}</p>
                <span style={{ fontSize: '1rem' }}>{k.icon}</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: k.color, marginTop: '0.3rem' }}>{k.value}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--glass)', padding: '0.35rem', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', border: 'none',
            borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
            background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
            color: activeTab === tab.id ? '#000' : 'var(--text-dim)',
            transition: 'all 0.2s ease'
          }}>
            {tab.icon} {tab.label}
            {tab.id === 'activities' && overdueAct > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '8px', padding: '1px 5px', fontSize: '0.55rem', fontWeight: '800' }}>{overdueAct}</span>}
            {tab.id === 'pipeline' && pendingFees > 0 && <span style={{ background: '#f59e0b', color: '#000', borderRadius: '8px', padding: '1px 5px', fontSize: '0.55rem', fontWeight: '800' }}>{pendingFees}</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'pipeline' && <PipelineTab leads={leads} courses={courses} onRefresh={fetchAll} />}
      {activeTab === 'contacts' && <ContactsTab contacts={contacts} onRefresh={fetchAll} />}
      {activeTab === 'opportunities' && <OpportunitiesTab opportunities={opportunities} onRefresh={fetchAll} />}
      {activeTab === 'activities' && <ActivitiesTab activities={activities} onRefresh={fetchAll} />}
      {activeTab === 'campaigns' && <CampaignsTab campaigns={campaigns} onRefresh={fetchAll} />}
      {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
    </div>
  );
};

export default CRMHub;
