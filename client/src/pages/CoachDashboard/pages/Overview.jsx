
import React, { useState, useEffect } from 'react';
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

const Overview = () => {
    const [players, setPlayers] = useState([]);
    const [strategies, setStrategies] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [playersRes, strategiesRes, matchesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/players'),
                    axios.get('http://localhost:5000/api/strategies'),
                    axios.get('http://localhost:5000/api/matches/scrape')
                ]);

                setPlayers(playersRes.data || []);
                setStrategies(strategiesRes.data || []);
                setMatches(matchesRes.data || []);
            } catch (err) {
                console.error("Error fetching overview data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const nextMatch = matches[0] || null;
    const opponent = nextMatch ? (nextMatch.home.includes('HUSA') ? nextMatch.away : nextMatch.home) : 'TBD';

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="loading-spinner-premium"></div>
            </div>
        );
    }

    return (
        <div className="overview-container animate-fade-in dashboard-fashion-theme">
            {/* 1. Cinematic Header */}
            <div className="section-header-modern" style={{ marginBottom: '4rem', position: 'relative' }}>
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
            <div className="dashboard-grid matrix-grid" style={{ marginBottom: '4rem' }}>
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
                        <button className="intel-btn-primary">
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
                                <div className="feed-item" key={strategy.id}>
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
            <div className="intel-card transmission-uplink" style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <div className="transmission-icon-box">
                            <Award size={24} color="#DB0A40" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: '900', letterSpacing: '1px' }}>OFFICIAL TRANSMISSION UPLINK</div>
                            <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: '700', marginTop: '4px' }}>Submit technical intelligence directly to club leadership.</div>
                        </div>
                    </div>
                    <button className="intel-btn-primary" style={{ width: 'auto', padding: '15px 40px' }}>
                        ESTABLISH UPLINK
                    </button>
                </div>
            </div>

            <style>{`
                .dashboard-fashion-theme {
                    --accent: #DB0A40;
                    --bg-dark: #050505;
                    --glass: rgba(255, 255, 255, 0.02);
                    --border: rgba(255, 255, 255, 0.05);
                }

                /* Header Modern */
                .section-header-modern {
                    position: relative;
                }
                .watermark-bg {
                    position: absolute;
                    top: -50%;
                    left: -10%;
                    font-size: 15rem;
                    font-weight: 900;
                    color: rgba(255, 255, 255, 0.02);
                    z-index: 1;
                    pointer-events: none;
                }
                .header-content-box {
                    position: relative;
                    z-index: 2;
                }
                .hero-dashboard-title {
                    font-size: 5rem;
                    font-weight: 900;
                    line-height: 0.85;
                    letter-spacing: -4px;
                    margin: 1rem 0;
                    text-transform: uppercase;
                }
                .accent-text {
                    color: transparent;
                    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.4);
                }
                .header-status-bar {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-top: 2rem;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    color: #888;
                }
                .status-item { display: flex; align-items: center; gap: 8px; }
                .pulse-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; animation: pulse 2s infinite; }
                .divider { width: 1px; height: 15px; background: var(--border); }

                /* Matrix Grid */
                .matrix-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                .status-module {
                    background: var(--glass);
                    border: 1px solid var(--border);
                    padding: 2rem;
                    position: relative;
                    transition: all 0.4s ease;
                }
                .status-module:hover {
                    background: rgba(219, 10, 64, 0.02);
                    border-color: rgba(219, 10, 64, 0.3);
                    transform: translateY(-5px);
                }
                .module-icon { color: var(--accent); margin-bottom: 2rem; }
                .module-label { display: block; font-size: 0.65rem; font-weight: 800; color: #666; letter-spacing: 2px; }
                .module-value { font-size: 2.5rem; font-weight: 900; margin: 0.5rem 0; letter-spacing: -1px; }
                .module-progress { height: 2px; background: rgba(255,255,255,0.05); margin: 1.5rem 0 0.5rem; }
                .progress-fill { height: 100%; background: var(--accent); box-shadow: 0 0 10px var(--accent); }
                .module-sub { font-size: 0.6rem; color: #444; font-weight: 700; }
                .module-tag { font-size: 0.7rem; font-weight: 800; color: #888; margin-top: 1rem; }

                /* Operational Grid */
                .operational-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 30px;
                    margin-bottom: 4rem;
                }
                .side-intel-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }
                .intel-card {
                    background: var(--glass);
                    border: 1px solid var(--border);
                    padding: 3rem;
                    position: relative;
                }
                .intel-card.feed-card, .intel-card.squad-snap-card { padding: 2.5rem; }
                
                .card-glitch-header {
                    font-size: 0.7rem;
                    font-weight: 900;
                    letter-spacing: 3px;
                    color: var(--accent);
                    margin-bottom: 3rem;
                    padding-left: 15px;
                    border-left: 2px solid var(--accent);
                }
                .engagement-teams {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 3rem;
                }
                .team-focus { display: flex; flex-direction: column; }
                .team-initials { font-size: 3rem; font-weight: 900; letter-spacing: -2px; }
                .team-role { font-size: 0.7rem; font-weight: 800; color: #555; letter-spacing: 2px; }
                .vs-separator { text-align: center; flex: 1; padding: 0 40px; }
                .vs-text { font-size: 0.8rem; font-weight: 900; color: #333; }
                .vs-line { height: 1px; background: linear-gradient(to right, transparent, #333, transparent); margin-top: 10px; }
                
                .engagement-meta {
                    display: flex;
                    gap: 30px;
                    margin-bottom: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border);
                }
                .meta-bit { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 700; color: #888; }
                
                .intel-btn-primary {
                    width: 100%;
                    background: #fff;
                    color: #000;
                    border: none;
                    padding: 20px;
                    font-weight: 900;
                    font-size: 0.8rem;
                    letter-spacing: 2px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                }
                .intel-btn-primary:hover {
                    background: var(--accent);
                    color: #fff;
                    transform: translateY(-3px);
                    box-shadow: 0 10px 30px rgba(219, 10, 64, 0.3);
                }

                /* Feed Card & Squad Card */
                .feed-header { display: flex; align-items: center; gap: 15px; margin-bottom: 2rem; }
                .feed-header h3 { font-size: 0.9rem; font-weight: 900; letter-spacing: 1px; }
                .feed-list { display: grid; gap: 12px; }
                .feed-item {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 15px;
                    background: rgba(255,255,255,0.01);
                    border: 1px solid var(--border);
                    transition: all 0.3s;
                    cursor: pointer;
                }
                .feed-item:hover {
                    background: rgba(255,255,255,0.03);
                    border-color: rgba(255,255,255,0.1);
                    padding-left: 20px;
                }
                .item-marker { width: 3px; height: 25px; background: var(--border); transition: all 0.3s; }
                .feed-item:hover .item-marker { background: var(--accent); box-shadow: 0 0 10px var(--accent); }
                .item-info { flex: 1; display: flex; flex-direction: column; }
                .item-name { font-size: 0.85rem; font-weight: 800; }
                .item-type { font-size: 0.6rem; font-weight: 700; color: #555; margin-top: 2px; }

                .squad-avatars { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 1.5rem; }
                .squad-avatar-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 1px solid var(--border);
                    background: #111;
                }
                .squad-avatar-wrapper img { width: 100%; height: 100%; object-fit: cover; }
                .squad-more {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #555;
                }
                .squad-status-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.65rem;
                    font-weight: 900;
                    color: var(--accent);
                    letter-spacing: 1px;
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }

                @media (max-width: 1200px) {
                    .matrix-grid { grid-template-columns: 1fr 1fr; }
                    .operational-grid { grid-template-columns: 1fr; }
                    .hero-dashboard-title { font-size: 3.5rem; }
                }
                .transmission-icon-box {
                    width: 60px;
                    height: 60px;
                    background: rgba(219, 10, 64, 0.1);
                    border: 1px solid rgba(219, 10, 64, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
};

export default Overview;
