import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import {
    Calendar,
    MapPin,
    Users,
    Shield,
    ChevronRight,
    Trophy,
    Activity,
    Clock,
    Layout,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    X,
    Search,
    Plus
} from 'lucide-react';
import { createPortal } from 'react-dom';

const MiniCourtPreview = ({ tactic }) => {
    const data = typeof tactic.data === 'string' ? JSON.parse(tactic.data) : (tactic.data || []);
    const firstFrame = data?.[0] || { tokens: [], paths: [] };
    const type = tactic.type || 'full';
    const viewBoxH = type === 'full' ? 560 : 470;
    const viewBoxW = type === 'full' ? 1000 : 500;
    const themeColor = '#DB0A40';

    return (
        <div className="mini-court-preview" style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
        }}>
            <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} style={{
                width: '100%',
                height: '100%',
                opacity: 0.3,
                maskImage: 'linear-gradient(to left, white 40%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to left, white 40%, transparent 100%)'
            }}>
                <rect width={viewBoxW} height={viewBoxH} fill="none" stroke={themeColor} strokeWidth="2" opacity="0.2" />
                {viewBoxW === 1000 && <line x1="500" y1="0" x2="500" y2="560" stroke="#fff" strokeWidth="1" opacity="0.1" />}
                <circle cx={viewBoxW / 2} cy={viewBoxW === 1000 ? 280 : 205} r={viewBoxW === 1000 ? 70 : 60} fill="none" stroke={themeColor} strokeWidth="1" opacity="0.2" />

                {firstFrame.paths?.map((d, i) => (
                    <path key={`path-${i}`} d={d} stroke="#fcd34d" strokeWidth="6" fill="none" opacity="0.3" strokeDasharray="10,5" />
                ))}

                {firstFrame.tokens && firstFrame.tokens.map((token, idx) => (
                    <circle
                        key={idx}
                        cx={`${token.x * (viewBoxW / 100)}`}
                        cy={`${token.y * (viewBoxH / 100)}`}
                        r="18"
                        fill={token.type === 'offense' ? '#DB0A40' : token.type === 'defense' ? '#000' : '#f97316'}
                        stroke={token.type === 'defense' ? 'rgba(255,255,255,0.2)' : 'none'}
                        strokeWidth="2"
                    />
                ))}
            </svg>
        </div>
    );
};

