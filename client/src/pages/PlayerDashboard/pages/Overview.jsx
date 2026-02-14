import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import {
    TrendingUp,
    Calendar,
    Target,
    Zap,
    Trophy,
    Activity,
    Clock
} from 'lucide-react';

const isPastMatch = (matchDate) => {
    try {
        const d = new Date(matchDate && matchDate.includes('/') ? matchDate.split('/').reverse().join('-') : matchDate);
        if (isNaN(d.getTime())) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d < today;
    } catch (e) { return false; }
};

const Overview = () => {
    const { currentUser } = useAuth();
    const [nextMatch, setNextMatch] = useState(null);
    const [matches, setMatches] = useState([]);
    const [reports, setReports] = useState([]);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Schedule
                const matchesRes = await axios.get('http://localhost:5000/api/matches/schedule');
                const fetchedMatches = matchesRes.data || [];
                setMatches(fetchedMatches);


                const upcoming = fetchedMatches.find(m => !isPastMatch(m.date));
                setNextMatch(upcoming);

                if (upcoming) {
                    calculateTimeLeft(upcoming.date, upcoming.time);
                }

                // 2. Fetch Personal Reports (Coach Notes)
                if (currentUser?.id) {
                    const reportsRes = await axios.get(`http://localhost:5000/api/reports?playerId=${currentUser.id}`);
                    setReports(reportsRes.data || []);
                }
            } catch (err) {
                console.error("Error fetching overview data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const timer = setInterval(() => {
            if (nextMatch) calculateTimeLeft(nextMatch.date, nextMatch.time);
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [currentUser, nextMatch?.date]);

    const calculateTimeLeft = (dateStr, timeStr) => {
        try {
            const d = new Date(dateStr.includes('/') ? dateStr.split('/').reverse().join('-') : dateStr);
            if (timeStr) {
                const [h, m] = timeStr.split(':');
                d.setHours(parseInt(h), parseInt(m));
            }

            const diff = d.getTime() - new Date().getTime();
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                setTimeLeft({ days, hours });
            } else {
                setTimeLeft({ days: 0, hours: 0 });
            }
        } catch (e) {
            setTimeLeft({ days: 0, hours: 0 });
        }
    };

    const latestCoachNote = reports.find(r => r.sender_name.toLowerCase().includes('coach') || r.type === 'technical') || (reports.length > 0 ? reports[0] : null);

    return (
        <div className="animate-fade-in">
            <div className="dashboard-grid">
                {/* 1. Performance Summary */}
                <div className="dashboard-card status-card">
                    <div className="card-header-flex">
                        <h2>Personal Performance</h2>
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
                        <span>Attendance Rate</span>
                        <strong>94%</strong>
                    </div>
                </div>

                {/* 2. Upcoming Target (Countdown) */}
                <div className="dashboard-card stats-card">
                    <div className="card-header-flex">
                        <h2>Upcoming Target</h2>
                        <Calendar size={20} color="#DB0A40" />
                    </div>
                    <p style={{ color: '#888', marginBottom: '1rem' }}>
                        {nextMatch ? `vs ${nextMatch.opponent || (nextMatch.home.includes('HUSA') ? nextMatch.away : nextMatch.home)}` : 'No upcoming events'}
                    </p>
                    {nextMatch && (
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff' }}>{String(timeLeft.days).padStart(2, '0')}</div>
                                <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '1px' }}>DAYS</div>
                            </div>
                            <div style={{ fontSize: '1.5rem', opacity: 0.3, color: '#DB0A40' }}>:</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
                                <div style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '1px' }}>HOURS</div>
                            </div>
                            <div className="pulse-dot" style={{ marginLeft: 'auto', background: '#DB0A40' }}></div>
                        </div>
                    )}
                </div>

                {/* 3. Recent Results */}
                <div className="dashboard-card">
                    <div className="card-header-flex">
                        <h2>Recent Results</h2>
                        <Trophy size={20} color="#fcd34d" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {matches.filter(m => isPastMatch(m.date) && m.score !== '-').slice(0, 2).map((match, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(255,255,255,0.03)',
                                padding: '10px 15px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold' }}>{match.date}</span>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#eee' }}>
                                        vs {match.opponent || (match.home.includes('HUSA') ? match.away : match.home)}
                                    </span>
                                </div>
                                <div style={{
                                    background: 'rgba(219, 10, 64, 0.15)',
                                    color: '#DB0A40',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontWeight: '900',
                                    fontSize: '0.95rem'
                                }}>
                                    {match.score}
                                </div>
                            </div>
                        ))}
                        {matches.filter(m => isPastMatch(m.date) && m.score !== '-').length === 0 && (
                            <div style={{ textAlign: 'center', padding: '10px', color: '#444', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                No recent match results archived.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Coach's Feedback */}
            <div className="dashboard-card" style={{ marginTop: '2rem', borderLeft: '4px solid #DB0A40' }}>
                <div className="card-header-flex">
                    <h2>Technical Intel / Coach's Feed</h2>
                    <Activity size={18} color="#DB0A40" />
                </div>
                {latestCoachNote ? (
                    <>
                        <p style={{ color: '#ddd', fontStyle: 'italic', lineHeight: '1.8', fontSize: '1.05rem' }}>
                            "{latestCoachNote.content}"
                        </p>
                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#666', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={14} color="#DB0A40" />
                            </div>
                            <div>
                                <div style={{ color: '#aaa', fontWeight: 'bold' }}>Sent by {latestCoachNote.sender_name}</div>
                                <div>{new Date(latestCoachNote.created_at).toLocaleDateString()} • {latestCoachNote.type.toUpperCase()} INTEL</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No technical feedback available yet. Maintain training pace.</p>
                )}
            </div>
        </div>
    );
};

export default Overview;
