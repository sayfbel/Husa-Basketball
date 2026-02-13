import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shield,
    Clock,
    Target,
    Maximize2,
    X,
    Layout,
    ChevronRight
} from 'lucide-react';
import { createPortal } from 'react-dom';

const MiniCourtPreview = ({ tactic }) => {
    const firstFrame = tactic.data?.[0] || { tokens: [], paths: [] };
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

const ReadOnlyCourt = ({ frames, type = 'full' }) => {
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
                {/* SVG Court Background */}
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

                {/* Paths Layer */}
                <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    {currentFrame.paths?.map((d, i) => (
                        <path key={i} d={d} stroke="#fcd34d" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
                    ))}
                </svg>

                {/* Tokens Layer */}
                {currentFrame.tokens?.map((token, idx) => (
                    <div
                        key={idx}
                        className={`player-token ${token.type === 'offense' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`}
                        style={{
                            position: 'absolute',
                            top: `${token.y}%`,
                            left: `${token.x}%`,
                            width: token.type === 'ball' ? '30px' : '40px',
                            height: token.type === 'ball' ? '30px' : '40px',
                            transform: 'translate(-50%, -50%)',
                            transition: isPlaying ? 'all 800ms ease' : 'all 300ms ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                            zIndex: token.type === 'ball' ? 5 : 2
                        }}
                    >
                        {token.label}
                    </div>
                ))}
            </div>

            {/* Playback Controls */}
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

const Tactics = () => {
    const [tactics, setTactics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTactic, setSelectedTactic] = useState(null);

    useEffect(() => {
        fetchTactics();
    }, []);

    const fetchTactics = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/strategies');
            setTactics(res.data);
        } catch (err) {
            console.error("Error fetching tactics:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in report-page-refined">
            <div className="section-title-fancy" style={{ marginBottom: '3rem' }}>
                <Target size={24} color="var(--dash-primary)" />
                <h2>Tactical Playbook</h2>
                <div className="dot-line"></div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Accessing the tactical vault...</p>
                </div>
            ) : (
                <div className="tactics-grid-v2">
                    {tactics.map(tactic => (
                        <div
                            key={tactic.id}
                            className="tactic-system-card-v2"
                            onClick={() => setSelectedTactic(tactic)}
                        >
                            <div className="tactic-content-left">
                                <h3 className="tactic-title-v2">{tactic.name}</h3>
                                <div className="click-to-load">
                                    CLICK TO LOAD
                                    <ChevronRight size={14} />
                                </div>
                            </div>

                            <div className="tactic-preview-right">
                                <MiniCourtPreview tactic={tactic} />
                            </div>

                            <div className="tactic-type-tag">
                                {tactic.type === 'full' ? 'Full Court' : 'Half Set'}
                            </div>

                            <div className="tactic-action-corner">
                                <div className="mini-action-btn">
                                    <Maximize2 size={18} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {tactics.length === 0 && (
                        <div className="empty-feed-v2" style={{ gridColumn: '1 / -1' }}>
                            <Shield size={48} />
                            <h3>Tactical Vault Empty</h3>
                            <p>Your coach hasn't archived any systems yet. Check back after the next briefing.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tactical Viewer Modal */}
            {selectedTactic && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 99999, display: 'flex', flexDirection: 'column' }} className="animate-fade-in">
                    <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{selectedTactic.name}</h1>
                                <span style={{ background: 'rgba(219, 10, 64, 0.1)', color: 'var(--dash-primary)', padding: '4px 12px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' }}>
                                    {selectedTactic.type === 'full' ? 'FULL COURT SYSTEM' : 'HALF COURT SET'}
                                </span>
                            </div>
                            <p style={{ color: '#888', marginTop: '5px' }}>Analyze the movements and positioning for this system.</p>
                        </div>
                        <button
                            onClick={() => setSelectedTactic(null)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ flex: 1, padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '1100px' }}>
                            <ReadOnlyCourt frames={selectedTactic.data} type={selectedTactic.type} />
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};

export default Tactics;
