import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Shield, Plus, UserPlus, FileText, Check, Edit2, Trash2, X } from 'lucide-react';
import SelectorCard from '../../../components/SelectorCard/SelectorCard';
import TacticalModal from '../../../components/UI/TacticalModal';
import '../../../css/dashboard.css';
import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const AddUser = () => {
    const { currentUser } = useAuth();

    // Add user state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'Player',
        position: 'Guard'
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Users list and edit state
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        username: '', password: '', height: '', weight: '', age: '',
        phone: '', email: '', bio: '', jersey_number: '', position_or_dept: ''
    });
    const [showModal, setShowModal] = useState(false);

    const roles = ['Player', 'Coach', 'President', 'Medical', 'Office'];
    const positions = ['Guard', 'Forward', 'Center'];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('username', formData.username);
            data.append('password', formData.password);
            data.append('role', formData.role);
            if (formData.role === 'Player') {
                data.append('position', formData.position);
            }
            if (photoFile) {
                data.append('photo', photoFile);
            }

            await axios.post('http://localhost:5000/api/auth/add-user', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', message: 'Club user added successfully.' });
            setFormData({ username: '', password: '', role: 'Player', position: 'Guard' });
            setPhotoFile(null);

            // Auto reload users list natively
            fetchUsers();
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to add user.' });
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditFormData({
            username: user.username,
            password: '',
            height: user.height || '',
            weight: user.weight || '',
            age: user.age || '',
            phone: user.phone || '',
            email: user.email || '',
            bio: user.bio || '',
            jersey_number: user.jersey_number || '',
            position_or_dept: user.position_or_dept || ''
        }); // password left empty intentionally
        setShowModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/auth/users/${editingUser.id}`, editFormData);

            // Re-fetch users
            fetchUsers();
            setShowModal(false);
            setEditingUser(null);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update user.');
        }
    };

    const handleDeleteUser = async (id, e) => {
        if (e) {
            e.stopPropagation();
        }
        if (window.confirm('Are you sure you want to delete this user? This will also remove their player/staff profile permanently.')) {
            try {
                await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
                fetchUsers();
                if (editingUser?.id === id) {
                    setShowModal(false);
                }
            } catch (err) {
                console.error(err);
                alert('Failed to delete user.');
            }
        }
    };

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">USERS</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">EXECUTIVE HR</span>
                    <h1 className="hero-dashboard-title">
                        PERSONNEL <br />
                        <span className="accent-text">MANAGEMENT</span>
                    </h1>
                </div>
            </div>

            <div className="report-layout-v2" style={{ marginTop: '20px' }}>
                <div className="report-briefing-column">
                    <div className="intel-card animate-slide-up" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="briefing-banner report-bg" style={{ background: 'linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ background: '#DB0A40', padding: '15px', borderRadius: '4px' }}>
                                    <UserPlus size={32} color="#fff" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px' }}>ADD NEW USER</h3>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#DB0A40', fontWeight: 'bold' }}>SYSTEM ACCESS PROVISIONING</p>
                                </div>
                            </div>
                        </div>

                        <div className="briefing-core" style={{ padding: '2rem' }}>
                            {status.message && (
                                <div style={{
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    borderRadius: '4px',
                                    border: `1px solid ${status.type === 'success' ? 'rgba(76, 209, 55, 0.2)' : 'rgba(219, 10, 64, 0.2)'}`,
                                    background: status.type === 'success' ? 'rgba(76, 209, 55, 0.05)' : 'rgba(219, 10, 64, 0.05)',
                                    color: status.type === 'success' ? '#4cd137' : '#DB0A40',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    {status.type === 'success' ? <Check size={18} /> : <span>⚠️</span>}
                                    {status.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="inline-submission-form">
                                <div className="form-layout-refined">
                                    <div className="form-group-refined">
                                        <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>FULL NAME (USERNAME)</label>
                                        <input
                                            type="text"
                                            placeholder="Enter precise personnel name..."
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            required
                                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '15px', width: '100%', fontSize: '1rem' }}
                                        />
                                    </div>

                                    <div className="form-row-refined" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                        <div className="form-group-refined">
                                            <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>SECURITY PASSWORD</label>
                                            <input
                                                type="password"
                                                placeholder="Assign physical access code..."
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                required
                                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '15px', width: '100%', fontSize: '1rem' }}
                                            />
                                        </div>

                                        <div className="form-group-refined">
                                            <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>OPERATIONAL ROLE</label>
                                            <SelectorCard
                                                value={formData.role}
                                                onChange={val => setFormData({ ...formData, role: val })}
                                                options={roles.map(r => ({ label: r.toUpperCase(), value: r }))}
                                            />
                                        </div>

                                        <div className="form-group-refined" style={{ gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>PERSONNEL PHOTO (OPTIONAL)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setPhotoFile(e.target.files[0])}
                                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '15px', width: '100%', fontSize: '1rem' }}
                                            />
                                        </div>

                                        {formData.role === 'Player' && (
                                            <div className="form-group-refined" style={{ gridColumn: 'span 2' }}>
                                                <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>PLAYER POSITION</label>
                                                <SelectorCard
                                                    value={formData.position}
                                                    onChange={val => setFormData({ ...formData, position: val })}
                                                    options={positions.map(p => ({ label: p.toUpperCase(), value: p }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="form-actions-refined" style={{ marginTop: '30px' }}>
                                    <button type="submit" className="intel-btn-primary" style={{ width: '100%', justifyContent: 'center', height: '50px' }}>
                                        <Plus size={18} style={{ marginRight: '10px' }} />
                                        PROVISION NEW ACCESS
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column: List of Users Network */}
                <div className="report-feed-column" style={{ marginLeft: '1rem' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        {users.map(user => (
                            <div
                                key={user.id}
                                onClick={() => openEditModal(user)}
                                style={{
                                    position: 'relative',
                                    aspectRatio: '3/4',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    background: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'transform 0.2s ease'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.children[1].style.opacity = 1;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.children[1].style.opacity = 0;
                                }}
                            >
                                <img
                                    src={user.photo_url || '/assets/players/default.png'}
                                    alt={user.username}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.src = '/assets/players/default.png'; }}
                                />
                                {/* Hover Overlay */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, width: '100%', height: '100%',
                                    background: 'linear-gradient(to top, rgba(219,10,64,0.9), transparent)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    padding: '15px',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                }}>
                                    <span style={{ fontSize: '0.7rem', color: '#fff', letterSpacing: '2px', fontWeight: 'bold' }}>{user.role?.toUpperCase()}</span>
                                    <h4 style={{ margin: '5px 0 0 0', color: '#fff', fontSize: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{user.username}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tactical Modal for Editing User */}
            <TacticalModal isOpen={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleEditSubmit} style={{ display: 'contents' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        padding: '3rem 2rem',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem',
                        height: '100%',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '12px', height: '12px', background: '#DB0A40', clipPath: 'polygon(0% 0%, 100% 0%, 75% 100%, 0% 100%)' }}></div>
                                <span style={{ fontSize: '0.65rem', letterSpacing: '3px', color: '#DB0A40', fontWeight: '900' }}>USER DOSSIER</span>
                            </div>
                            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-2px', lineHeight: 0.9, textTransform: 'uppercase' }}>
                                PERSON<br /><span style={{ color: 'rgba(255,255,255,0.3)' }}>PROFILE</span>
                            </h1>
                        </div>

                        {editingUser && (
                            <div style={{
                                width: '100%',
                                aspectRatio: '3/4',
                                background: '#111',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                marginTop: '1rem'
                            }}>
                                <img
                                    src={editingUser.photo_url || '/assets/players/default.png'}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.src = '/assets/players/default.png'; }}
                                />
                            </div>
                        )}

                        <div style={{ marginTop: 'auto', fontSize: '0.55rem', color: '#444', letterSpacing: '2px', fontFamily: 'monospace' }}>
                            SYSTEM_ID: {editingUser?.id ? editingUser.id.substring(0, 8).toUpperCase() : ''}<br />
                            STATUS: MODIFICATION<br />
                            ORIGIN: HR_DASHBOARD
                        </div>
                    </div>

                    <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Update Personnel Info</h2>
                                <p style={{ color: '#555', fontSize: '0.75rem', margin: '4px 0 0 0' }}>Edit name, password or remove access privileges.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', width: '36px', height: '36px', borderRadius: '4px', color: '#777', cursor: 'pointer', transition: '0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#DB0A40'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#777'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name (Username)</label>
                                    <input
                                        type="text"
                                        value={editFormData.username}
                                        onChange={e => setEditFormData({ ...editFormData, username: e.target.value })}
                                        required
                                        style={{
                                            width: '100%', padding: '15px',
                                            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '0', color: 'white', fontSize: '1rem', fontWeight: 'bold'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>New Password (Optional)</label>
                                    <input
                                        type="password"
                                        value={editFormData.password}
                                        onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                                        placeholder="Leave blank to keep unchanged..."
                                        style={{
                                            width: '100%', padding: '15px',
                                            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '0', color: 'white', fontSize: '1rem', fontWeight: 'bold'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.7rem' }}>HEIGHT</label>
                                    <input type="text" value={editFormData.height} onChange={e => setEditFormData({ ...editFormData, height: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.7rem' }}>WEIGHT</label>
                                    <input type="text" value={editFormData.weight} onChange={e => setEditFormData({ ...editFormData, weight: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.7rem' }}>AGE</label>
                                    <input type="number" value={editFormData.age} onChange={e => setEditFormData({ ...editFormData, age: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.7rem' }}>EMAIL</label>
                                    <input type="email" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.7rem' }}>PHONE</label>
                                    <input type="text" value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '15px' }}>
                                {editingUser?.role === 'Player' && (
                                    <div>
                                        <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.7rem' }}>JERSEY NO.</label>
                                        <input type="number" value={editFormData.jersey_number} onChange={e => setEditFormData({ ...editFormData, jersey_number: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                    </div>
                                )}
                                <div style={{ gridColumn: editingUser?.role === 'Player' ? 'auto' : 'span 2' }}>
                                    <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.7rem' }}>POSITION / DESC.</label>
                                    <input type="text" value={editFormData.position_or_dept} onChange={e => setEditFormData({ ...editFormData, position_or_dept: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.7rem' }}>BIOGRAPHY / NOTES</label>
                                <textarea rows="3" value={editFormData.bio} onChange={e => setEditFormData({ ...editFormData, bio: e.target.value })} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}></textarea>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                            <button
                                type="button"
                                onClick={(e) => editingUser && handleDeleteUser(editingUser.id, e)}
                                style={{
                                    background: 'rgba(219, 10, 64, 0.1)', color: '#DB0A40', border: '1px solid rgba(219, 10, 64, 0.3)',
                                    padding: '1rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                <Trash2 size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                                Delete Access
                            </button>
                            <button
                                type="submit"
                                style={{
                                    background: '#DB0A40', color: '#fff', border: 'none',
                                    padding: '1rem 3rem', borderRadius: '2px', fontWeight: '900',
                                    cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase',
                                    fontSize: '0.85rem', boxShadow: '0 10px 40px rgba(219, 10, 64, 0.2)',
                                    clipPath: 'polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%)',
                                    display: 'flex', alignItems: 'center', gap: '10px'
                                }}
                            >
                                <Check size={18} />
                                CONFIRM UPDATES
                            </button>
                        </div>
                    </div>
                </form>
            </TacticalModal>
        </div>
    );
};

export default AddUser;
