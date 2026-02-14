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
    Briefcase
} from 'lucide-react';
import { useNotification } from '../../../components/Notification/Notification.jsx';

const Profile = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification?.() || { showNotification: (msg) => console.log(msg) };
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [playerData, setPlayerData] = useState({
        name: '',
        position: '',
        jersey_number: '',
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
            const res = await axios.get(`http://localhost:5000/api/players/profile?id=${currentUser.id}`);
            const data = res.data;
            setPlayerData({
                name: data.name || currentUser.name,
                position: data.position || 'Guard',
                jersey_number: data.jersey_number || '05',
                bio: data.bio || 'Professional basketball player for HUSA Basketball. Committed to the team\'s victory.',
                height: data.height || '192cm',
                weight: data.weight || '86kg',
                email: data.email || `${currentUser.name?.toLowerCase().replace(' ', '.')}@husa.ma`,
                phone: data.phone || '+212 6XX-XXXXXX',
                photo_url: data.photo_url || "/assets/players/default.png",
                age: data.age || '24'
            });
        } catch (err) {
            console.error("Error fetching profile:", err);
            showNotification("Failed to load profile data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await axios.put('http://localhost:5000/api/players/profile', {
                id: currentUser.id,
                ...playerData
            });
            showNotification("Profile updated successfully", "success");
            setIsEditing(false);
        } catch (err) {
            console.error("Update error:", err);
            showNotification("Failed to update profile", "error");
        }
    };

    if (loading) return <div className="animate-fade-in" style={{ padding: '2rem', color: '#fff' }}>Loading profile...</div>;

    return (
        <div className="animate-fade-in">
            <div className="dashboard-grid">
                {/* Main Identity Card */}
                <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', border: 'none', padding: 0 }}>Personal informations</h2>
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
                            boxShadow: '0 10px 30px rgba(219, 10, 64, 0.2)'
                        }}>
                            <img src={playerData.photo_url} alt={playerData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(219, 10, 64, 0.8)', color: '#fff', textAlign: 'center', padding: '5px', fontSize: '0.7rem', fontWeight: 'bold' }}>OFFICIAL PLAYER</div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.6rem', color: 'var(--dash-primary)', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>FULL NAME</label>
                                                <input
                                                    type="text"
                                                    value={playerData.name}
                                                    onChange={(e) => setPlayerData({ ...playerData, name: e.target.value })}
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
                                                    <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>POSITION</label>
                                                    <input
                                                        type="text"
                                                        value={playerData.position}
                                                        onChange={(e) => setPlayerData({ ...playerData, position: e.target.value })}
                                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                                                    />
                                                </div>
                                                <div style={{ width: '80px' }}>
                                                    <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: '900', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>NUMBER</label>
                                                    <input
                                                        type="text"
                                                        value={playerData.jersey_number}
                                                        onChange={(e) => setPlayerData({ ...playerData, jersey_number: e.target.value })}
                                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '8px', textAlign: 'center' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-1.5px', textTransform: 'uppercase' }}>{playerData.name}</h1>
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
                                                <Zap size={14} /> {playerData.position} • #{playerData.jersey_number}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isEditing ? (
                                <div style={{ marginTop: '20px' }}>
                                    <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>DESCRIPTION</label>
                                    <textarea
                                        value={playerData.bio}
                                        onChange={(e) => setPlayerData({ ...playerData, bio: e.target.value })}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '12px', borderRadius: '8px', minHeight: '80px', resize: 'none' }}
                                    />
                                </div>
                            ) : (
                                <p style={{ color: '#888', marginTop: '15px', maxWidth: '700px', lineHeight: '1.6', fontSize: '1.05rem' }}>
                                    {playerData.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Physical Bio */}
                <div className="dashboard-card">
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', border: 'none', padding: 0 }}>Physical Profile</h2>
                        <Ruler size={18} color="#888" />
                    </div>

                    <div className="stat-item">
                        <span>Height</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={playerData.height}
                                onChange={(e) => setPlayerData({ ...playerData, height: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--dash-primary)', color: '#fff', textAlign: 'right', outline: 'none', width: '80px' }}
                            />
                        ) : (
                            <strong>{playerData.height}</strong>
                        )}
                    </div>

                    <div className="stat-item">
                        <span>Weight</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={playerData.weight}
                                onChange={(e) => setPlayerData({ ...playerData, weight: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--dash-primary)', color: '#fff', textAlign: 'right', outline: 'none', width: '80px' }}
                            />
                        ) : (
                            <strong>{playerData.weight}</strong>
                        )}
                    </div>

                    <div className="stat-item">
                        <span>Age</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={playerData.age}
                                onChange={(e) => setPlayerData({ ...playerData, age: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--dash-primary)', color: '#fff', textAlign: 'right', outline: 'none', width: '80px' }}
                            />
                        ) : (
                            <strong>{playerData.age} Yrs</strong>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="dashboard-card">
                    <div className="card-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', border: 'none', padding: 0 }}>Contact Information</h2>
                        <Mail size={18} color="#888" />
                    </div>

                    <div className="stat-item">
                        <span>Email</span>
                        {isEditing ? (
                            <input
                                type="email"
                                value={playerData.email}
                                onChange={(e) => setPlayerData({ ...playerData, email: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--dash-primary)', color: '#fff', textAlign: 'right', outline: 'none', width: '180px' }}
                            />
                        ) : (
                            <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{playerData.email}</span>
                        )}
                    </div>

                    <div className="stat-item">
                        <span>Phone</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={playerData.phone}
                                onChange={(e) => setPlayerData({ ...playerData, phone: e.target.value })}
                                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--dash-primary)', color: '#fff', textAlign: 'right', outline: 'none', width: '140px' }}
                            />
                        ) : (
                            <strong>{playerData.phone}</strong>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
