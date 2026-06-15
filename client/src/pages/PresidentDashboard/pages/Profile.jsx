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
import { useNotification } from '../../../components/Notification/Notification';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

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
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">PROFILE</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">EXECUTIVE DOSSIER</span>
                    <h1 className="hero-dashboard-title">
                        PRESIDENT <br />
                        <span className="accent-text">PROFILE</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <Shield size={14} />
                            <span>{staffData.role?.toUpperCase() || 'PRESIDENT'}</span>
                        </div>
                        <div className="status-item">
                            <Briefcase size={14} />
                            <span>{staffData.department?.toUpperCase() || 'EXECUTIVE OFFICE'}</span>
                        </div>
                    </div>
                </div>

                {/* Header Actions */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="intel-btn-primary"
                                style={{ background: '#DB0A40', borderColor: '#DB0A40' }}
                            >
                                <Save size={18} style={{ marginRight: '8px' }} /> SAVE RECORDS
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="intel-btn-primary"
                                style={{ background: '#fff', color: '#000', borderColor: '#fff' }}
                            >
                                <X size={18} style={{ marginRight: '8px' }} /> CANCEL
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="intel-btn-primary"
                        >
                            <Edit2 size={18} style={{ marginRight: '8px' }} /> EDIT PROFILE
                        </button>
                    )}
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Executive Identity Card */}
                <div className="intel-card" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', padding: '3rem' }}>
                    <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
                        {/* Left Side: Photo & Quick Stats */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '280px', flexShrink: 0 }}>
                            <div style={{
                                width: '100%',
                                height: '340px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                background: '#0a0a0a',
                                position: 'relative',
                                overflow: 'visible' // To allow corner accents to overflow slightly if needed
                            }}>
                                <img
                                    src={staffData.photo_url}
                                    alt={staffData.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />

                                {/* Red Corner Accents */}
                                <div style={{ position: 'absolute', top: '-5px', left: '-5px', width: '20px', height: '20px', borderTop: '3px solid #DB0A40', borderLeft: '3px solid #DB0A40' }}></div>
                                <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '20px', height: '20px', borderBottom: '3px solid #DB0A40', borderRight: '3px solid #DB0A40' }}></div>

                                {/* EXECUTIVE Label Overlay */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '30px',
                                    left: '0',
                                    background: '#DB0A40',
                                    color: '#fff',
                                    padding: '6px 15px',
                                    fontSize: '0.8rem',
                                    fontWeight: '900',
                                    letterSpacing: '1px'
                                }}>
                                    EXECUTIVE
                                </div>
                            </div>

                            {/* Role/Assignment stat boxes below image */}
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '15px',
                                    borderLeft: '2px solid #DB0A40'
                                }}>
                                    <span style={{ display: 'block', fontSize: '0.6rem', color: '#666', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '1px' }}>CURRENT ROLE</span>
                                    <span style={{ fontSize: '1rem', fontWeight: '900', color: '#fff' }}>{staffData.role}</span>
                                </div>
                                <div style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '15px',
                                    borderLeft: '2px solid #DB0A40'
                                }}>
                                    <span style={{ display: 'block', fontSize: '0.6rem', color: '#666', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '1px' }}>ASSIGNMENT</span>
                                    <span style={{ fontSize: '1rem', fontWeight: '900', color: '#fff' }}>Office</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Identity Info */}
                        <div style={{ flex: 1, paddingTop: '10px' }}>
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.66rem', color: '#DB0A40', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>FULL IDENTITY</label>
                                        <input
                                            type="text"
                                            value={staffData.name}
                                            onChange={(e) => setStaffData({ ...staffData, name: e.target.value })}
                                            style={{
                                                width: '100%',
                                                background: 'rgba(0,0,0,0.2)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderLeft: '2px solid #DB0A40',
                                                color: '#fff',
                                                padding: '15px',
                                                fontSize: '1.5rem',
                                                fontWeight: '800',
                                                letterSpacing: '-0.5px',
                                                outline: 'none',
                                                fontFamily: 'inherit'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>OFFICIAL ROLE</label>
                                            <input
                                                type="text"
                                                value={staffData.role}
                                                onChange={(e) => setStaffData({ ...staffData, role: e.target.value })}
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '0' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>DEPARTMENT</label>
                                            <input
                                                type="text"
                                                value={staffData.department}
                                                readOnly
                                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '12px', borderRadius: '0', cursor: 'not-allowed' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                        <div style={{ width: '40px', height: '2px', background: '#DB0A40' }}></div>
                                        <span style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '2px', fontWeight: '600' }}>HUSA BASKETBALL CLUB</span>
                                    </div>
                                    <h1 style={{ margin: 0, fontSize: '5rem', fontWeight: '900', lineHeight: '0.9', letterSpacing: '-2px', textTransform: 'uppercase', color: 'white' }}>
                                        {staffData.name.split(' ')[0]} <br />
                                        <span style={{ color: 'transparent', WebkitTextStroke: '2px #fff' }}>{staffData.name.split(' ').slice(1).join(' ')}</span>
                                    </h1>
                                </>
                            )}

                            <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px' }}>
                                {isEditing ? (
                                    <div>
                                        <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>EXECUTIVE BIOGRAPHY</label>
                                        <textarea
                                            value={staffData.bio}
                                            onChange={(e) => setStaffData({ ...staffData, bio: e.target.value })}
                                            rows="6"
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '15px', borderRadius: '0', resize: 'none', lineHeight: '1.6', fontSize: '1rem' }}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 style={{ fontSize: '1rem', color: '#fff', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1px', marginBottom: '15px' }}>PROFESSIONAL BRIEF</h3>
                                        <p style={{ color: '#888', lineHeight: '1.8', fontSize: '1.1rem', maxWidth: '800px', margin: 0 }}>
                                            {staffData.bio}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Metrics */}
                <div className="intel-card">
                    <div className="card-header-modern" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>STATUS & METRICS</h2>
                    </div>

                    <div className="stat-item">
                        <span>Office Status</span>
                        <strong style={{ color: '#4cd137', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4cd137', boxShadow: '0 0 10px #4cd137' }}></div>
                            ACTIVE DUTY
                        </strong>
                    </div>

                    <div className="stat-item">
                        <span>Clearance</span>
                        <strong style={{ color: '#DB0A40' }}>LEVEL 1 EXEC</strong>
                    </div>

                    <div className="stat-item">
                        <span>Experience</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={staffData.age}
                                onChange={(e) => setStaffData({ ...staffData, age: e.target.value })}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '4px', width: '120px', textAlign: 'right', fontSize: '0.9rem' }}
                            />
                        ) : (
                            <strong>Senior Grade</strong>
                        )}
                    </div>

                    <div className="stat-item">
                        <span>Age</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={staffData.age}
                                onChange={(e) => setStaffData({ ...staffData, age: e.target.value })}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: '4px', width: '80px', textAlign: 'right', fontSize: '0.9rem' }}
                            />
                        ) : (
                            <strong>{staffData.age} Yrs</strong>
                        )}
                    </div>
                </div>

                {/* Official Channels */}
                <div className="intel-card">
                    <div className="card-header-modern" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>COMMS CHANNELS</h2>
                    </div>

                    <div className="stat-item">
                        <span>Official Email</span>
                        {isEditing ? (
                            <input
                                type="email"
                                value={staffData.email}
                                onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '4px', width: '100%', fontSize: '0.9rem' }}
                            />
                        ) : (
                            <span style={{ fontSize: '0.85rem', color: '#fff', fontFamily: 'monospace' }}>{staffData.email}</span>
                        )}
                    </div>

                    <div className="stat-item">
                        <span>Secure Line</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={staffData.phone}
                                onChange={(e) => setStaffData({ ...staffData, phone: e.target.value })}
                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '4px', width: '100%', fontSize: '0.9rem' }}
                            />
                        ) : (
                            <span style={{ fontSize: '0.85rem', color: '#fff', fontFamily: 'monospace' }}>{staffData.phone}</span>
                        )}
                    </div>

                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(219, 10, 64, 0.05)', border: '1px dashed #DB0A40', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DB0A40', marginBottom: '5px' }}>
                            <Shield size={14} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>SECURITY PROTOCOL</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#aaa' }}>
                            All communications on these channels are encrypted and monitored by club security operations.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
