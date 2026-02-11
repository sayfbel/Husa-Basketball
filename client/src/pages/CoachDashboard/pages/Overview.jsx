
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
        <div className="overview-container animate-fade-in">
            {/* 1. Header & Welcome Area */}
            <div className="section-header-row" style={{ marginBottom: '3rem' }}>
                <div className="role-tag coach-tag">Command Center</div>
                <h1 style={{ fontSize: '3.5rem' }}>Tactical Control</h1>
                <p>Welcome back, Coach. Your squad is synchronized and the playbook is primed.</p>
            </div>

            {/* 2. Premium KPI Strip */}
            <div className="dashboard-grid kpi-strip" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '3rem' }}>
                <div className="dashboard-card kpi-card fashion-glow-red">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span className="kpi-label">Laboratory Status</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                <div className="pulse-red"></div>
                                <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>OPERATIONAL</span>
                            </div>
                        </div>
                        <div className="kpi-icon-container"><Activity size={24} color="#DB0A40" /></div>
                    </div>
                    <div className="kpi-footer"><span className="status-good">●</span> Systems Synchronized</div>
                </div>

                <div className="dashboard-card kpi-card fashion-glow-gold">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span className="kpi-label">Systems Archive</span>
                            <h2 className="kpi-value">{strategies.length}</h2>
                        </div>
                        <div className="kpi-icon-container"><Shield size={24} color="#FFD700" /></div>
                    </div>
                    <div className="kpi-footer"><Zap size={14} /> {strategies.filter(s => s.type === 'full').length} Full Court Sets</div>
                </div>

                <div className="dashboard-card kpi-card fashion-glow-blue">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span className="kpi-label">Season Pace</span>
                            <h2 className="kpi-value">{matches.length}</h2>
                        </div>
                        <div className="kpi-icon-container"><Calendar size={24} color="#3b82f6" /></div>
                    </div>
                    <div className="kpi-footer">Upcoming Fixtures Cached</div>
                </div>

                <div className="dashboard-card kpi-card fashion-glow-purple">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span className="kpi-label">Staff Comms</span>
                            <h2 className="kpi-value">4</h2>
                        </div>
                        <div className="kpi-icon-container"><MessageSquare size={24} color="#a855f7" /></div>
                    </div>
                    <div className="kpi-footer">2 High Urgency Reports</div>
                </div>
            </div>

            {/* 3. Main Operational Grid */}
            <div className="dashboard-grid main-grid" style={{ gridTemplateColumns: '2fr 1.2fr' }}>

                {/* Left: The Big Match Tracker */}
                <div className="dashboard-card match-tracker-card" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
                    <div style={{
                        padding: '2.5rem',
                        background: 'linear-gradient(135deg, rgba(219, 10, 64, 0.1), transparent)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div className="card-header-flex">
                                <div>
                                    <h3 style={{ fontSize: '0.8rem', color: '#DB0A40', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>Next Deployment</h3>
                                    <h2 style={{ fontSize: '2rem', border: 'none', margin: '5px 0' }}>vs {opponent}</h2>
                                    <p style={{ color: '#888', margin: 0 }}>{nextMatch?.venue || 'Venue Pending'} | {nextMatch?.date || 'Date TBD'}</p>
                                </div>
                                <span className="badge-premium">PREPARATION OPEN</span>
                            </div>

                            <div className="match-visual-preview" style={{ marginTop: '2.5rem', position: 'relative', height: '180px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '3rem', fontWeight: '900', color: 'rgba(255,255,255,0.1)', letterSpacing: '10px' }}>VERSUS</div>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '50px' }}>
                                        <div className="team-logo-placeholder">HUSA</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#DB0A40' }}>{nextMatch?.time || '20:00'}</div>
                                        <div className="team-logo-placeholder" style={{ background: 'rgba(255,255,255,0.05)' }}>{opponent.substring(0, 3)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="shiny-btn" style={{ width: '100%', marginTop: '2.5rem', background: 'var(--dash-primary)', color: '#fff', border: 'none', padding: '18px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                            JUMP TO MATCH PREP <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Right: Insights & Lab Snapshot */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="dashboard-card lab-snapshot-card" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                            <Layout size={18} color="#FFD700" />
                            <h2 style={{ fontSize: '1rem', border: 'none', margin: 0, opacity: 1 }}>Recent Tactics</h2>
                        </div>

                        <div className="snapshot-list" style={{ display: 'grid', gap: '15px' }}>
                            {strategies.slice(0, 3).map(strategy => (
                                <div key={strategy.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,215,0,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Shield size={18} color="#FFD700" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{strategy.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>{strategy.type || 'Full'} Court System</div>
                                    </div>
                                    <Clock size={14} color="#444" />
                                </div>
                            ))}
                            {strategies.length === 0 && <p style={{ color: '#444', fontStyle: 'italic', textAlign: 'center' }}>Lab is clean. Start designing.</p>}
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <a href="#/strategy" style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                Open Performance Lab <ChevronRight size={14} />
                            </a>
                        </div>
                    </div>

                    <div className="dashboard-card roster-side-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                            <Star size={18} color="#DB0A40" />
                            <h2 style={{ fontSize: '1rem', border: 'none', margin: 0, opacity: 1 }}>Roster Snapshot</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {players.slice(0, 6).map(p => (
                                <div key={p.id} style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(219, 10, 64, 0.3)' }} title={p.name}>
                                    <img src={p.photo_url || '/assets/players/default.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                            <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: '#888', fontWeight: 'bold' }}>
                                +{players.length > 6 ? players.length - 6 : 0}
                            </div>
                        </div>
                        <div className="stat-item" style={{ marginTop: '1.5rem', border: 'none' }}>
                            <Zap size={14} color="#DB0A40" />
                            <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>All players ready for selection</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Communication Hub Bar */}
            <div className="dashboard-card fashion-glow-red" style={{ marginTop: '3rem', padding: '1.5rem', background: 'linear-gradient(to right, rgba(219, 10, 64, 0.05), transparent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(219, 10, 64, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={24} color="#DB0A40" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Official Reporting System</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Transmit technical insights directly to the President or Squad.</div>
                        </div>
                    </div>
                    <button style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.2)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                        NEW REPORT
                    </button>
                </div>
            </div>

            <style>{`
                .kpi-card {
                    padding: 1.5rem !important;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 140px;
                }
                .kpi-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #888;
                    font-weight: 700;
                }
                .kpi-value {
                    font-size: 2.5rem !important;
                    margin: 10px 0 !important;
                    color: #fff !important;
                    border: none !important;
                    opacity: 1 !important;
                    font-weight: 900 !important;
                }
                .kpi-icon-container {
                    width: 44px;
                    height: 44px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .kpi-footer {
                    font-size: 0.75rem;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 10px;
                }
                .fashion-glow-red { box-shadow: inset 0 0 20px rgba(219, 10, 64, 0.05); }
                .fashion-glow-gold { box-shadow: inset 0 0 20px rgba(255, 215, 0, 0.05); }
                .fashion-glow-blue { box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.05); }
                .fashion-glow-purple { box-shadow: inset 0 0 20px rgba(168, 85, 247, 0.05); }

                .badge-premium {
                    background: rgba(219, 10, 64, 0.1);
                    color: #DB0A40;
                    padding: 6px 14px;
                    border-radius: 30px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 1px;
                    border: 1px solid rgba(219, 10, 64, 0.2);
                }

                .team-logo-placeholder {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    background: rgba(219, 10, 64, 0.2);
                    border: 2px solid #DB0A40;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 1.2rem;
                    color: #fff;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
                }

                .loading-spinner-premium {
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(219, 10, 64, 0.1);
                    border-top-color: #DB0A40;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .animate-fade-in {
                    animation: fadeIn 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .pulse-red {
                    width: 10px;
                    height: 10px;
                    background: #DB0A40;
                    border-radius: 50%;
                    box-shadow: 0 0 0 rgba(219, 10, 64, 0.4);
                    animation: pulseRed 2s infinite;
                }

                @keyframes pulseRed {
                    0% { box-shadow: 0 0 0 0 rgba(219, 10, 64, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(219, 10, 64, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(219, 10, 64, 0); }
                }

                .shiny-btn {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s;
                }

                .shiny-btn::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(
                        transparent,
                        rgba(255, 255, 255, 0.1),
                        transparent
                    );
                    transform: rotate(45deg);
                    animation: shinyMotion 4s infinite;
                }

                @keyframes shinyMotion {
                    0% { transform: translateX(-100%) rotate(45deg); }
                    100% { transform: translateX(100%) rotate(45deg); }
                }
            `}</style>
        </div>
    );
};

export default Overview;
