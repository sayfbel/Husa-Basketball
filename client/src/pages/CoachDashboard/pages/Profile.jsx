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
    BookOpen
} from 'lucide-react';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import '../../../css/dashboard.css';

const Profile = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification?.() || { showNotification: (msg) => console.log(msg) };
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [coachData, setCoachData] = useState({
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

            // Generate smart fallback image path
            const formattedName = (data.name || currentUser.name || '')
                .split(/\s+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');

            let fallbackImage = `/assets/players/${formattedName}.jpg`;
            if (currentUser.id === 'st1') fallbackImage = '/assets/players/coach.jpg';
            if (currentUser.id === 'st2') fallbackImage = '/assets/players/President.jpg';

            setCoachData({
                name: data.name || currentUser.name,
                role: data.role || 'Head Coach',
                department: data.department || 'Coaching Staff',
                bio: data.bio || 'Elite basketball coach dedicated to tactical excellence and player development at HUSA Basketball.',
                height: data.height || '185cm',
                weight: data.weight || '82kg',
                email: data.email || `${currentUser.name?.toLowerCase().replace(' ', '.')}@husa.ma`,
                phone: data.phone || '+212 6XX-XXXXXX',
                photo_url: data.photo_url || fallbackImage,
                age: data.age || '42'
            });
        } catch (err) {
            console.error("Error fetching coach profile:", err);
            showNotification("Failed to load profile data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await axios.put('http://localhost:5000/api/staff/profile', {
                id: currentUser.id,
                ...coachData
            });
            showNotification("Coach profile updated successfully", "success");
            setIsEditing(false);
        } catch (err) {
            console.error("Coach update error:", err);
            showNotification("Failed to update coach profile", "error");
        }
    };

    if (loading) return <div className="animate-fade-in" style={{ padding: '2rem', color: '#fff' }}>Loading coach profile...</div>;

    return (
        <div className="animate-fade-in">
            <div className="section-header-row">
                <div className="role-tag coach-tag">COACH PROFILE</div>
                <h1>System Commander</h1>
                <p>Manage your professional profile and personal tactical archive.</p>
            </div>

            <div className="dashboard-grid">
                {/* Main Identity Card */}
                <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', border: 'none', padding: 0 }}>Personal informations</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} style={{ background: '#ff3131', border: 'none', color: '#fff', width: '45px', height: '45px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(255, 49, 49, 0.3)' }}>
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
                            boxShadow: '0 10px 30px rgba(219, 10, 64, 0.2)'
                        }}>
                            <img
                                src={coachData.photo_url}
                                alt={coachData.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.src = '/assets/players/default.png';
                                }}
                            />
                            <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(219, 10, 64, 0.8)', color: '#fff', textAlign: 'center', padding: '5px', fontSize: '0.7rem', fontWeight: 'bold' }}>OFFICIAL STAFF</div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ fontSize: '0.6rem', color: '#ff3131', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px' }}>STAFF IDENTITY</label>
                                            <input
                                                type="text"
                                                value={coachData.name}
                                                onChange={(e) => setCoachData({ ...coachData, name: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    borderBottom: '2px solid #ff3131',
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
                                    ) : (
                                        <>
                                            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-1.5px', textTransform: 'uppercase' }}>{coachData.name}</h1>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                color: '#ff3131',
                                                fontWeight: '800',
                                                fontSize: '0.9rem',
                                                marginTop: '5px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '2px'
                                            }}>
                                                <Briefcase size={14} /> {coachData.role} • {coachData.department}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div style={{ marginTop: '20px' }}>
                                    <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>DESCRIPTION / PHILOSOPHY</label>
                                    <textarea
                                        value={coachData.bio}
                                        onChange={(e) => setCoachData({ ...coachData, bio: e.target.value })}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dash-border)', color: '#aaa', padding: '12px', borderRadius: '8px', minHeight: '100px', resize: 'none' }}
                                    />
                                </div>
                            ) : (
                                <p style={{ color: '#888', marginTop: '20px', maxWidth: '800px', lineHeight: '1.7', fontSize: '1.05rem' }}>
                                    {coachData.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Physical Bio */}
                <div className="dashboard-card shadow-module">
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', border: 'none', padding: 0 }}>Physical Intel</h2>
                        <Ruler size={18} color="#ff3131" />
                    </div>

                    <div className="stat-item">
                        <span>Height</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={coachData.height}
                                onChange={(e) => setCoachData({ ...coachData, height: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #ff3131', color: '#fff', textAlign: 'right', outline: 'none', width: '80px' }}
                            />
                        ) : (
                            <strong style={{ color: '#fff' }}>{coachData.height}</strong>
                        )}
                    </div>

                    <div className="stat-item">
                        <span>Weight</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={coachData.weight}
                                onChange={(e) => setCoachData({ ...coachData, weight: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #ff3131', color: '#fff', textAlign: 'right', outline: 'none', width: '80px' }}
                            />
                        ) : (
                            <strong style={{ color: '#fff' }}>{coachData.weight}</strong>
                        )}
                    </div>

                    <div className="stat-item">
                        <span>Age</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={coachData.age}
                                onChange={(e) => setCoachData({ ...coachData, age: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #ff3131', color: '#fff', textAlign: 'right', outline: 'none', width: '80px' }}
                            />
                        ) : (
                            <strong style={{ color: '#fff' }}>{coachData.age} Yrs</strong>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="dashboard-card shadow-module">
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', border: 'none', padding: 0 }}>Direct Communication</h2>
                        <Mail size={18} color="#ff3131" />
                    </div>

                    <div className="stat-item">
                        <span>Official Email</span>
                        {isEditing ? (
                            <input
                                type="email"
                                value={coachData.email}
                                onChange={(e) => setCoachData({ ...coachData, email: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #ff3131', color: '#fff', textAlign: 'right', outline: 'none', width: '220px' }}
                            />
                        ) : (
                            <span style={{ fontSize: '0.95rem', color: '#aaa', fontWeight: '600' }}>{coachData.email}</span>
                        )}
                    </div>

                    <div className="stat-item">
                        <span>Direct Phone</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={coachData.phone}
                                onChange={(e) => setCoachData({ ...coachData, phone: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #ff3131', color: '#fff', textAlign: 'right', outline: 'none', width: '180px' }}
                            />
                        ) : (
                            <strong style={{ color: '#fff' }}>{coachData.phone}</strong>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .shadow-module {
                    background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.2) 100%) !important;
                }
                .coach-tag {
                    border-color: #ff3131 !important;
                    color: #ff3131 !important;
                    box-shadow: 0 0 20px rgba(255, 49, 49, 0.15) !important;
                }
            `}</style>
        </div>
    );
};

export default Profile;
