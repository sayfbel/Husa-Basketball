import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    Award
} from 'lucide-react';
import '../../../css/dashboard.css';
import '../css/overview.css';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const Overview = () => {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [strategies, setStrategies] = useState([]);
    const [matches, setMatches] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [playersRes, strategiesRes, matchesRes, rankingsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/players'),
                    axios.get('http://localhost:5000/api/strategies'),
                    axios.get('http://localhost:5000/api/matches/schedule'),
                    axios.get('http://localhost:5000/api/rankings')
                ]);

                setPlayers(playersRes.data || []);
                setStrategies(strategiesRes.data || []);
                setMatches(matchesRes.data || []);
                setRankings(rankingsRes.data || []);
            } catch (err) {
                console.error("Error fetching overview data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

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

    return (
        <div className="overview-container dashboard-fashion-theme">
            {/* 1. Cinematic Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">COMMAND</div>
                <div className="header-content-box">
                    <span className="premium-label">STRATEGIC COMMAND CENTER</span>
                    <h1 className="hero-dashboard-title">
                        ELITE <br />
                        <span className="accent-text">SQUAD CONTROL</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <div className="pulse-dot"></div>
                            <span>LIVE SYSTEMS: ACTIVE</span>
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
                        <span className="module-label">LAB STATUS</span>
                        <h2 className="module-value">OPTIMAL</h2>
                        <div className="module-progress">
                            <div className="progress-fill" style={{ width: '94%' }}></div>
                        </div>
                        <span className="module-sub">SYSTEM STABILITY: 94%</span>
                    </div>
                </div>

                <div className="status-module glow-white">
                    <div className="module-inner">
                        <Shield className="module-icon" />
                        <span className="module-label">TACTICAL ARCHIVE</span>
                        <h2 className="module-value">{strategies.length}</h2>
                        <div className="module-tag">VALIDATED SYSTEMS</div>
                    </div>
                </div>

                <div className="status-module glow-red">
                    <div className="module-inner">
                        <Calendar className="module-icon" />
                        <span className="module-label">CAMPAIGN PACE</span>
                        <h2 className="module-value">{matches.length}</h2>
                        <div className="module-tag">SCHEDULED EVENTS</div>
                    </div>
                </div>

                <div className="status-module glow-white">
                    <div className="module-inner">
                        <Users className="module-icon" />
                        <span className="module-label">ELITE ROSTER</span>
                        <h2 className="module-value">{players.length}</h2>
                        <div className="module-tag">COMBAT READY</div>
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

                    <div className="card-glitch-header">NEXT ENGAGEMENT</div>
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
                            onClick={() => navigate('/dashboard/coach/match')}
                        >
                            INITIALIZE MATCH PREP <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="side-intel-stack">
                    {/* Performance Feed */}
                    <div className="intel-card feed-card">
                        <div className="feed-header">
                            <Zap size={18} className="icon-red" />
                            <h3>RECENT LAB OUTPUT</h3>
                        </div>
                        <div className="feed-list">
                            {strategies.slice(0, 3).map(strategy => (
                                <div
                                    className="feed-item"
                                    key={strategy.id}
                                    onClick={() => navigate('/dashboard/coach/strategy', { state: { loadTacticId: strategy.id } })}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="item-marker"></div>
                                    <div className="item-info">
                                        <span className="item-name">{strategy.name}</span>
                                        <span className="item-type">{strategy.type || 'FULL'} COURT COMPLEX</span>
                                    </div>
                                    <ChevronRight size={14} className="item-arrow" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Roster Snap */}
                    <div className="intel-card squad-snap-card">
                        <div className="feed-header">
                            <Star size={18} className="icon-red" />
                            <h3>ELITE UNIT STATUS</h3>
                        </div>
                        <div className="squad-avatars">
                            {players.slice(0, 6).map(p => (
                                <div key={p.id} className="squad-avatar-wrapper">
                                    <img src={p.photo_url || '/assets/players/default.png'} alt={p.name} />
                                </div>
                            ))}
                            {players.length > 6 && <div className="squad-more">+{players.length - 6}</div>}
                        </div>
                        <div className="squad-status-label">
                            <Zap size={14} /> ALL PERSONNEL COMBAT READY
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Communication Hub Bar */}
            <div className="intel-card transmission-uplink">
                <div className="transmission-uplink-inner">
                    <div className="transmission-uplink-content">
                        <div className="transmission-icon-box">
                            <Award size={24} color="#DB0A40" />
                        </div>
                        <div>
                            <div className="transmission-uplink-title">OFFICIAL TRANSMISSION UPLINK</div>
                            <div className="transmission-uplink-sub">Submit technical intelligence directly to club leadership.</div>
                        </div>
                    </div>
                    <button
                        className="intel-btn-primary uplink-btn"
                        onClick={() => navigate('/dashboard/coach/report')}
                    >
                        ESTABLISH UPLINK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Overview;
