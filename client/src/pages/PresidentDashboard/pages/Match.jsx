import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Calendar,
    Trophy,
    Activity,
    ChevronRight,
    Info,
    Clock,
    MapPin,
    Shield,
    Users,
    TrendingUp,
    Zap,
    Layout,
    Target,
    Award
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import '../../../css/dashboard.css';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const Match = () => {
    const { currentUser } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        wins: 0,
        losses: 0,
        winRate: 0
    });

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/matches/schedule');
                const matchData = res.data || [];
                setMatches(matchData);
                calculateStats(matchData);
            } catch (err) {
                console.error("Error fetching match data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    const calculateStats = (data) => {
        const playedMatches = data.filter(m => {
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

        const total = playedMatches.length;
        const winRate = total > 0 ? ((wins / total) * 100).toFixed(0) : 0;

        setStats({
            total,
            wins,
            losses: total - wins,
            winRate
        });
    };

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

    const [displayLimit, setDisplayLimit] = useState(5);

    const upcomingMatches = matches.filter(m => !isPastMatch(m.date));
    const recentResults = matches.filter(m => isPastMatch(m.date)).reverse().slice(0, 5);

    if (loading) return <div className="animate-fade-in" style={{ padding: '2rem', color: '#fff' }}>Synchronizing match intelligence...</div>;

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">MATCHES</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">EXECUTIVE OVERSIGHT</span>
                    <h1 className="hero-dashboard-title">
                        COMPETITION <br />
                        <span className="accent-text">MANAGEMENT</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <Activity size={14} />
                            <span>SEASON 2024/25</span>
                        </div>
                        <div className="status-item">
                            <TrendingUp size={14} />
                            <span style={{ color: '#4cd137' }}>{stats.winRate}% WIN RATE</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ alignItems: 'flex-start' }}>
                {/* Stats Summary */}
                <div className="intel-card" style={{ gridColumn: 'span 3', display: 'flex', gap: '30px', padding: '2rem' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }}>TOTAL ENCOUNTERS</span>
                        <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '900' }}>{stats.total + upcomingMatches.length}</h2>
                        <div style={{ width: '30px', height: '2px', background: '#DB0A40', marginTop: '5px' }}></div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }}>VICTORIES</span>
                        <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '900', color: '#4cd137' }}>{stats.wins}</h2>
                        <div style={{ width: '30px', height: '2px', background: '#4cd137', marginTop: '5px' }}></div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }}>DEFEATS</span>
                        <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '900', color: '#ff3b30' }}>{stats.losses}</h2>
                        <div style={{ width: '30px', height: '2px', background: '#ff3b30', marginTop: '5px' }}></div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }}>WIN PROBABILITY</span>
                        <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '900', color: '#DB0A40' }}>{stats.winRate}%</h2>
                        <div style={{ width: '30px', height: '2px', background: '#DB0A40', marginTop: '5px' }}></div>
                    </div>
                </div>

                {/* Upcoming Schedule */}
                <div className="intel-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header-modern" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>UPCOMING FIXTURES</h3>
                        <Calendar size={18} color="#DB0A40" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {upcomingMatches.length > 0 ? (
                            <>
                                {upcomingMatches.slice(0, displayLimit).map((match, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        padding: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div style={{ textAlign: 'center', width: '60px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#DB0A40' }}>{match.date?.split('/')[0]}</div>
                                            <div style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase' }}>{match.date?.split('/')[1]} / {match.date?.split('/')[2]}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.6rem', color: '#666', marginBottom: '2px' }}>{match.time} • {match.venue}</div>
                                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                                                {match.home} <span style={{ color: '#DB0A40', margin: '0 5px' }}>VS</span> {match.away}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {upcomingMatches.length > displayLimit && (
                                    <button
                                        onClick={() => setDisplayLimit(prev => prev + 5)}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            padding: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: '900',
                                            letterSpacing: '2px',
                                            cursor: 'pointer',
                                            marginTop: '10px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => { e.target.style.background = '#DB0A40'; e.target.style.borderColor = '#DB0A40'; }}
                                        onMouseOut={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                    >
                                        SHOW MORE FIXTURES
                                    </button>
                                )}
                            </>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#444' }}>No upcoming matches scheduled.</div>
                        )}
                    </div>
                </div>

                {/* Recent Results */}
                <div className="intel-card">
                    <div className="card-header-modern" style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>RECENT PERFORMANCE</h3>
                        <Trophy size={18} color="#DB0A40" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {recentResults.map((match, idx) => {
                            const scores = match.score?.split('-').map(s => parseInt(s.trim()));
                            const isHome = match.home.toUpperCase().includes('HUSA') || match.home.toUpperCase().includes('HASSANIA');
                            const husaScore = isHome ? scores[0] : scores[1];
                            const oppScore = isHome ? scores[1] : scores[0];
                            const isWin = husaScore > oppScore;

                            return (
                                <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '0.7rem', color: '#888' }}>{match.date}</span>
                                        <span style={{
                                            fontSize: '0.6rem',
                                            fontWeight: '900',
                                            color: isWin ? '#4cd137' : '#ff3b30',
                                            background: isWin ? 'rgba(76, 209, 55, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '20px'
                                        }}>{isWin ? 'WIN' : 'LOSS'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '500' }}>{isHome ? match.away : match.home}</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>{husaScore} - {oppScore}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Executive Advisory Card - Bottom */}
                <div className="intel-card" style={{ gridColumn: 'span 3', background: 'linear-gradient(90deg, rgba(219, 10, 64, 0.05) 0%, rgba(0,0,0,0) 100%)', borderLeft: '4px solid #DB0A40' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px' }}>
                        <Shield size={32} color="#DB0A40" />
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px', color: '#DB0A40', textTransform: 'uppercase' }}>EXECUTIVE ADVISORY PROTOCOL</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#aaa', lineHeight: '1.6' }}>
                                Analyze squad performance across these metrics to inform future technical staff briefings.
                                Executive oversight requires constant monitoring of competitive trends to ensure club objectives are met.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Match;
