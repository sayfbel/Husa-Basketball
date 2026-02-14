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
    X
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
                    // Logic to find player for this token
                    let player = null;
                    if (token.type === 'offense' && players && players.length > 0) {
                        const posNumber = parseInt(token.label);
                        if (!isNaN(posNumber) && posNumber >= 1 && posNumber <= 5) {
                            player = players[posNumber - 1]; // Use index or specific mapping
                        }
                    }

                    return (
                        <div
                            key={idx}
                            style={{
                                position: 'absolute',
                                top: `${token.y}%`,
                                left: `${token.x}%`,
                                width: token.type === 'ball' ? '30px' : (player ? '50px' : '40px'),
                                height: token.type === 'ball' ? '30px' : (player ? '50px' : '40px'),
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

    useEffect(() => {
        if (currentUser?.name) {
            fetchPlayerMatches();
        }
    }, [currentUser]);

    const fetchPlayerMatches = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/matches/player/${currentUser.name}`);
            setMatches(res.data);
            // Default select the first match (most recent or next)
            if (res.data.length > 0) {
                setSelectedMatch(res.data[0]);
            }
        } catch (err) {
            console.error("Error fetching player matches:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString, variant = 'short') => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            ...(variant === 'long' && { hour12: true })
        });
    };

    const nextMatch = matches.find(m => new Date(m.date) >= new Date());
    const otherMatches = matches.filter(m => m.id !== nextMatch?.id);

    return (
        <div className="animate-fade-in match-page-refined">
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Decrypting tactical transmissions...</p>
                </div>
            ) : (
                <div className="match-layout-v2">
                    {/* Left Panel: Match Feed */}
                    <div className="match-feed-column">
                        <div className="section-title-fancy">
                            <Activity size={20} color="var(--dash-primary)" />
                            <h2>Tactical Feed</h2>
                            <div className="dot-line"></div>
                        </div>

                        {nextMatch && (
                            <div className="hero-match-card-wrapper">
                                <span className="feed-category">ACTIVE BRIEFING</span>
                                <div
                                    className={`hero-match-card ${selectedMatch?.id === nextMatch.id ? 'active' : ''}`}
                                    onClick={() => setSelectedMatch(nextMatch)}
                                >
                                    <div className="hero-bg-accent"></div>
                                    <div className="hero-date">
                                        <div className="day">{new Date(nextMatch.date).getDate()}</div>
                                        <div className="month">{new Date(nextMatch.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                                    </div>
                                    <div className="hero-content">
                                        <div className="hero-status">
                                            <span className="live-dot"></span> UPCOMING MISSION
                                        </div>
                                        <h2 className="hero-opponent">VS {nextMatch.opponent}</h2>
                                        <div className="hero-meta">
                                            <span><MapPin size={14} /> {nextMatch.location}</span>
                                            <span><Clock size={14} /> {formatTime(nextMatch.date)}</span>
                                        </div>
                                    </div>
                                    {nextMatch.is_starter && <div className="hero-role-badge">STARTING V</div>}
                                </div>
                            </div>
                        )}

                        <div className="history-section">
                            <span className="feed-category">MATCH RECORDS</span>
                            <div className="transmissions-list">
                                {otherMatches.map((match) => (
                                    <div
                                        key={match.id}
                                        className={`transmission-card-v2 ${selectedMatch?.id === match.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedMatch(match)}
                                    >
                                        <div className="card-accent"></div>
                                        <div className="card-main">
                                            <div className="card-date-v2">
                                                <span className="d">{new Date(match.date).getDate()}</span>
                                                <span className="m">{new Date(match.date).toLocaleString('default', { month: 'short' })}</span>
                                            </div>
                                            <div className="card-info-v2">
                                                <h4>{match.opponent}</h4>
                                                <p>{match.location.split(',')[0]}</p>
                                            </div>
                                            {match.score && match.score !== '-' && (
                                                <div className="card-score-v2">{match.score}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Detailed Briefing */}
                    <div className="briefing-detail-column">
                        {selectedMatch ? (
                            <div className="briefing-container-v2 animate-slide-up">
                                <div className="briefing-banner">
                                    <Shield size={32} />
                                    <div className="banner-text">
                                        <h3>MISSION BRIEFING</h3>
                                        <p>VS {selectedMatch.opponent} • {formatDate(selectedMatch.date)}</p>
                                    </div>
                                </div>

                                <div className="briefing-core">
                                    {/* Lineup Section */}
                                    <div className="briefing-subgrid">
                                        <div className="lineup-display-v2">
                                            <div className="lineup-header">
                                                <Users size={18} />
                                                <h4>OFFICIAL LINEUP</h4>
                                            </div>

                                            <div className="starters-scroll-v2">
                                                <span className="subheader-v2">STARTING FIVE</span>
                                                <div className="starters-grid-v2">
                                                    {(selectedMatch.starterDetails || Array(5).fill({})).map((player, idx) => (
                                                        <div key={player.id || idx} className="starter-pill-v2">
                                                            <div className="pill-photo">
                                                                <img src={player.photo_url || "/assets/players/default.png"} alt="" />
                                                            </div>
                                                            <div className="pill-info">
                                                                <span className="name">{player.name ? player.name.split(' ')[0] : 'TBD'}</span>
                                                                <span className="pos">POS {idx + 1}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bench-list-v2">
                                                <span className="subheader-v2">SQUAD ROTATION</span>
                                                <div className="bench-tags-v2">
                                                    {selectedMatch.benchDetails?.map(player => (
                                                        <div key={player.id} className="bench-tag-v2">
                                                            <span className="no">#{player.jersey_number}</span>
                                                            <span className="nm">{player.name.split(' ')[0]}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Systems Section */}
                                        <div className="tactical-package-v2">
                                            <div className="lineup-header">
                                                <Layout size={18} />
                                                <h4>TECHNICAL SYSTEMS</h4>
                                            </div>
                                            <div className="systems-feed-v2">
                                                {selectedMatch.strategies?.length > 0 ? (
                                                    selectedMatch.strategies.map(strat => (
                                                        <div key={strat.id} className="strat-card-v2" onClick={() => setSelectedTactic(strat)} style={{ position: 'relative', overflow: 'hidden' }}>
                                                            <div className="strat-card-info" style={{ position: 'relative', zIndex: 2 }}>
                                                                <h5>{strat.name}</h5>
                                                                <span>{strat.type?.toUpperCase()} COURT SYSTEM</span>
                                                            </div>
                                                            <MiniCourtPreview tactic={strat} />
                                                            <div className="study-btn-v2" style={{ position: 'relative', zIndex: 2 }}>
                                                                <Play size={12} fill="currentColor" />
                                                                STUDY
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="no-systems-v2">
                                                        No tactical systems attached to this briefing.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="briefing-footer-v2">
                                        <button className="confirm-btn-v2">
                                            <Trophy size={18} />
                                            CONFIRM RECEIPT & SYNC
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="briefing-empty-v2">
                                <Activity size={60} />
                                <h3>SELECT MISSION</h3>
                                <p>Choose a match from the feed to view full tactical briefing.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tactical Viewer Modal */}
            {selectedTactic && createPortal(
                <div className="tactical-modal-overlay animate-fade-in">
                    <div className="tactical-modal-content">
                        <div className="modal-header-v2">
                            <div className="modal-title-v2">
                                <h2>{selectedTactic.name}</h2>
                                <span>{selectedTactic.type === 'full' ? 'FULL COURT' : 'HALF COURT'} SYSTEM ANALYSIS</span>
                            </div>
                            <button className="close-modal-v2" onClick={() => setSelectedTactic(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body-v2">
                            <div style={{ width: '100%', maxWidth: '850px' }}>
                                <ReadOnlyCourt
                                    frames={typeof selectedTactic.data === 'string' ? JSON.parse(selectedTactic.data) : (selectedTactic.data || [])}
                                    type={selectedTactic.type}
                                    players={selectedMatch.starterDetails}
                                />
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Match;
