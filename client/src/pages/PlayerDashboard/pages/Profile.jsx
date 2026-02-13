import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Ruler,
    Weight,
    Award,
    Edit2
} from 'lucide-react';

const Profile = () => {
    const { currentUser } = useAuth();

    return (
        <div className="animate-fade-in">
            <div className="dashboard-grid">
                {/* Profile Main info */}
                <div className="dashboard-card" style={{ gridColumn: 'span 2', display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '5px solid var(--dash-primary)', boxShadow: '0 0 30px rgba(219, 10, 64, 0.3)' }}>
                        <img src={currentUser?.image || "/assets/players/default.png"} alt={currentUser?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h1 style={{ marginBottom: '5px' }}>{currentUser?.name}</h1>
                                <p style={{ color: 'var(--dash-primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Guard | #05</p>
                            </div>
                            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Edit2 size={14} /> Edit Profile
                            </button>
                        </div>
                        <p style={{ color: '#888', marginTop: '15px', maxWidth: '600px' }}>
                            Professional basketball player for HUSA Basketball. Specialist in defensive pressure and fast breaks. Committed to the team's victory.
                        </p>
                    </div>
                </div>

                {/* Physical Bio */}
                <div className="dashboard-card">
                    <h2>Physical Profile</h2>
                    <div className="stat-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Ruler size={16} color="#888" />
                            <span>Height</span>
                        </div>
                        <strong>192 cm</strong>
                    </div>
                    <div className="stat-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Weight size={16} color="#888" />
                            <span>Weight</span>
                        </div>
                        <strong>86 kg</strong>
                    </div>
                    <div className="stat-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Award size={16} color="#888" />
                            <span>Reach</span>
                        </div>
                        <strong>245 cm</strong>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="dashboard-card">
                    <h2>Contact Information</h2>
                    <div className="stat-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={16} color="#888" />
                            <span>Email</span>
                        </div>
                        <span style={{ fontSize: '0.9rem' }}>{currentUser?.name?.toLowerCase().replace(' ', '.') || 'player'}@husa.ma</span>
                    </div>
                    <div className="stat-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Phone size={16} color="#888" />
                            <span>Phone</span>
                        </div>
                        <strong>+212 6XX-XXXXXX</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
