import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import '../styles/GlobalStyles.css';
import html2pdf from 'html2pdf.js';
import { buildPdfHeaderHtml, getInstitutionInfo } from '../utils/pdfUtils';

const money = (v) => `BDT ${Number(v || 0).toLocaleString()}`;
const date = (v) => (v ? new Date(v).toLocaleDateString() : '-');

const tabs = [
  ['overview', 'Overview', '📊'],
  ['income', 'Income', '↑'],
  ['expenses', 'Expenses', '↓'],
  ['bank', 'Bank', '🏦'],
  ['receivables', 'Receivables', '📋'],
  ['premium', 'Premium', '💎'],
  ['trial', 'Trial Balance', '⚖️']
];

const cols = {
  income: ['date', 'source_label', 'description', 'amount'],
  expenses: ['date', 'category', 'description', 'amount'],
  bank: ['date', 'account_name', 'entry_type', 'description', 'amount'],
  receivables: ['invoice_number', 'student_name', 'due_date', 'due'],
  premium: ['student_name', 'start_date', 'expiry_date', 'amount'],
  trial: ['account_code', 'account_name', 'type', 'debit', 'credit', 'balance']
};

const formatDateLocal = (dateObj) => {
  const d = new Date(dateObj);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const getTodayLocal = () => {
  const now = new Date();
  if (now.getHours() < 4) {
    now.setDate(now.getDate() - 1);
  }
  return formatDateLocal(now);
};

const rangeFor = (preset, from, to) => {
  const end = getTodayLocal();
  if (preset === 'daily') return { from: end, to: end };
  if (preset === 'weekly') {
    const now = new Date();
    if (now.getHours() < 4) now.setDate(now.getDate() - 1);
    return { from: formatDateLocal(new Date(now.getTime() - 6 * 86400000)), to: end };
  }
  if (preset === 'monthly') {
    const now = new Date();
    if (now.getHours() < 4) now.setDate(now.getDate() - 1);
    return { from: formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1)), to: end };
  }
  return { from: from || end, to: to || end };
};

const pickRows = (r, tab) => ({
  income: r?.income?.rows,
  expenses: r?.expenses?.rows,
  bank: r?.bank_statement?.rows,
  receivables: r?.receivables?.rows,
  premium: r?.premium?.rows,
  trial: r?.trial_balance?.rows
}[tab] || []);

const cell = (key, row) => {
  if (['amount', 'due', 'debit', 'credit', 'balance'].includes(key)) return money(row[key]);
  if (['date', 'due_date', 'start_date', 'expiry_date'].includes(key)) return date(row[key]);
  return row[key] || '-';
};

