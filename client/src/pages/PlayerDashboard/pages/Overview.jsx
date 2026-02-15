import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import {
    Users,
    Shield,
    Zap,
    Calendar,
    MessageSquare,
    Activity,
    ChevronRight,
    Star,
    Layout,
    Clock,
    Award,
    Target,
    Trophy
} from 'lucide-react';
import '../../../css/dashboard.css';
import '../css/overview.css';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const Overview = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [matches, setMatches] = useState([]);
    const [reports, setReports] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesRes, reportsRes, rankingsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/matches/schedule'),
                    currentUser?.id ? axios.get(`http://localhost:5000/api/reports?playerId=${currentUser.id}`) : Promise.resolve({ data: [] }),
                    axios.get('http://localhost:5000/api/rankings')
                ]);

                setMatches(matchesRes.data || []);
                setReports(reportsRes.data || []);
                setRankings(rankingsRes.data || []);
            } catch (err) {
                console.error("Error fetching player overview data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const isPastMatch = (matchDate) => {
        try {
            const d = new Date(matchDate && matchDate.includes('/') ? matchDate.split('/').reverse().join('-') : matchDate);
            if (isNaN(d.getTime())) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return d < today;
        } catch (e) {
            return false;
        }
    };

    const nextMatch = (matches || []).find(m => !isPastMatch(m.date)) || matches[0] || null;
    const opponent = nextMatch ? (nextMatch.opponent || (nextMatch.home?.includes('HUSA') ? nextMatch.away : nextMatch.home) || 'TBD') : 'TBD';
    const opponentLogo = rankings.find(r => r.club.toLowerCase() === opponent.toLowerCase())?.logo;

    const latestCoachNote = reports.find(r => r.type === 'technical' || r.sender_name.toLowerCase().includes('coach')) || (reports.length > 0 ? reports[0] : null);

    if (loading) return <div className="loading-spinner">Initializing Systems...</div>;

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* 1. Cinematic Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">PLAYER</div>
                <div className="header-content-box">
                    <span className="premium-label">ATHLETE PERFORMANCE HUB</span>
                    <h1 className="hero-dashboard-title">
                        PLAYER <br />
                        <span className="accent-text">READINESS</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <div className="pulse-dot"></div>
                            <span>STATUS: COMPETITION READY</span>
                        </div>
                        <div className="divider"></div>
                        <div className="status-item">
                            <Clock size={14} />
                            <span>LAST SYNCH: JUST NOW</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Elite Status Modules (KPIs) */}
            <div className="dashboard-grid matrix-grid">
                <div className="status-module glow-red">
                    <div className="module-inner">
                        <Activity className="module-icon" />
                        <span className="module-label">PHYSICAL STATE</span>
                        <h2 className="module-value">98%</h2>
                        <div className="module-progress">
                            <div className="progress-fill" style={{ width: '98%' }}></div>
                        </div>
                        <span className="module-sub">FATIGUE INDEX: LOW</span>
                    </div>
                </div>

                <div className="status-module glow-white">
                    <div className="module-inner">
                        <Shield className="module-icon" />
                        <span className="module-label">TACTICAL MASTERY</span>
                        <h2 className="module-value">85%</h2>
                        <div className="module-progress">
                            <div className="progress-fill" style={{ width: '85%' }}></div>
                        </div>
                        <span className="module-sub">SYSTEM COMPREHENSION</span>
                    </div>
                </div>

                <div className="status-module glow-red">
                    <div className="module-inner">
                        <Target className="module-icon" />
                        <span className="module-label">SQUAD RANK</span>
                        <h2 className="module-value">STARTER</h2>
                        <div className="module-tag">VALIDATED POSITION</div>
                    </div>
                </div>

                <div className="status-module glow-white">
                    <div className="module-inner">
                        <Trophy className="module-icon" />
                        <span className="module-label">AVG PERFORMANCE</span>
                        <h2 className="module-value">8.4</h2>
                        <div className="module-tag">SEASON RATING</div>
                    </div>
                </div>
            </div>

            {/* 3. Operational Intel Section */}
            <div className="operational-grid">
                {/* Next Engagement Card */}
                <div className="intel-card engagement-card">
                    {/* Background Logo Watermarks */}
                    <div className="engagement-bg-logos">
                        <img src={husaLogo} alt="" className="bg-logo-left" />
                        {opponentLogo && <img src={opponentLogo} alt="" className="bg-logo-right" />}
                    </div>

                    <div className="card-glitch-header">NEXT BATTLE</div>
                    <div className="engagement-content">
                        <div className="engagement-teams">
                            <div className="team-focus">
                                <span className="team-initials">HUSA</span>
                                <span className="team-role">HOME</span>
                            </div>
                            <div className="vs-separator">
                                <span className="vs-text">VS</span>
                                <div className="vs-line"></div>
                            </div>
                            <div className="team-focus opponent">
                                <span className="team-initials">{opponent.substring(0, 4).toUpperCase()}</span>
                                <span className="team-role">AWAY</span>
                            </div>
                        </div>
                        <div className="engagement-meta">
                            <div className="meta-bit">
                                <Calendar size={16} />
                                <span>{nextMatch ? (() => {
                                    const d = new Date(nextMatch.date.includes('/') ? nextMatch.date.split('/').reverse().join('-') : nextMatch.date);
                                    if (isNaN(d.getTime())) return nextMatch.date;
                                    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                })() : 'DATE TBD'}</span>
                            </div>
                            <div className="meta-bit">
                                <Clock size={16} />
                                <span>{nextMatch?.time || '20:00'}</span>
                            </div>
                        </div>
                        <button
                            className="intel-btn-primary"
                            onClick={() => navigate('/dashboard/player/match')}
                        >
                            VIEW MATCH INTEL <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="side-intel-stack">
                    {/* Performance Feed / Coach Notes */}
                    <div className="intel-card feed-card">
                        <div className="feed-header">
                            <Zap size={18} className="icon-red" />
                            <h3>TECHNICAL FEEDBACK</h3>
                        </div>
                        {latestCoachNote ? (
                            <div className="feed-list">
                                <div className="feed-item technical-note" onClick={() => navigate('/dashboard/player/report')}>
                                    <div className="item-marker"></div>
                                    <div className="item-info">
                                        <span className="item-name" style={{ fontStyle: 'italic' }}>"{latestCoachNote.content.substring(0, 60)}..."</span>
                                        <span className="item-type">FROM {latestCoachNote.sender_name.toUpperCase()}</span>
                                    </div>
                                    <ChevronRight size={14} className="item-arrow" />
                                </div>
                                <button
                                    className="intel-btn-secondary"
                                    style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--border)', color: '#fff', padding: '10px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
                                    onClick={() => navigate('/dashboard/player/report')}
                                >
                                    READ FULL INTEL
                                </button>
                            </div>
                        ) : (
                            <div className="empty-feed">
                                <p style={{ color: '#555', fontSize: '0.8rem', fontStyle: 'italic' }}>No active technical notes. Keep moving.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Tactics Access */}
                    <div className="intel-card squad-snap-card">
                        <div className="feed-header">
                            <Layout size={18} className="icon-red" />
                            <h3>ACTIVE SYSTEMS</h3>
                        </div>
                        <div className="squad-status-label" style={{ marginBottom: '1.5rem' }}>
                            <Zap size={14} /> 3 TACTICAL SCHEMES ASSIGNED
                        </div>
                        <button
                            className="intel-btn-primary"
                            style={{ padding: '15px' }}
                            onClick={() => navigate('/dashboard/player/tactics')}
                        >
                            OPEN WORKSPACE
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. Communication Hub Bar */}
            <div className="intel-card transmission-uplink">
                <div className="transmission-uplink-inner">
                    <div className="transmission-uplink-content">
                        <div className="transmission-icon-box">
                            <MessageSquare size={24} color="#DB0A40" />
                        </div>
                        <div>
                            <div className="transmission-uplink-title">COMMUNICATIONS UPLINK</div>
                            <div className="transmission-uplink-sub">Submit reports or status updates to coaching staff.</div>
                        </div>
                    </div>
                    <button
                        className="intel-btn-primary uplink-btn"
                        onClick={() => navigate('/dashboard/player/report')}
                    >
                        START TRANSMISSION
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Overview;
