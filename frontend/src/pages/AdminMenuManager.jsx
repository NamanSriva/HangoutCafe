import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './AdminMenuManager.css';

const AdminMenuManager = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    imageUrl: '',
    inventoryCount: ''
  });

  useEffect(() => {
    if (!user || (!user.isAdmin && user.email !== 'admin@hangoutcafe.com')) {
      navigate('/');
      return;
    }
    fetchItems();
  }, [user, navigate]);

  const fetchItems = async () => {
    try {
      const { data } = await axios.get('/api/menu');
      setItems(data);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      inventoryCount: item.inventoryCount
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        await axios.delete(`/api/menu/${id}`, config);
        toast.success('Item deleted successfully');
        fetchItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const payload = {
        ...formData,
        price: Number(formData.price),
        inventoryCount: Number(formData.inventoryCount),
      };

      if (editingId) {
        await axios.put(`/api/menu/${editingId}`, payload, config);
        toast.success('Item updated successfully');
      } else {
        await axios.post('/api/menu', payload, config);
        toast.success('Item created successfully');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', category: '', description: '', price: '', imageUrl: '', inventoryCount: '' });
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  if (loading) return <div className="loader container mt-4">Loading Menu Items...</div>;

  return (
    <div className="container admin-menu-container animate-fade-in">
      {!showForm ? (
        <>
          <div className="admin-menu-header">
            <div>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/admin')}
                style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}
              >
                <ArrowLeft size={16} className="mr-2" style={{ marginRight: '0.5rem' }} /> Back to Dashboard
              </button>
              <h1>Manage Menu <span className="highlight">Items</span></h1>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={20} style={{ marginRight: '0.5rem' }} /> Add New Item
            </button>
          </div>

          <div className="menu-list-grid">
            {items.map(item => (
              <div key={item._id} className="admin-menu-card glass">
                <img src={item.imageUrl} alt={item.name} />
                <h3>{item.name}</h3>
                <p>₹{item.price.toFixed(2)} | {item.category} | In Stock: {item.inventoryCount}</p>
                <div className="admin-menu-actions">
                  <button className="btn btn-secondary" onClick={() => handleEdit(item)}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={() => handleDelete(item._id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {items.length === 0 && <p>No items found. Try adding some!</p>}
        </>
      ) : (
        <div className="admin-form-container glass">
          <h2>{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" required />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Inventory Count</label>
              <input type="number" name="inventoryCount" value={formData.inventoryCount} onChange={handleChange} required />
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', category: '', description: '', price: '', imageUrl: '', inventoryCount: '' });
              }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminMenuManager;
