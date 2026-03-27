import React, { useState, useEffect } from 'react';
import { Loader2, Wallet, Plus, ChevronRight, Trash2 } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const ExpenseManager = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [liquidAccounts, setLiquidAccounts] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [split, setSplit] = useState({ split: [], grandTotal: 0 });
  const [activeTab, setActiveTab] = useState('expenses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ account_id: '', amount: '', description: '', category: '', payment_method: 'cash', date: '' });
  const [catForm, setCatForm] = useState({ name: '', parent_id: '', description: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, id: null, reason: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [expRes, liquidRes, splitRes, catRes, flatRes] = await Promise.all([
        api.get('/expenses').catch(() => ({ data: [] })),
        api.get('/finance/accounts/liquid').catch(() => ({ data: [] })),
        api.get('/expenses/split').catch(() => ({ data: { split: [], grandTotal: 0 } })),
        api.get('/expenses/categories').catch(() => ({ data: [] })),
        api.get('/expenses/categories/flat').catch(() => ({ data: [] }))
      ]);
      setExpenses(expRes.data);
      setLiquidAccounts(liquidRes.data);
      if (liquidRes.data.length > 0) {
        setForm(prev => ({ ...prev, account_id: liquidRes.data[0].id, payment_method: liquidRes.data[0].sub_type }));
      }
      setSplit(splitRes.data);
      setCategories(catRes.data);
      setFlatCategories(flatRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (selectedFile) formData.append('receipt', selectedFile);

      await api.post('/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsModalOpen(false);
      setSelectedFile(null);
      setForm({ account_id: '', amount: '', description: '', category: '', payment_method: 'cash', date: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to submit expense'); }
    finally { setSubmitting(false); }
  };

  const handleVerify = async (id) => {
    try {
      await api.put(`/expenses/${id}/verify`);
      fetchData();
    } catch (err) { alert('Verification failed'); }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/expenses/${id}/approve`);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Approval failed'); }
  };

  const handleReject = async () => {
    try {
      await api.put(`/expenses/${rejectionModal.id}/reject`, { rejection_reason: rejectionModal.reason });
      setRejectionModal({ isOpen: false, id: null, reason: '' });
      fetchData();
    } catch (err) { alert('Rejection failed'); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/expenses/categories', catForm);
      setCatForm({ name: '', parent_id: '', description: '' });
      setShowCatForm(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Deactivate this category and all sub-categories?')) return;
    try { await api.delete(`/expenses/categories/${id}`); fetchData(); } catch (err) { alert('Failed'); }
  };

  const catColors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

  if (loading) return <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={48} className="animate-spin" color="var(--primary)" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Expense Manager</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Track, categorize, and approve all branch expenses</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => setActiveTab(activeTab === 'categories' ? 'expenses' : 'categories')} style={{ fontSize: '0.8rem' }}>
            {activeTab === 'categories' ? '← Expenses' : '⚙ Categories'}
          </button>
          {activeTab === 'expenses' && <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ fontSize: '0.8rem' }}>+ Record Expense</button>}
          {activeTab === 'categories' && <button className="btn-primary" onClick={() => setShowCatForm(!showCatForm)} style={{ fontSize: '0.8rem' }}>+ Add Category</button>}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #ef4444' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>TOTAL EXPENSES</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>৳{(split.grandTotal || 0).toLocaleString()}</h2>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #10b981' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>APPROVED</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{expenses.filter(e => e.status === 'approved').length}</h2>
        </div>
        <div className="glass-morphism" style={{ padding: '1.5rem', borderTop: '3px solid #f59e0b' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>CATEGORIES</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{categories.length} heads</h2>
        </div>
      </div>

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <>
          {/* Split + Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            {/* Category Split */}
            <div className="glass-morphism" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Category Breakdown</h3>
              {split.split?.map((item, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>{item.category}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>৳{item.total.toLocaleString()} ({item.percentage}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--glass)', borderRadius: '3px' }}>
                    <div style={{ width: `${item.percentage}%`, height: '100%', background: catColors[i % catColors.length], borderRadius: '3px' }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Expense Table */}
            <div className="glass-morphism" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem' }}>Expense Records</h3>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--glass)', padding: '0.3rem', borderRadius: '8px' }}>
                  {['all', 'pending', 'verified', 'approved'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{ 
                      padding: '0.4rem 0.8rem', fontSize: '0.7rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                      background: filterStatus === s ? 'var(--primary)' : 'transparent',
                      color: filterStatus === s ? '#fff' : 'var(--text-dim)'
                    }}>{s.toUpperCase()}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1fr 0.8fr 0.8fr 0.8fr 1.2fr', gap: '0.5rem', padding: '0.8rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                <span>DATE</span><span>DESCRIPTION</span><span>CATEGORY</span><span>AMOUNT</span><span>METHOD</span><span>STATUS</span><span>ACTIONS</span>
              </div>
              {expenses.filter(e => filterStatus === 'all' || e.status === filterStatus).map((exp, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 1fr 0.8fr 0.8fr 0.8fr 1.2fr', gap: '0.5rem', padding: '1rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem' }}>{new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    {exp.receipt_url && <a href={`http://localhost:5000${exp.receipt_url}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.6rem', color: 'var(--primary)', textDecoration: 'none' }}>📎 Receipt</a>}
                  </div>
                  <span>{exp.description}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{exp.category}</span>
                  <span style={{ fontWeight: '700', color: '#ef4444' }}>৳{parseFloat(exp.amount).toLocaleString()}</span>
                  <span style={{ fontSize: '0.75rem' }}>{exp.payment_method}</span>
                  <span>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '10px', fontSize: '0.6rem', fontWeight: '700',
                      background: exp.status === 'approved' ? 'rgba(16,185,129,0.1)' : exp.status === 'verified' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                      color: exp.status === 'approved' ? '#10b981' : exp.status === 'verified' ? '#3b82f6' : '#f59e0b',
                      border: `1px solid ${exp.status === 'approved' ? '#10b98130' : exp.status === 'verified' ? '#3b82f630' : '#f59e0b30'}`
                    }}>{exp.status.toUpperCase()}</span>
                  </span>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {exp.status === 'pending' && <button onClick={() => handleVerify(exp.id)} style={{ padding: '4px 8px', fontSize: '0.65rem', background: '#3b82f6', color: '#white', border: 'none', borderRadius: '4px' }}>Verify</button>}
                    {exp.status === 'verified' && <button onClick={() => handleApprove(exp.id)} style={{ padding: '4px 8px', fontSize: '0.65rem', background: '#10b981', color: '#white', border: 'none', borderRadius: '4px' }}>Approve</button>}
                    {(exp.status === 'pending' || exp.status === 'verified') && <button onClick={() => setRejectionModal({ isOpen: true, id: exp.id, reason: '' })} style={{ padding: '4px 8px', fontSize: '0.65rem', background: '#ef4444', color: '#white', border: 'none', borderRadius: '4px' }}>Reject</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <>
          {showCatForm && (
            <div className="glass-morphism" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Add Expense Category</h3>
              <form onSubmit={handleCreateCategory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>Category Name</label>
                  <input required value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} placeholder="e.g. Office Rent"
                    style={{ width: '100%', padding: '0.7rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>Parent (Head) — leave empty for new head</label>
                  <select value={catForm.parent_id} onChange={e => setCatForm({...catForm, parent_id: e.target.value})}
                    style={{ width: '100%', padding: '0.7rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}>
                    <option value="">— None (Expense Head) —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>Description</label>
                  <input value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} placeholder="Optional"
                    style={{ width: '100%', padding: '0.7rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '0.7rem 1.5rem' }}>{submitting ? 'Saving...' : 'Add'}</button>
              </form>
            </div>
          )}

          <div className="glass-morphism" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Expense Category Tree</h3>
            {categories.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>No categories yet. Click "+ Add Category" to create your first Expense Head.</p>
            ) : categories.map((head, i) => (
              <div key={head.id} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: `${catColors[i % catColors.length]}10`, borderRadius: '8px', borderLeft: `4px solid ${catColors[i % catColors.length]}` }}>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>📁 {head.name}</p>
                    {head.description && <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{head.description}</p>}
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.6rem', fontWeight: '700', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>HEAD</span>
                  </div>
                  <Trash2 size={14} style={{ cursor: 'pointer', color: '#ef4444', opacity: 0.5 }} onClick={() => handleDeleteCategory(head.id)} />
                </div>
                {head.Children?.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem 0.8rem 2.5rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ChevronRight size={14} color="var(--text-dim)" />
                      <span style={{ fontSize: '0.85rem' }}>{sub.name}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.55rem', fontWeight: '700', background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>SUB</span>
                    </div>
                    <Trash2 size={12} style={{ cursor: 'pointer', color: '#ef4444', opacity: 0.4 }} onClick={() => handleDeleteCategory(sub.id)} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsModalOpen(false)}>
          <div className="glass-morphism" style={{ padding: '2rem', width: '500px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>Record New Expense</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem', display: 'block' }}>Expense Category / Head</label>
                <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}>
                  <option value="">Select Expense Category</option>
                  {flatCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.Parent ? `${cat.Parent.name} > ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem', display: 'block' }}>Paid From (Bank/Cash Ledger)</label>
                <select required value={form.account_id} onChange={e => {
                  const acc = liquidAccounts.find(a => a.id.toString() === e.target.value);
                  setForm({...form, account_id: e.target.value, payment_method: acc?.sub_type || 'cash'});
                }} style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}>
                  {liquidAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.sub_type.toUpperCase()})</option>
                  ))}
                  {liquidAccounts.length === 0 && <option value="">No Accounts Found - Configure in Bank & Cash</option>}
                </select>
              </div>

              <input required type="number" placeholder="Amount (BDT) precisely" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={{ padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.3rem', display: 'block' }}>Payment Reference / Receipt (PDF/Images)</label>
                <input type="file" onChange={e => setSelectedFile(e.target.files[0])} style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              </div>

              <textarea placeholder="Specific Description / Payee Notes" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', height: '80px' }} />
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
              
              <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '1rem', background: '#ef4444', borderColor: '#ef4444' }}>
                {submitting ? 'Uploading Receipt...' : 'Record Expense for Verification'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }} onClick={() => setRejectionModal({ isOpen: false, id: null, reason: '' })}>
          <div className="glass-morphism" style={{ padding: '2rem', width: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Reject Expense</h3>
            <textarea placeholder="Enter rejection reason..." value={rejectionModal.reason} onChange={e => setRejectionModal({...rejectionModal, reason: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', height: '100px', marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => setRejectionModal({ isOpen: false, id: null, reason: '' })} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={handleReject} style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444' }}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;
