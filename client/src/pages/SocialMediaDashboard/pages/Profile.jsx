import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import {
    User,
    Mail,
    Phone,
    Edit2,
    Save,
    X,
    Clock,
    Briefcase,
    Shield
} from 'lucide-react';
import { useNotification } from '../../../components/Notification/Notification';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const Profile = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [staffData, setStaffData] = useState({
        name: '',
        role: '',
        department: '',
        bio: '',
        height: '',
        weight: '',
        email: '',
        phone: '',
        photo_url: '',
        age: ''
    });

    useEffect(() => {
        if (currentUser?.id) {
            fetchProfile();
        }
    }, [currentUser]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/staff/profile?id=${currentUser.id}`);
            const data = res.data;
            setStaffData({
                name: data.name || currentUser.name,
                role: data.role || 'Social Media Management',
                department: data.department || 'office',
                bio: data.bio || 'Official Social Media Manager. Dedicated to handling the store inventory, publishing bulletins, and engaging HUSA Basketball fans online.',
                height: data.height || '175cm',
                weight: data.weight || '70kg',
                email: data.email || `${currentUser.name?.toLowerCase().replace(' ', '.')}@husa.ma`,
                phone: data.phone || '+212 6XX-XXXXXX',
                photo_url: data.photo_url || 'http://localhost:5000/uploads/default.png',
                age: data.age || '30'
            });
        } catch (err) {
            console.error(err);
            showNotification("Failed to load profile data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await axios.put('http://localhost:5000/api/staff/profile', {
                id: currentUser.id,
                ...staffData
            });
            showNotification("Social Media Manager profile updated successfully", "success");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            showNotification("Failed to update profile", "error");
        }
    };

    if (loading) return <div className="animate-fade-in" style={{ padding: '2rem', color: '#fff' }}>Accessing secure records...</div>;

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Header */}
            <div className="section-header-modern" style={{ background: 'linear-gradient(135deg, #2b040c 0%, #050505 100%)', borderBottom: '1px solid rgba(219, 10, 64, 0.2)' }}>
                <div className="watermark-bg" style={{ color: 'rgba(219, 10, 64, 0.05)' }}>DOSSIER</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label" style={{ color: 'var(--accent)' }}>STAFF FILE</span>
                    <h1 className="hero-dashboard-title">
                        MANAGER <br />
                        <span className="accent-text" style={{ background: 'linear-gradient(to right, var(--accent), #ff4d6d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DOSSIER</span>
                    </h1>
                </div>
            </div>

            {/* Profile Grid */}
            <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
                
                {/* Left Card: Photo and Basic Info */}
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '150px', height: '150px', border: '2px solid rgba(219, 10, 64, 0.3)', padding: '5px', background: 'rgba(0,0,0,0.5)' }}>
                        <img 
                            src={staffData.photo_url} 
                            alt={staffData.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { e.target.src = 'http://localhost:5000/uploads/default.png' }}
                        />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 5px 0' }}>{staffData.name}</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{staffData.role}</span>
                    </div>

                    <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Briefcase size={16} color="var(--accent)" />
                            <span>Department: <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{staffData.department}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={16} color="var(--accent)" />
                            <span>Security: <strong style={{ color: '#fff' }}>Level 3 (Media Manager)</strong></span>
                        </div>
                    </div>
                </div>

                {/* Right Card: Extensive Biography and Information */}
                <div className="glass-card" style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={18} color="var(--accent)" /> Secure Staff Details
                        </h3>
                        {isEditing ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleSave} className="intel-btn-primary" style={{ width: 'auto', background: 'var(--accent)', borderColor: 'var(--accent)', padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Save size={14} /> SAVE
                                </button>
                                <button onClick={() => setIsEditing(false)} className="intel-btn-primary" style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <X size={14} /> CANCEL
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="intel-btn-primary" style={{ width: 'auto', background: 'var(--accent)', borderColor: 'var(--accent)', padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Edit2 size={14} /> EDIT RECORD
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Biography Block */}
                        <div>
                            <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Manager Biography</span>
                            {isEditing ? (
                                <textarea 
                                    value={staffData.bio} 
                                    onChange={(e) => setStaffData({...staffData, bio: e.target.value})} 
                                    rows="4"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                                />
                            ) : (
                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#ccc', lineHeight: '1.6', fontStyle: 'italic' }}>
                                    "{staffData.bio}"
                                </p>
                            )}
                        </div>

                        {/* Direct Contacts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Email Address</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Mail size={16} color="var(--accent)" />
                                    {isEditing ? (
                                        <input 
                                            value={staffData.email} 
                                            onChange={(e) => setStaffData({...staffData, email: e.target.value})}
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '100%' }}
                                        />
                                    ) : (
                                        <span style={{ color: '#fff', fontSize: '0.9rem' }}>{staffData.email}</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Phone Number</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Phone size={16} color="var(--accent)" />
                                    {isEditing ? (
                                        <input 
                                            value={staffData.phone} 
                                            onChange={(e) => setStaffData({...staffData, phone: e.target.value})}
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '100%' }}
                                        />
                                    ) : (
                                        <span style={{ color: '#fff', fontSize: '0.9rem' }}>{staffData.phone}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Physical / General Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                            <div>
                                <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Age</span>
                                {isEditing ? (
                                    <input 
                                        type="number"
                                        value={staffData.age} 
                                        onChange={(e) => setStaffData({...staffData, age: e.target.value})}
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '80px' }}
                                    />
                                ) : (
                                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{staffData.age} years</span>
                                )}
                            </div>
                            <div>
                                <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Height</span>
                                {isEditing ? (
                                    <input 
                                        value={staffData.height} 
                                        onChange={(e) => setStaffData({...staffData, height: e.target.value})}
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '100px' }}
                                    />
                                ) : (
                                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{staffData.height}</span>
                                )}
                            </div>
                            <div>
                                <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Weight</span>
                                {isEditing ? (
                                    <input 
                                        value={staffData.weight} 
                                        onChange={(e) => setStaffData({...staffData, weight: e.target.value})}
                                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '100px' }}
                                    />
                                ) : (
                                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1rem' }}>{staffData.weight}</span>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