const ReadOnlyCourt = ({ frames, type = 'full', players = [] }) => {
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const playInterval = useRef(null);
    const viewBox = type === 'full' ? { w: 1000, h: 560 } : { w: 500, h: 470 };

    const currentFrame = frames[currentFrameIndex] || { tokens: [], paths: [] };

    useEffect(() => {
        if (isPlaying) {
            playInterval.current = setInterval(() => {
                setCurrentFrameIndex(prev => {
                    if (prev >= frames.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 800);
        } else {
            clearInterval(playInterval.current);
        }
        return () => clearInterval(playInterval.current);
    }, [isPlaying, frames.length]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <div style={{ background: '#111', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: type === 'full' ? '1000/560' : '500/470' }}>
                {type === 'full' ? (
                    <svg viewBox="0 0 1000 560" style={{ width: '100%', height: '100%', display: 'block' }}>
                        <rect width="1000" height="560" fill="#1a1a1a" />
                        <rect x="25" y="25" width="950" height="510" fill="none" stroke="#fff" strokeWidth="5" />
                        <line x1="500" y1="25" x2="500" y2="535" stroke="#fff" strokeWidth="5" />
                        <circle cx="500" cy="280" r="70" fill="none" stroke="#DB0A40" strokeWidth="5" />
                        <rect x="25" y="205" width="190" height="150" fill="rgba(219, 10, 64, 0.3)" stroke="#fff" strokeWidth="5" />
                        <path d="M 215,205 A 75,75 0 0 1 215,355" fill="none" stroke="#fff" strokeWidth="5" />
                        <path d="M 25,80 L 240,80 A 250,250 0 0 1 240,480 L 25,480" fill="none" stroke="#fff" strokeWidth="5" />
                        <circle cx="75" cy="280" r="15" fill="none" stroke="#fff" strokeWidth="5" />
                        <rect x="785" y="205" width="190" height="150" fill="rgba(219, 10, 64, 0.3)" stroke="#fff" strokeWidth="5" />
                        <path d="M 785,205 A 75,75 0 0 0 785,355" fill="none" stroke="#fff" strokeWidth="5" />
                        <path d="M 975,80 L 760,80 A 250,250 0 0 0 760,480 L 975,480" fill="none" stroke="#fff" strokeWidth="5" />
                        <circle cx="925" cy="280" r="15" fill="none" stroke="#fff" strokeWidth="5" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 500 470" style={{ width: '100%', height: '100%', display: 'block' }}>
                        <rect width="500" height="470" fill="#1a1a1a" />
                        <rect x="15" y="15" width="470" height="440" fill="none" stroke="#fff" strokeWidth="4" />
                        <rect x="165" y="15" width="170" height="190" fill="rgba(219, 10, 64, 0.3)" stroke="#fff" strokeWidth="4" />
                        <circle cx="250" cy="205" r="60" fill="none" stroke="#fff" strokeWidth="4" />
                        <path d="M 30,15 L 30,230 A 250,250 0 0 0 470,230 L 470,15" fill="none" stroke="#fff" strokeWidth="4" />
                        <circle cx="250" cy="55" r="12" fill="none" stroke="#fff" strokeWidth="4" />
                        <line x1="220" y1="40" x2="280" y2="40" stroke="#fff" strokeWidth="4" />
                    </svg>
                )}

                <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {currentFrame.paths?.map((d, i) => (
                        <path key={i} d={d} stroke="#fcd34d" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
                    ))}
                </svg>

                {/* Tokens Layer */}
                {currentFrame.tokens?.map((token, idx) => {
                    let player = null;
                    if (token.type === 'offense' && players && players.length > 0) {
                        const posNumber = parseInt(token.label);
                        if (!isNaN(posNumber) && posNumber >= 1 && posNumber <= 5) {
                            player = players[posNumber - 1];
                        }
                    }

                    return (
                        <div
                            key={idx}
                            style={{
                                position: 'absolute',
                                top: `${token.y}%`,
                                left: `${token.x}%`,
                                width: token.type === 'ball' ? '20px' : (player ? '40px' : '30px'),
                                height: token.type === 'ball' ? '20px' : (player ? '40px' : '30px'),
                                transform: 'translate(-50%, -50%)',
                                transition: isPlaying ? 'all 800ms ease' : 'all 300ms ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                                zIndex: token.type === 'ball' ? 5 : 2
                            }}
                        >
                            {player ? (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    border: '2px solid #fff',
                                    overflow: 'hidden',
                                    background: '#000',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                                    position: 'relative'
                                }}>
                                    <img src={player.photo_url || "/assets/players/default.png"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.8)',
                                        color: '#fff',
                                        fontSize: '10px',
                                        fontWeight: '950',
                                        textAlign: 'center',
                                        padding: '2px 0'
                                    }}>
                                        #{player.jersey_number}
                                    </div>
                                </div>
                            ) : (
                                <div className={`player-token ${token.type === 'offense' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {token.label}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ padding: '15px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <button
                    onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: currentFrameIndex === 0 ? 0.3 : 1 }}
                >
                    <SkipBack size={20} />
                </button>

                <button
                    onClick={togglePlay}
                    style={{ background: 'var(--dash-primary)', border: 'none', color: '#fff', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 15px rgba(219, 10, 64, 0.4)' }}
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />}
                </button>

                <button
                    onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: currentFrameIndex === frames.length - 1 ? 0.3 : 1 }}
                >
                    <SkipForward size={20} />
                </button>

                <div style={{ position: 'absolute', right: '30px', color: '#666', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    FRAME {currentFrameIndex + 1} / {frames.length}
                </div>
            </div>
        </div>
    );
};

const Match = () => {
    const { currentUser } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [selectedTactic, setSelectedTactic] = useState(null);
    const [visibleCount, setVisibleCount] = useState(2);

    useEffect(() => {
        fetchClubSchedule();
    }, []);

    const fetchClubSchedule = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/matches/schedule');
            const allMatches = res.data || [];

            // Filter out matches that might have empty/missing data
            const validMatches = allMatches.filter(m => m.home && m.away && m.date);

            // Sort matches by ID
            const sorted = [...validMatches].sort((a, b) => {
                // Numeric sort if applicable, otherwise string sort
                const idA = isNaN(a.id) ? a.id : Number(a.id);
                const idB = isNaN(b.id) ? b.id : Number(b.id);
                if (typeof idA === 'number' && typeof idB === 'number') {
                    return idA - idB;
                }
                return String(idA).localeCompare(String(idB));
            });

            setMatches(sorted);

            if (sorted.length > 0) {
                // Select the first upcoming match, or the most recent played match
                const next = sorted.find(m => {
                    const d = new Date(m.date.split('/').reverse().join('-'));
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return d >= today;
                }) || sorted[0]; // If none upcoming, select the newest result

                setSelectedMatch(next);
            }
        } catch (err) {
            console.error("Error fetching club schedule:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString.includes('/') ? dateString.split('/').reverse().join('-') : dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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

    const nextMatch = matches.find(m => !isPastMatch(m.date));
    const otherMatches = matches.filter(m => m.id !== nextMatch?.id);

    return (
        <div className="animate-fade-in match-page-refined">
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Accessing Club Schedule...</p>
                </div>
            ) : (
                <div className="match-layout-v2">
                    {/* Left Panel: Match Feed */}
                    <div className="match-feed-column">
                        <div className="section-title-fancy">
                            <Activity size={24} color="var(--dash-primary)" />
                            <h2>Club Fixtures</h2>
                            <div className="dot-line"></div>
                        </div>

                        {nextMatch && (
                            <div className="hero-match-card-wrapper">
                                <span className="feed-category">UPCOMING FIXTURE</span>
                                <div
                                    className={`hero-match-card ${selectedMatch?.id === nextMatch.id ? 'active' : ''}`}
                                    onClick={() => setSelectedMatch(nextMatch)}
                                >
                                    <div className="hero-bg-accent"></div>
                                    <div className="hero-date">
                                        <div className="day">{nextMatch.date.split('/')[0]}</div>
                                        <div className="month">{new Date(nextMatch.date.split('/').reverse().join('-')).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                                    </div>
                                    <div className="hero-content">
                                        <div className="hero-status">
                                            <span className="live-dot"></span> OPERATIONAL
                                        </div>
                                        <h2 className="hero-opponent">VS {(nextMatch.home.includes('HUSA') ? nextMatch.away : nextMatch.home).split(' ')[0]}</h2>
                                        <div className="hero-meta">
                                            <span><MapPin size={14} /> {nextMatch.venue}</span>
                                            <span><Clock size={14} /> {nextMatch.time}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="history-section">
                            <span className="feed-category">ALL SCHEDULED EVENTS</span>
                            <div className="transmissions-list">
                                {otherMatches.slice(0, visibleCount).map((match) => (
                                    <div
                                        key={match.id}
                                        className={`transmission-card-v2 ${selectedMatch?.id === match.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedMatch(match)}
                                    >
                                        <div className="card-accent"></div>
                                        <div className="card-main">
                                            <div className="card-date-v2">
                                                <span className="d">{match.date.split('/')[0]}</span>
                                                <span className="m">{match.date.split('/')[1]}</span>
                                            </div>
                                            <div className="card-info-v2">
                                                <h4>{(match.home.includes('HUSA') ? match.away : match.home)}</h4>
                                                <p>{match.venue.substring(0, 20)}...</p>
                                            </div>
                                            {match.score && match.score !== '-' && (
                                                <div className="card-score-v2">{match.score}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {visibleCount < otherMatches.length && (
                                <button
                                    className="filter-btn-v2"
                                    onClick={() => setVisibleCount(prev => prev + 4)}
                                    style={{
                                        width: '100%',
                                        marginTop: '15px',
                                        justifyContent: 'center',
                                        background: 'rgba(219, 10, 64, 0.03)',
                                        border: '1px dashed rgba(219, 10, 64, 0.2)'
                                    }}
                                >
                                    <Plus size={14} />
                                    SHOW MORE RECORDS ({otherMatches.length - visibleCount} REMAINING)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Match Overview */}
                    <div className="briefing-detail-column">
                        {selectedMatch ? (
                            <div className="briefing-container-v2 animate-slide-up">
                                <div className="briefing-banner">
                                    <Shield size={32} />
                                    <div className="banner-text">
                                        <h3>FIXTURE OVERVIEW</h3>
                                        <p>{selectedMatch.home} VS {selectedMatch.away}</p>
                                    </div>
                                </div>

                                <div className="briefing-core" style={{ padding: '2rem' }}>
                                    <div className="briefing-meta-grid" style={{ marginBottom: '2rem' }}>
                                        <div className="meta-box">
                                            <span className="label">DATE</span>
                                            <span className="value">{formatDate(selectedMatch.date)}</span>
                                        </div>
                                        <div className="meta-box">
                                            <span className="label">VENUE</span>
                                            <span className="value">{selectedMatch.venue}</span>
                                        </div>
                                        <div className="meta-box">
                                            <span className="label">TIME</span>
                                            <span className="value">{selectedMatch.time}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                                            <span className="module-label">HOME</span>
                                            <h2 style={{ fontSize: '1.5rem', margin: '15px 0' }}>{selectedMatch.home}</h2>
                                            {selectedMatch.score !== '-' && <div style={{ fontSize: '3rem', fontWeight: '900' }}>{selectedMatch.score.split('-')[0]}</div>}
                                        </div>
                                        <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                                            <span className="module-label">AWAY</span>
                                            <h2 style={{ fontSize: '1.5rem', margin: '15px 0' }}>{selectedMatch.away}</h2>
                                            {selectedMatch.score !== '-' && <div style={{ fontSize: '3rem', fontWeight: '900' }}>{selectedMatch.score.split('-')[1]}</div>}
                                        </div>
                                    </div>

                                    <div className="briefing-footer-v2" style={{ marginTop: '3rem' }}>
                                        <button className="confirm-btn-v2" onClick={() => window.open(`https://www.google.com/search?q=${selectedMatch.home}+vs+${selectedMatch.away}`, '_blank')}>
                                            <Search size={18} />
                                            TRACK EXTERNAL INTEL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="briefing-empty-v2">
                                <Calendar size={60} />
                                <h3>SELECT FIXTURE</h3>
                                <p>Choose a fixture from the club timeline to view details.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Match;
