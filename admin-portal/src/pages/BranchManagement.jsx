import React, { useState, useEffect } from 'react';
import { Building2, Mail, MapPin, Phone, ShieldCheck, Plus, X, Loader2 } from 'lucide-react';
import api from '../services/api';
import '../styles/GlobalStyles.css';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    admin_name: 'Branch Admin',
    admin_password: ''
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data);
    } catch (err) {
      console.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/branches', formData);
      setShowModal(false);
      fetchBranches();
      setFormData({ name: '', code: '', address: '', phone: '', email: '', admin_name: 'Branch Admin', admin_password: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create branch');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="canvas"><Loader2 className="animate-spin" color="var(--primary)" size={48} /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Network Management</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Global directory of all branches and their primary administrators</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Provision New Branch</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {branches.map((branch) => (
          <div key={branch.id} className="glass-morphism" style={{ padding: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '0.8rem', borderRadius: '12px' }}>
                <Building2 color="var(--primary)" size={24} />
              </div>
              <span style={{ 
                fontSize: '0.7rem', 
                background: branch.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: branch.is_active ? 'var(--success)' : 'var(--danger)',
                padding: '4px 10px',
                borderRadius: '12px',
                height: 'fit-content',
                fontWeight: '600'
              }}>
                {branch.is_active ? 'OPERATIONAL' : 'DEACTIVATED'}
              </span>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{branch.name}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>Branch Code: <span style={{ color: 'var(--primary)' }}>{branch.code}</span></p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                <MapPin size={16} /> <span>{branch.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                <Phone size={16} /> <span>{branch.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                <Mail size={16} /> <span>{branch.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                <ShieldCheck size={16} /> <span>Managed by: {branch.Manager?.name || 'Assigned Admin'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Provisioning Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.8)', zIndex: 2000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-morphism" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', position: 'relative' }}>
            <X 
              size={24} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', cursor: 'pointer', color: 'var(--text-dim)' }} 
              onClick={() => setShowModal(false)}
            />
            <h2 style={{ marginBottom: '0.5rem' }}>Branch Provisioning</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '2rem' }}>Initialize a new branch location and its primary administrator</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Branch Name</label>
                  <input 
                    className="glass-morphism" 
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', color: 'white', background: 'none' }}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Chittagong Port Branch"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Branch Code</label>
                  <input 
                    className="glass-morphism" 
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', color: 'white', background: 'none' }}
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="e.g. CTG-01"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Full Address</label>
                <input 
                  className="glass-morphism" 
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', color: 'white', background: 'none' }}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Street name, Area, City"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Contact Phone</label>
                  <input 
                    className="glass-morphism" 
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', color: 'white', background: 'none' }}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+880..."
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Official Email</label>
                  <input 
                    className="glass-morphism" 
                    style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', color: 'white', background: 'none' }}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="branch@renetech.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '1.2rem', background: 'var(--glass)', borderRadius: 'var(--radius)', border: '1px dashed var(--primary)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--primary)' }}>Administrative Credentials</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Admin Email</label>
                    <input 
                      disabled 
                      value={formData.email} 
                      style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--text-dim)', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'block' }}>Initial Password</label>
                    <input 
                      className="glass-morphism" 
                      style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', color: 'white', background: 'none', borderRadius: '8px' }}
                      value={formData.admin_password}
                      onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                      type="password"
                      placeholder="Min 8 characters"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="btn-primary" 
                style={{ marginTop: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}
              >
                {formLoading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Branch Provisioning'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
