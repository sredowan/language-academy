import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Wrench, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/Modal';
import '../styles/GlobalStyles.css';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'hardware',
    serial_no: '',
    purchase_date: '',
    cost: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await api.get('/assets');
      setAssets(res.data);
    } catch (err) {
      console.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assets', formData);
      setShowModal(false);
      setFormData({ name: '', type: 'hardware', serial_no: '', purchase_date: '', cost: '', status: 'active', notes: '' });
      fetchAssets();
    } catch (err) {
      alert('Failed to add asset');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
    } catch (err) {
      alert('Failed to delete asset');
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.serial_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'maintenance': return <Badge variant="warning">Maintenance</Badge>;
      case 'retired': return <Badge variant="danger">Retired</Badge>;
      case 'lost': return <Badge variant="danger">Lost</Badge>;
      default: return <Badge variant="primary">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>ERP Asset Management</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Track branch equipment, hardware, and furniture inventory</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setShowModal(true)}>Register New Asset</Button>
      </div>

      <div className="glass-morphism" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Input 
            placeholder="Search by asset name or serial number..." 
            icon={<Search size={18} />} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="secondary" icon={<Filter size={18} />}>Filters</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem' }}>
            <Package className="animate-spin" size={48} color="var(--primary)" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '5rem', color: 'var(--text-dim)' }}>
            No assets found in the inventory.
          </div>
        ) : filteredAssets.map(asset => (
          <Card key={asset.id} title={asset.name} subtitle={asset.serial_no || 'No Serial #'} icon={<Package size={20} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{asset.type}</span>
                {getStatusBadge(asset.status)}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Purchase Date</p>
                  <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={12} /> {asset.purchase_date || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Cost</p>
                  <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <DollarSign size={12} /> {asset.cost || '0.00'} BDT
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(asset.id)} style={{ color: 'rgba(239, 68, 68, 0.4)' }}>
                  <Trash2 size={16} />
                </Button>
                <Button variant="secondary" size="sm" icon={<Wrench size={14} />}>Manage</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New Asset">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <Input 
            label="Asset Name" 
            required 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            placeholder="e.g. Epson EB-X06 Projector"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Type</label>
              <select 
                className="glass-input" 
                style={{ width: '100%', padding: '0.8rem' }}
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="hardware">Hardware / IT</option>
                <option value="furniture">Furniture</option>
                <option value="appliance">Appliance</option>
                <option value="stationery">Stationery</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input 
              label="Serial Number" 
              value={formData.serial_no} 
              onChange={(e) => setFormData({...formData, serial_no: e.target.value})} 
              placeholder="S/N: 123456"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input 
              label="Purchase Date" 
              type="date" 
              value={formData.purchase_date} 
              onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} 
            />
            <Input 
              label="Purchase Cost (BDT)" 
              type="number" 
              value={formData.cost} 
              onChange={(e) => setFormData({...formData, cost: e.target.value})} 
              placeholder="0.00"
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.5rem', display: 'block' }}>Initial Status</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               {['active', 'maintenance', 'retired'].map(s => (
                 <button 
                  key={s} 
                  type="button" 
                  onClick={() => setFormData({...formData, status: s})}
                  style={{ 
                    flex: 1, 
                    padding: '0.6rem', 
                    borderRadius: '8px', 
                    background: formData.status === s ? 'var(--primary)' : 'var(--glass)',
                    color: formData.status === s ? 'black' : 'white',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}
                 >
                   {s}
                 </button>
               ))}
            </div>
          </div>
          <Button type="submit" style={{ marginTop: '1rem', padding: '1rem' }}>Register Asset</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Assets;
