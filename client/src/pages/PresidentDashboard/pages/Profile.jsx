import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Ruler,
    Weight as WeightIcon,
    Award,
    Edit2,
    Save,
    X,
    Hash,
    ChevronRight,
    Zap,
    Briefcase,
    Shield
} from 'lucide-react';
import { useNotification } from '../../../components/Notification/Notification.jsx';

const Profile = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification?.() || { showNotification: (msg) => { } };
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
                role: data.role || 'President',
                department: data.department || 'Executive Office',
                bio: data.bio || 'Club President and Executive Director. Dedicated to elevating HUSA Basketball to the national elite through strategic leadership and organizational excellence.',
                height: data.height || '178cm',
                weight: data.weight || '80kg',
                email: data.email || `${currentUser.name?.toLowerCase().replace(' ', '.')}@husa.ma`,
                phone: data.phone || '+212 6XX-XXXXXX',
                photo_url: data.photo_url || "/assets/players/President.jpg",
                age: data.age || '52'
            });
        } catch (err) {

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
            showNotification("Executive profile updated successfully", "success");
            setIsEditing(false);
        } catch (err) {

            showNotification("Failed to update profile", "error");
        }
    };

    if (loading) return <div className="animate-fade-in" style={{ padding: '2rem', color: '#fff' }}>Accessing secure records...</div>;

    return (
        <div className="animate-fade-in dashboard-fashion-theme">
            <div className="dashboard-grid">
                {/* Executive Identity Card */}
                <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', border: 'none', padding: 0 }}>Executive Credentials</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} style={{ background: 'var(--dash-primary)', border: 'none', color: '#fff', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(219, 10, 64, 0.3)' }}>
                                        <Save size={18} style={{ margin: 'auto' }} />
                                    </button>
                                    <button onClick={() => setIsEditing(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={18} style={{ margin: 'auto' }} />
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} style={{ color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Edit2 size={18} style={{ margin: 'auto' }} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                        <div style={{
                            width: '180px',
                            height: '180px',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            border: '2px solid var(--dash-primary)',
                            background: '#0a0a0a',
                            position: 'relative',
                            boxShadow: '0 10px 30px rgba(219, 10, 64, 0.1)'
                        }}>
                            <img src={staffData.photo_url} alt={staffData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(219, 10, 64, 0.8)', color: '#fff', textAlign: 'center', padding: '5px', fontSize: '0.7rem', fontWeight: 'bold' }}>EXECUTIVE OFFICE</div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.66rem', color: 'var(--dash-primary)', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>FULL NAME</label>
                                                <input
                                                    type="text"
                                                    value={staffData.name}
                                                    onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        borderBottom: '2px solid var(--dash-primary)',
                                                        color: '#fff',
                                                        padding: '5px 0',
                                                        fontSize: '2.5rem',
                                                        fontWeight: '950',
                                                        letterSpacing: '-1.5px',
                                                        outline: 'none',
                                                        fontFamily: 'inherit'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>ROLE</label>
                                                    <input
                                                        type="text"
                                                        value={staffData.role}
                                                        onChange={(e) => setStaffData({ ...staffData, role: e.target.value })}
                                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>DEPARTMENT</label>
                                                    <input
                                                        type="text"
                                                        value={staffData.department}
                                                        onChange={(e) => setStaffData({ ...staffData, department: e.target.value })}
                                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-1.5px', textTransform: 'uppercase' }}>{staffData.name}</h1>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                color: 'var(--dash-primary)',
                                                fontWeight: '800',
                                                fontSize: '0.9rem',
                                                marginTop: '5px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '2px'
                                            }}>
                                                <Shield size={14} /> {staffData.role} • {staffData.department}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div style={{ marginTop: '20px' }}>
                                    <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>EXECUTIVE BIO</label>
                                    <textarea
                                        value={staffData.bio}
                                        onChange={(e) => setStaffData({ ...staffData, bio: e.target.value })}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '12px', borderRadius: '8px', minHeight: '80px', resize: 'none' }}
                                    />
                                </div>
                            ) : (
                                <p style={{ color: '#888', marginTop: '15px', maxWidth: '700px', lineHeight: '1.6', fontSize: '1.05rem' }}>
                                    {staffData.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Professional Metrics */}
                <div className="dashboard-card">
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', border: 'none', padding: 0 }}>Executive Profile</h2>
                        <Briefcase size={18} color="#888" />
                    </div>

                    <div className="stat-item">
                        <span>Office Status</span>
                        <strong style={{ color: '#4cd137' }}>ACTIVE</strong>
                    </div>

                    <div className="stat-item">
                        <span>Experience</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={staffData.age}
                                onChange={(e) => setStaffData({ ...staffData, age: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--dash-primary)', color: '#fff', textAlign: 'right', outline: 'none', width: '80px' }}
                            />
                        ) : (
                            <strong>Senior Executive</strong>
                        )}
                    </div>

                    <div className="stat-item">
                        <span>Age</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={staffData.age}
                                onChange={(e) => setStaffData({ ...staffData, age: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--dash-primary)', color: '#fff', textAlign: 'right', outline: 'none', width: '80px' }}
                            />
                        ) : (
                            <strong>{staffData.age} Yrs</strong>
                        )}
                    </div>
                </div>

                {/* Official Channels */}
                <div className="dashboard-card">
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', border: 'none', padding: 0 }}>Official Channels</h2>
                        <Mail size={18} color="#888" />
                    </div>

                    <div className="stat-item">
                        <span>Email Address</span>
                        {isEditing ? (
                            <input
                                type="email"
                                value={staffData.email}
                                onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--dash-primary)', color: '#fff', textAlign: 'right', outline: 'none', width: '220px' }}
                            />
                        ) : (
                            <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{staffData.email}</span>
                        )}
                    </div>

                    <div className="stat-item">
                        <span>Secure Line</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={staffData.phone}
                                onChange={(e) => setStaffData({ ...staffData, phone: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--dash-primary)', color: '#fff', textAlign: 'right', outline: 'none', width: '140px' }}
                            />
                        ) : (
                            <strong>{staffData.phone}</strong>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
