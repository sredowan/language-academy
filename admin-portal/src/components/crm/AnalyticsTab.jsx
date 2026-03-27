import React from 'react';
import { stageColors, stageLabels, stageIcons } from './CRMComponents';

const AnalyticsTab = ({ analytics }) => {
  const { funnel, source, forecast } = analytics;
  const maxCount = funnel?.funnel ? Math.max(...funnel.funnel.map(f => f.count), 1) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
        {[
          { label: 'CONVERSION RATE', value: `${funnel?.overallConversion || 0}%`, sub: 'Lead → Successful', color: '#10b981', icon: '📈' },
          { label: 'REAL REVENUE', value: `৳${(funnel?.successfulRevenue || 0).toLocaleString()}`, sub: 'Fees collected only', color: '#06b6d4', icon: '💰' },
          { label: 'FORECAST', value: `৳${(forecast?.weightedForecast || 0).toLocaleString()}`, sub: 'Pipeline × Probability', color: '#3b82f6', icon: '🔮' },
          { label: 'PIPELINE', value: `৳${(forecast?.totalPipelineValue || 0).toLocaleString()}`, sub: 'Open opportunities', color: '#f59e0b', icon: '📊' },
        ].map(k => (
          <div key={k.label} style={{ padding: '1.2rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', borderBottom: `3px solid ${k.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.58rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>{k.label}</p>
              <span>{k.icon}</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: k.color, margin: '0.3rem 0 0.1rem' }}>{k.value}</h2>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
        {/* Funnel */}
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.2rem', fontSize: '1rem', fontWeight: '700' }}>Conversion Funnel</h3>
          {funnel?.funnel?.map((f) => (
            <div key={f.stage} style={{ marginBottom: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: '600', color: stageColors[f.stage], display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ fontSize: '0.85rem' }}>{stageIcons[f.stage]}</span> {stageLabels[f.stage] || f.stage}
                </span>
                <span style={{ color: 'var(--text-dim)' }}>{f.count} · {f.conversionRate}%</span>
              </div>
              <div style={{ height: '10px', background: 'var(--glass)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max((f.count / maxCount) * 100, 2)}%`, height: '100%', background: `linear-gradient(90deg, ${stageColors[f.stage]}, ${stageColors[f.stage]}80)`, borderRadius: '5px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
          {(!funnel?.funnel || funnel.funnel.length === 0) && <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>No data yet</p>}
        </div>

        {/* Source ROI */}
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.2rem', fontSize: '1rem', fontWeight: '700' }}>Lead Source Performance</h3>
          {source && source.length > 0 ? source.map((s, i) => {
            const total = parseInt(s.dataValues?.total || s.total || 0);
            const converted = parseInt(s.dataValues?.converted || s.converted || 0);
            const revenue = parseFloat(s.dataValues?.revenue || s.revenue || 0);
            const convRate = total > 0 ? ((converted / total) * 100).toFixed(0) : 0;
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[i % colors.length] }} />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{s.source || 'Unknown'}</span>
                    {revenue > 0 && <p style={{ fontSize: '0.65rem', color: '#10b981' }}>৳{revenue.toLocaleString()} revenue</p>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-dim)' }}>{total} leads</span>
                  <span style={{ color: convRate > 20 ? '#10b981' : '#f59e0b', fontWeight: '700', fontSize: '0.75rem', padding: '2px 6px', background: convRate > 20 ? '#10b98110' : '#f59e0b10', borderRadius: '6px' }}>{convRate}%</span>
                </div>
              </div>
            );
          }) : <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>No source data yet</p>}
        </div>
      </div>

      {/* Revenue Forecast by Stage */}
      {forecast?.byStage && forecast.byStage.some(s => s.count > 0) && (
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>Pipeline by Deal Stage</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {forecast.byStage.map(s => (
              <div key={s.stage} style={{ padding: '1rem', background: 'var(--glass)', borderRadius: '10px', borderLeft: `3px solid ${stageColors[s.stage]}`, textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', color: stageColors[s.stage], fontWeight: '700', textTransform: 'uppercase' }}>{s.stage}</p>
                <h4 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0.3rem 0' }}>৳{s.value.toLocaleString()}</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{s.count} deals</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;
