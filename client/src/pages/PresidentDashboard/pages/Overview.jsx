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
    const [staff, setStaff] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch general club data
                const [matchesRes, reportsRes, rankingsRes, staffRes, playersRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/matches/schedule'),
                    axios.get('http://localhost:5000/api/reports'),
                    axios.get('http://localhost:5000/api/rankings'),
                    axios.get('http://localhost:5000/api/staff'),
                    axios.get('http://localhost:5000/api/players')
                ]);

                setMatches(matchesRes.data || []);
                setReports(reportsRes.data || []);
                setRankings(rankingsRes.data || []);
                setStaff(staffRes.data || []);
                setPlayers(playersRes.data || []);
            } catch (err) {
                console.error("Error fetching president overview data:", err);
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

    // Win Rate Calculation Logic
    const playedMatches = matches.filter(m => {
        if (!m.score || m.score === '-' || !m.score.includes('-')) return false;
        const scores = m.score.split('-').map(s => parseInt(s.trim()));
        return scores.length === 2 && !isNaN(scores[0]) && !isNaN(scores[1]) && (scores[0] + scores[1] > 0);
    });

    let wins = 0;
    playedMatches.forEach(m => {
        const scores = m.score.split('-').map(s => parseInt(s.trim()));
        const isHome = m.home.toUpperCase().includes('HUSA') || m.home.toUpperCase().includes('HASSANIA');
        const husaScore = isHome ? scores[0] : scores[1];
        const oppScore = isHome ? scores[1] : scores[0];

        if (husaScore > oppScore) wins++;
    });
    const winRate = playedMatches.length > 0 ? ((wins / playedMatches.length) * 100).toFixed(0) : 0;

    const latestNote = (reports.length > 0 ? reports[0] : null);

    if (loading) return <div className="loading-spinner">Accessing Executive Systems...</div>;

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* 1. Cinematic Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">HUSA</div>
                <div className="header-content-box">
                    <span className="premium-label">EXECUTIVE COMMAND CENTER</span>
                    <h1 className="hero-dashboard-title">
                        CLUB <br />
                        <span className="accent-text">OVERVIEW</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <div className="pulse-dot"></div>
                            <span>STATUS: OPERATIONAL</span>
                        </div>
                        <div className="divider"></div>
                        <div className="status-item">
                            <Clock size={14} />
                            <span>SYSTEM TIME: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Club Executive Modules */}
            <div className="dashboard-grid matrix-grid">
                <div className="status-module glow-red">
                    <div className="module-inner">
                        <Users className="module-icon" />
                        <span className="module-label">CLUB MEMBERSHIP</span>
                        <h2 className="module-value">{players.length}</h2>
                        <div className="module-progress">
                            <div className="progress-fill" style={{ width: '100%' }}></div>
                        </div>
                        <span className="module-sub">TOTAL REGISTERED PLAYERS</span>
                    </div>
                </div>

                <div className="status-module glow-white">
                    <div className="module-inner">
                        <Award className="module-icon" />
                        <span className="module-label">CLUB RANKING</span>
                        <h2 className="module-value">#{rankings.findIndex(r => r.club.toLowerCase().includes('husa')) + 1 || 3}</h2>
                        <div className="module-progress">
                            <div className="progress-fill" style={{ width: '92%' }}></div>
                        </div>
                        <span className="module-sub">DIVISION PROJECTION: ELITE</span>
                    </div>
                </div>

                <div className="status-module glow-red">
                    <div className="module-inner">
                        <Shield className="module-icon" />
                        <span className="module-label">STAFF STATUS</span>
                        <h2 className="module-value">ACTIVE</h2>
                        <div className="module-tag">{staff.length} STAFF MEMBERS</div>
                    </div>
                </div>

                <div className="status-module glow-white">
                    <div className="module-inner">
                        <Trophy className="module-icon" />
                        <span className="module-label">AVERAGE WIN RATE</span>
                        <h2 className="module-value">{winRate}%</h2>
                        <div className="module-progress">
                            <div className="progress-fill" style={{ width: `${winRate}%` }}></div>
                        </div>
                        <span className="module-sub">BASED ON {playedMatches.length} MATCHES</span>
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

                    <div className="card-glitch-header">NEXT FIXTURE</div>
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
                            onClick={() => navigate('/dashboard/president/club')}
                        >
                            VIEW FULL SCHEDULE <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="side-intel-stack">
                    {/* Internal Communications */}
                    <div className="intel-card feed-card">
                        <div className="feed-header">
                            <Zap size={18} className="icon-red" />
                            <h3>INTERNAL COMMS</h3>
                        </div>
                        {latestNote ? (
                            <div className="feed-list">
                                <div className="feed-item technical-note" onClick={() => navigate('/dashboard/president/messages')}>
                                    <div className="item-marker"></div>
                                    <div className="item-info">
                                        <span className="item-name" style={{ fontStyle: 'italic' }}>"{latestNote.content.substring(0, 60)}..."</span>
                                        <span className="item-type">FROM {latestNote.sender_name?.toUpperCase() || 'SYSTEM'}</span>
                                    </div>
                                    <ChevronRight size={14} className="item-arrow" />
                                </div>
                                <button
                                    className="intel-btn-secondary"
                                    style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--border)', color: '#fff', padding: '10px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
                                    onClick={() => navigate('/dashboard/president/messages')}
                                >
                                    OPEN COMMUNICATIONS
                                </button>
                            </div>
                        ) : (
                            <div className="empty-feed">
                                <p style={{ color: '#555', fontSize: '0.8rem', fontStyle: 'italic' }}>No active reports or messages.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Access */}
                    <div className="intel-card squad-snap-card">
                        <div className="feed-header">
                            <Layout size={18} className="icon-red" />
                            <h3>FINANCIAL SNAPSHOT</h3>
                        </div>
                        <div className="squad-status-label" style={{ marginBottom: '1.5rem' }}>
                            <Shield size={14} /> ALL BUDGETS WITHIN PARAMETERS
                        </div>
                        <button
                            className="intel-btn-primary"
                            style={{ padding: '15px' }}
                            onClick={() => navigate('/dashboard/president/financials')}
                        >
                            FINANCIAL OVERVIEW
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. Administration Hub Bar */}
            <div className="intel-card transmission-uplink">
                <div className="transmission-uplink-inner">
                    <div className="transmission-uplink-content">
                        <div className="transmission-icon-box">
                            <Shield size={24} color="#DB0A40" />
                        </div>
                        <div>
                            <div className="transmission-uplink-title">EXECUTIVE PORTAL</div>
                            <div className="transmission-uplink-sub">Access restricted administration tools and management systems.</div>
                        </div>
                    </div>
                    <button
                        className="intel-btn-primary uplink-btn"
                        onClick={() => navigate('/dashboard/president/club')}
                    >
                        ACCESS TOOLS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Overview;
