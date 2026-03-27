import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CreditCard, Receipt, Search, Download } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import '../styles/GlobalStyles.css';

const POSFees = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [stats, setStats] = useState({ totalCollected: 0, pending: 0, overdue: 0 });
  const [methodFilter, setMethodFilter] = useState('all');
  const [liquidAccounts, setLiquidAccounts] = useState([]);

  const [activeTab, setActiveTab] = useState('pending'); // recent, pending
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  
  const [paymentData, setPaymentData] = useState({ amount: '', account_id: '', method: 'cash', transaction_ref: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const numberToWords = (num) => {
    if (num === 0) return 'Zero Taka Only';
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() + ' Taka Only';
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [txRes, pendingRes, statsRes, accRes] = await Promise.all([
        api.get('/pos/transactions').catch(() => ({ data: [] })),
        api.get('/pos/pending').catch(() => ({ data: [] })),
        api.get('/finance/overview').catch(() => ({ data: {} })),
        api.get('/finance/accounts/liquid').catch(() => ({ data: [] }))
      ]);
      setTransactions(txRes.data || []);
      setPendingInvoices(pendingRes.data || []);
      setStats({
        totalCollected: statsRes.data.feeCollected || 0,
        pending: statsRes.data.receivablesDue || 0,
        overdue: statsRes.data.overdueReceivables || 0
      });
      setLiquidAccounts(accRes.data || []);
      if (accRes.data?.length > 0) {
        setPaymentData(prev => ({ ...prev, account_id: accRes.data[0].id, method: accRes.data[0].sub_type }));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const methodColors = { bkash: '#e2136e', nagad: '#f6921e', card: '#3b82f6', cash: '#10b981', bank_transfer: '#8b5cf6' };

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>POS & Fee Management</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Dynamic invoicing · Ledger integration · Receipt generation</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button className={`btn-${activeTab === 'pending' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('pending')} style={{ fontSize: '0.8rem' }}>Pending Fees</button>
          <button className={`btn-${activeTab === 'recent' ? 'primary' : 'secondary'}`} onClick={() => setActiveTab('recent')} style={{ fontSize: '0.8rem' }}>Transactions</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #10b981' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOTAL COLLECTED</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>৳{stats.totalCollected.toLocaleString()}</h2>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #f59e0b' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>PENDING</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>৳{stats.pending.toLocaleString()}</h2>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #ef4444' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>OVERDUE</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>৳{stats.overdue.toLocaleString()}</h2>
        </div>
      </div>

      {/* Main Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem' }}>
          
          {activeTab === 'recent' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem' }}>Recent Transactions</h3>
                <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} style={{ padding: '0.5rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.8rem' }}>
                  <option value="all">All Methods</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <span>RECEIPT</span><span>STUDENT</span><span>AMOUNT</span><span>METHOD</span><span>DATE</span><span>ACT</span>
              </div>

              {transactions.filter(r => methodFilter === 'all' || r.method === methodFilter).map((row, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '1rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>TRX-{row.id}</span>
                  <span style={{ fontWeight: '500' }}>{row.Enrollment?.Student?.User?.name || 'Unknown'}</span>
                  <span style={{ fontWeight: '700' }}>৳{parseFloat(row.amount).toLocaleString()}</span>
                  <span><span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600', background: `${methodColors[row.method] || '#ccc'}25`, color: methodColors[row.method] || '#ccc' }}>{row.method}</span></span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(row.paid_at).toLocaleDateString()}</span>
                  <span><button onClick={() => { setSelectedTx(row); setShowReceiptModal(true); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem' }}>Receipt</button></span>
                </div>
              ))}
              {transactions.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No recent transactions.</p>}
            </>
          )}

          {activeTab === 'pending' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem' }}>Pending Fees & Dues</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <span>INVOICE</span><span>STUDENT</span><span>DUE AMT</span><span>STATUS</span><span>ACTION</span>
              </div>

              {pendingInvoices.map((inv, i) => {
                const due = parseFloat(inv.amount) - parseFloat(inv.paid);
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr', gap: '0.5rem', padding: '1rem 0', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{inv.invoice_no}</span>
                    <span style={{ fontWeight: '500' }}>{inv.Student?.User?.name || 'Unknown'}</span>
                    <span style={{ fontWeight: '700', color: '#f59e0b' }}>৳{due.toLocaleString()}</span>
                    <span><span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '600', background: 'rgba(245,158,11,0.15)', color: '#f59e0b'}}>{inv.status}</span></span>
                    <span>
                      <button onClick={() => { setSelectedInvoice(inv); setPaymentData({...paymentData, amount: due}); setShowCollectModal(true); }} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>Collect</button>
                    </span>
                  </div>
                );
              })}
              {pendingInvoices.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No pending invoices found.</p>}
            </>
          )}
        </div>

        {/* Payment Channels */}
        <div className="glass-morphism" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Payment Channels (All Time)</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: `conic-gradient(#e2136e 0% 57%, #f6921e 57% 84%, #3b82f6 84% 96%, #10b981 96% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>5</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>Channels</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.keys(methodColors).map((ch, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: methodColors[ch] }}></span>
                  <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{ch.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collect Fee Modal */}
      <Modal isOpen={showCollectModal} onClose={() => setShowCollectModal(false)} title="Collect Fee & Post to Ledger">
        <form onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          try {
            const payload = {
              enrollment_id: selectedInvoice.enrollment_id,
              amount: paymentData.amount,
              method: paymentData.method,
              account_id: paymentData.account_id,
              transaction_ref: paymentData.transaction_ref,
              notes: paymentData.notes
            };
            const res = await api.post('/pos/collect-fee', payload);
            
            // Auto Update Invoice Status
            const newPaid = parseFloat(selectedInvoice.paid) + parseFloat(paymentData.amount);
            const status = newPaid >= parseFloat(selectedInvoice.amount) ? 'paid' : 'partial';
            await api.put(`/invoices/${selectedInvoice.id}`, { paid: newPaid, status });
            
            setShowCollectModal(false);
            setPaymentData({ amount: '', method: 'cash', transaction_ref: '', notes: '' });
            alert(res.data.message || 'Fee collected and Journal recorded!');
            fetchData();
          } catch(err) {
            alert(err.response?.data?.error || 'Failed to collect fee');
          } finally {
            setSubmitting(false);
          }
        }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
          
          <div style={{ gridColumn: 'span 2', background: 'var(--bg-deep)', padding: '1rem', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Student: <strong>{selectedInvoice?.Student?.User?.name}</strong></p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>Invoice No: {selectedInvoice?.invoice_no}</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>Total Due: <strong style={{color: '#f59e0b'}}>৳{parseFloat(selectedInvoice?.amount) - parseFloat(selectedInvoice?.paid)}</strong></p>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>Amount precisely (BDT)</label>
            <input required type="number" step="0.01" className="glass-input" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>Deposit To Account</label>
            <select className="glass-input" value={paymentData.account_id} onChange={e => {
              const acc = liquidAccounts.find(a => a.id.toString() === e.target.value);
              setPaymentData({...paymentData, account_id: e.target.value, method: acc?.sub_type || 'cash'});
            }}>
              {liquidAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.sub_type.toUpperCase()})
                </option>
              ))}
              {liquidAccounts.length === 0 && <option value="">No Accounts Found - Configure in Bank & Cash</option>}
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>Transaction Ref (if Online/Card/Bank)</label>
            <input className="glass-input" value={paymentData.transaction_ref} onChange={e => setPaymentData({...paymentData, transaction_ref: e.target.value})} placeholder="TrxID / Cheque No" />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary" style={{ gridColumn: 'span 2', padding: '1rem', background: '#10b981', borderColor: '#10b981' }}>
            {submitting ? 'Processing Ledger...' : 'Collect Fee & Record Journal Entry'}
          </button>
        </form>
      </Modal>

      {/* Highly Detailed Receipt Modal */}
      <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title="Official Receipt">
        {selectedTx && (
          <div style={{ background: '#ffffff', color: '#000000', padding: '2rem', borderRadius: '4px', maxWidth: '600px', margin: '0 auto', fontFamily: 'monospace' }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '2px' }}>LANGUAGE ACADEMY</h2>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>HQ: Uttara Sector 11, Dhaka</p>
              <h3 style={{ margin: '1rem 0 0 0', background: '#000', color: '#fff', display: 'inline-block', padding: '4px 12px' }}>MONEY RECEIPT</h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Receipt No:</strong> RCP-{selectedTx.id}-{Date.now().toString().slice(-4)}</p>
                <p style={{ margin: '0' }}><strong>Date / Time:</strong> {new Date(selectedTx.paid_at).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}><strong>Branch:</strong> Utama</p>
                <p style={{ margin: '0' }}><strong>Method:</strong> {selectedTx.method.toUpperCase()}</p>
              </div>
            </div>

            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <tbody>
                <tr><td style={{ padding: '0.5rem 0', fontWeight: 'bold', width: '35%' }}>Student ID:</td><td>STU-{selectedTx.Enrollment?.student_id}</td></tr>
                <tr><td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>Name:</td><td>{selectedTx.Enrollment?.Student?.User?.name}</td></tr>
                <tr><td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>Batch Code:</td><td>{selectedTx.Enrollment?.Batch?.code || 'N/A'}</td></tr>
              </tbody>
            </table>

            <div style={{ border: '1px solid #000', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1.2rem' }}>Amount Received:</strong>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '1.5rem', display: 'block' }}>BDT {parseFloat(selectedTx.amount).toLocaleString()}</strong>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', fontStyle: 'italic' }}>{numberToWords(Math.floor(parseFloat(selectedTx.amount)))}</span>
              </div>
            </div>

            <div style={{ minHeight: '80px' }}>
              <p style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                Notes: {selectedTx.transaction_ref ? `Ref: ${selectedTx.transaction_ref}` : 'Tuition Fee Payment'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid #ccc', paddingTop: '1rem', fontSize: '0.8rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 2.5rem 0', borderBottom: '1px solid #000', width: '150px' }}></p>
                Authorized By
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 2.5rem 0', borderBottom: '1px solid #000', width: '150px' }}></p>
                Student Signature
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default POSFees;
