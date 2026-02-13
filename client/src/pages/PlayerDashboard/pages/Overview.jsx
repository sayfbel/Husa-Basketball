import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    TrendingUp,
    Calendar,
    Target,
    Zap,
    Trophy,
    Activity
} from 'lucide-react';

const Overview = () => {
    const { currentUser } = useAuth();

    return (
        <div className="animate-fade-in">
            <div className="dashboard-grid">
                <div className="dashboard-card status-card">
                    <div className="card-header-flex">
                        <h2>Performance Summary</h2>
                        <TrendingUp size={20} color="#4cd137" />
                    </div>
                    <div className="stat-item">
                        <span>Physical Readiness</span>
                        <strong className="status-active">98%</strong>
                    </div>
                    <div className="stat-item">
                        <span>Tactical Absorption</span>
                        <strong>85%</strong>
                    </div>
                    <div className="stat-item">
                        <span>Attendance</span>
                        <strong>100%</strong>
                    </div>
                </div>

                <div className="dashboard-card stats-card">
                    <div className="card-header-flex">
                        <h2>Upcoming Target</h2>
                        <Calendar size={20} color="#DB0A40" />
                    </div>
                    <p style={{ color: '#888', marginBottom: '1rem' }}>Next main event starts in:</p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900' }}>02</div>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>DAYS</div>
                        </div>
                        <div style={{ fontSize: '1.5rem', opacity: 0.3 }}>:</div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900' }}>14</div>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>HOURS</div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h2>Recent Achievement</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px' }}>
                        <Trophy size={30} color="#fcd34d" />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Double-Double King</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Last 3 games average</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <h2>Coach's Weekly Note</h2>
                <p style={{ color: '#aaa', fontStyle: 'italic', lineHeight: '1.6' }}>
                    "Focus on defensive rotations this week. Your lateral speed is improving, use it to close down the shooters earlier. Great energy in the last session."
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.8rem' }}>
                    <Activity size={14} />
                    <span>Sent by Mohamed Haib • 2h ago</span>
                </div>
            </div>
        </div>
    );
};

export default Overview;