const Table = ({ tab, rows }) => (
  <div className="table-container" style={{ overflowX: 'auto', marginTop: '1rem' }}>
    <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {cols[tab].map((key) => (
            <th key={key} style={{
              padding: '1rem',
              textAlign: 'left',
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '2px solid #e2e8f0',
              background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
            }}>
              {key.replace(/_/g, ' ')}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length ? rows.map((row, i) => (
          <tr key={row.id || row.invoice_number || row.account_code || i} style={{
            borderBottom: '1px solid #f1f5f9',
            transition: 'background-color 0.2s ease'
          }}>
            {cols[tab].map((key) => (
              <td key={key} style={{
                padding: '1rem',
                color: '#334155',
                borderBottom: '1px solid #f1f5f9',
                fontSize: '0.875rem'
              }}>
                {cell(key, row)}
              </td>
            ))}
          </tr>
        )) : (
          <tr>
            <td colSpan={cols[tab].length} style={{ padding: '3rem', color: '#94a3b8', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📭</div>
              <div style={{ fontWeight: 500 }}>No data available for this period</div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default function AdminReportsHub() {
  const [preset, setPreset] = useState('monthly');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tab, setTab] = useState('overview');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printContentRef = useRef(null);
  const printHeaderRef = useRef(null);
  const range = useMemo(() => rangeFor(preset, from, to), [preset, from, to]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching report with date range:', range);
        const res = await api.get('/finance/report-suite', { params: range });
        console.log('Report data summary:', {
          total_income: res.data.summary?.total_income,
          total_expense: res.data.summary?.total_expense,
          income_rows: res.data.income?.rows?.length,
          expense_rows: res.data.expenses?.rows?.length
        });
        setReport(res.data);
      } catch (e) {
        console.error(e);
        setError('Unable to load finance reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range.from, range.to]);

  const exportPdf = async () => {
    const printContent = printContentRef.current;
    if (!printContent) {
      console.error('No content to export');
      return;
    }

    const info = getInstitutionInfo();

    // Find current tab label
    const currentTab = tabs.find(t => t[0] === tab);
    const reportName = currentTab ? currentTab[1] : 'Finance Report';
    const periodText = `Period: ${range.from} to ${range.to}`;

    // Build branded header with logo
    const headerHtml = await buildPdfHeaderHtml(reportName, periodText);

    // Create a temporary container with the full report content
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '100%';
    tempDiv.style.padding = '20px';
    tempDiv.style.background = 'white';
    tempDiv.style.fontFamily = "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

    // Add branded header
    tempDiv.innerHTML = headerHtml;

    // Clone the print content and append
    const contentClone = printContent.cloneNode(true);
    tempDiv.appendChild(contentClone);

    // Add footer
    const footer = document.createElement('div');
    footer.style.textAlign = 'center';
    footer.style.fontSize = '0.7rem';
    footer.style.color = '#94a3b8';
    footer.style.borderTop = '1px solid #e2e8f0';
    footer.style.paddingTop = '10px';
    footer.style.marginTop = '24px';
    footer.innerHTML = `Generated on ${new Date().toLocaleString()} | ${info.name} Finance System`;
    tempDiv.appendChild(footer);

    // PDF options
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `finance-report-${range.from}-to-${range.to}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape'
      }
    };

    // Generate PDF
    html2pdf()
      .set(opt)
      .from(tempDiv)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        pdf.setProperties({
          title: `Finance Report - ${reportName}`,
          subject: `Financial Report from ${range.from} to ${range.to}`,
          author: info.name,
          creator: `${info.name} Finance System`
        });
      })
      .save()
      .catch((error) => {
        console.error('PDF generation error:', error);
        alert('Failed to generate PDF. Please try again.');
      });
  };

  const s = report?.summary || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filters Card */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Date Presets and Range */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            {['daily', 'weekly', 'monthly', 'custom'].map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '999px',
                  border: `2px solid ${preset === p ? '#32619A' : '#cbd5e1'}`,
                  background: preset === p ? 'linear-gradient(135deg, #32619A 0%, #2a5282 100%)' : '#ffffff',
                  color: preset === p ? '#fff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
            <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginLeft: '0.5rem' }}>
              📅
            </span>
            <input
              type='date'
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={preset !== 'custom'}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: preset === 'custom' ? '#fff' : '#f1f5f9',
                color: preset === 'custom' ? '#334155' : '#94a3b8',
                fontSize: '0.875rem',
                cursor: preset === 'custom' ? 'pointer' : 'not-allowed'
              }}
            />
            <span style={{ color: '#cbd5e1' }}>→</span>
            <input
              type='date'
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={preset !== 'custom'}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: preset === 'custom' ? '#fff' : '#f1f5f9',
                color: preset === 'custom' ? '#334155' : '#94a3b8',
                fontSize: '0.875rem',
                cursor: preset === 'custom' ? 'pointer' : 'not-allowed'
              }}
            />
          </div>

          {/* Export Button */}
          <button
            onClick={exportPdf}
            disabled={loading || !!error}
            style={{
              background: loading || error
                ? '#94a3b8'
                : 'linear-gradient(135deg, #32619A 0%, #2a5282 100%)',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: loading || error ? 'not-allowed' : 'pointer',
              boxShadow: loading || error
                ? 'none'
                : '0 4px 15px rgba(50, 97, 154, 0.3)',
              transition: 'all 0.2s ease',
              opacity: loading || error ? 0.6 : 1,
              whiteSpace: 'nowrap'
            }}
          >
            <span>📄</span> {loading ? 'Loading...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.25rem' }}>
        {tabs.map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              border: 'none',
              background: tab === key
                ? 'linear-gradient(135deg, #32619A 0%, #2a5282 100%)'
                : 'transparent',
              color: tab === key ? '#fff' : '#64748b',
              fontWeight: tab === key ? 700 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: tab === key ? '0 4px 12px rgba(50, 97, 154, 0.25)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* Printable Content Container (only this goes to PDF) */}
      <div ref={printContentRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '4rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>⏳</div>
            <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>Loading finance report data...</div>
          </div>
        ) : null}

        {!loading && error ? (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            color: '#dc2626'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Unable to Load Report</div>
            <div style={{ color: '#7f1d1d' }}>{error}</div>
          </div>
        ) : null}

        {!loading && !error && (
          <>
            {tab === 'overview' ? (
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                textAlign: 'center',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.3 }}>📊</div>
                <h3 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>
                  Overview
                </h3>
                <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, maxWidth: '600px' }}>
                  Select a report type from the tabs above to view detailed financial data.
                  Available reports include Income, Expenses, Bank Statement, Receivables, Premium, and Trial Balance.
                </p>
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
              }}>
                <Table tab={tab} rows={pickRows(report, tab)} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
