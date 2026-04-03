import React from 'react';

export const ScoreBadge = ({ score }) => {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#6b7280';
  return (
    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.6rem', fontWeight: '800', background: `${color}15`, color, border: `1px solid ${color}30` }}>
      ⚡ {score}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const map = { hot: ['#ef4444', '🔥'], high: ['#f59e0b', '↑'], medium: ['#3b82f6', '—'], low: ['#6b7280', '↓'] };
  const [color, icon] = map[priority] || map.medium;
  return <span style={{ fontSize: '0.6rem', color, fontWeight: '700', padding: '2px 6px', background: `${color}10`, borderRadius: '6px' }}>{icon} {priority?.toUpperCase()}</span>;
};

export const stageColors = {
  new: '#6b7280', contacted: '#3b82f6', interested: '#f59e0b',
  trial: '#8b5cf6', enrolled: '#06b6d4', fees_pending: '#f97316', payment_rejected: '#ef4444',
  successful: '#10b981', lost: '#ef4444',
  qualification: '#3b82f6', proposal: '#f59e0b', demo: '#8b5cf6',
  negotiation: '#f97316', won: '#10b981',
};

export const stageLabels = {
  new: 'New Lead', contacted: 'Contacted', interested: 'Interested',
  trial: 'Trial Class', enrolled: 'Enrolled', fees_pending: 'Fees Pending', payment_rejected: 'Payment Rejected',
  successful: '✅ Successful', lost: '❌ Lost',
};

export const stageIcons = {
  new: '🎯', contacted: '📞', interested: '⭐', trial: '🧪',
  enrolled: '📝', fees_pending: '⏳', payment_rejected: '🚫', successful: '🏆', lost: '❌',
};

export const actIcons = { call: '📞', email: '✉️', meeting: '🤝', demo: '💻', whatsapp: '💬', note: '📝', task: '✅' };

export const inputStyle = { padding: '0.65rem 0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' };
