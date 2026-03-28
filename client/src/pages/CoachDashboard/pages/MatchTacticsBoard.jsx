import React, { useState, useEffect, useRef } from 'react';
import { 
    Move, Pencil, Eraser, SkipBack, Play, SkipForward, 
    Pause, Plus, Undo2, RotateCcw, X, FolderOpen, 
    Activity, Shield, Users, Target, Star
} from 'lucide-react';
import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';
import { useCourtDrag } from '../hooks/useCourtDrag';
import '../css/strategy.css';

const MiniCourtPreview = ({ tactic }) => {
    const firstFrame = tactic.data?.[0] || { tokens: [], paths: [] };
    const type = tactic.type || 'full';
    const viewBoxH = type === 'full' ? 560 : 470;
    const viewBoxW = type === 'full' ? 1000 : 500;

    return (
        <div className="mini-court-preview">
            <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                <defs>
                    <filter id="premium-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="15" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <radialGradient id="token-radial" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#DB0A40" />
                        <stop offset="100%" stopColor="#7a0624" />
                    </radialGradient>
                </defs>

                <rect width={viewBoxW} height={viewBoxH} fill="#0a0a0a" />

                <image
                    href={husaLogo}
                    x={viewBoxW / 2 - 180}
                    y={viewBoxH / 2 - 180}
                    width="360"
                    height="360"
                    opacity="0.05"
                    style={{ filter: 'grayscale(1) brightness(0.3)' }}
                />

                <rect width={viewBoxW} height={viewBoxH} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                {type === 'full' ? (
                    <>
                        <line x1="500" y1="0" x2="500" y2="560" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <circle cx="500" cy="280" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <rect x="0" y="205" width="190" height="150" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <rect x="810" y="205" width="190" height="150" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <g stroke="#DB0A40" strokeWidth="3" fill="none" opacity="0.15">
                            <line x1="190" y1="205" x2="190" y2="355" />
                            <path d="M 190,205 A 75,75 0 0 1 190,355" />
                            <line x1="810" y1="205" x2="810" y2="355" />
                            <path d="M 810,205 A 75,75 0 0 0 810,355" />
                        </g>
                        <path d="M 0 450 Q 300 280 0 110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <path d="M 1000 450 Q 700 280 1000 110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        
                        {/* Rims for Mini Preview */}
                        <g stroke="#DB0A40" strokeWidth="3" fill="none" opacity="0.2">
                            <line x1="25" y1="250" x2="25" y2="310" />
                            <circle cx="45" cy="280" r="10" />
                            <line x1="975" y1="250" x2="975" y2="310" />
                            <circle cx="955" cy="280" r="10" />
                        </g>
                    </>
                ) : (
                    <>
                        <path d="M 0 350 Q 250 205 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <rect x="0" y="150" width="160" height="100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <g stroke="#DB0A40" strokeWidth="3" fill="none" opacity="0.2">
                            <line x1="15" y1="180" x2="15" y2="220" />
                            <circle cx="35" cy="200" r="8" />
                        </g>
                    </>
                )}

                {firstFrame.tokens?.map((token, idx) => (
                    <g key={idx}>
                        {token.type === 'offense' || token.type === 'player' ? (
                            <>
                                <circle
                                    cx={`${token.x * (viewBoxW / 100)}`}
                                    cy={`${token.y * (viewBoxH / 100)}`}
                                    r="28"
                                    fill="none"
                                    stroke="#DB0A40"
                                    strokeWidth="2"
                                    opacity="0.5"
                                    filter="url(#premium-glow)"
                                />
                                <circle
                                    cx={`${token.x * (viewBoxW / 100)}`}
                                    cy={`${token.y * (viewBoxH / 100)}`}
                                    r="14"
                                    fill="url(#token-radial)"
                                    filter="url(#premium-glow)"
                                />
                                <circle
                                    cx={`${token.x * (viewBoxW / 100)}`}
                                    cy={`${token.y * (viewBoxH / 100)}`}
                                    r="8"
                                    fill="#000"
                                    opacity="0.1"
                                />
                            </>
                        ) : (
                            <circle
                                cx={`${token.x * (viewBoxW / 100)}`}
                                cy={`${token.y * (viewBoxH / 100)}`}
                                r="12"
                                fill="#222"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="1"
                            />
                        )}
                    </g>
                ))}

                {firstFrame.paths?.map((d, idx) => (
                    <path key={idx} d={d} fill="none" stroke="#DB0A40" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
                ))}
            </svg>
            <div className="preview-gradient-overlay" />
        </div>
    );
};

const MatchTacticsBoard = ({ summonedPlayers, starters, strategies, showNotification, fetchStrategies, onStrategyLoaded }) => {

    const [frames, setFrames] = useState([{ tokens: [], paths: [] }]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [mode, setMode] = useState('move'); // 'move', 'draw', 'erase'
    const [isPlaying, setIsPlaying] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedStrategyId, setSelectedStrategyId] = useState(null);
    const [pendingSubstitute, setPendingSubstitute] = useState(null);
    const [currentPath, setCurrentPath] = useState('');

    const courtRef = useRef(null);
    const playInterval = useRef(null);

    const viewBox = { w: 1000, h: 560 }; 

    const currentFrame = frames[currentFrameIndex] || frames[0] || { tokens: [], paths: [] };
    const currentTokens = currentFrame.tokens || [];
    const currentPaths = currentFrame.paths || [];

    const updateCurrentFrame = (newTokens, newPaths) => {
        setFrames(prev => prev.map((f, i) =>
            i === currentFrameIndex ? { tokens: newTokens || f.tokens, paths: newPaths || f.paths } : f
        ));
    };

    const pushToHistory = () => {
        const framesClone = JSON.parse(JSON.stringify(frames));
        setHistory(prev => [...prev.slice(-19), framesClone]);
    };

    const { draggingId, handleMouseDown: onTokenMouseDown, clampPosition } = useCourtDrag({
        courtRef,
        tokens: currentTokens,
        onUpdate: (newTokens) => updateCurrentFrame(newTokens, null),
        mode,
        viewBox,
        onHistoryPush: pushToHistory
    });

    useEffect(() => {
        if (courtRef.current && currentTokens.length > 0) {
            const clampedTokens = currentTokens.map(t => {
                const pos = clampPosition(t.x, t.y, t.type);
                return { ...t, x: pos.x, y: pos.y };
            });
            updateCurrentFrame(clampedTokens, null);
        }
    }, [courtRef.current]);

    const handleUndo = () => {
        if (history.length === 0) return;
        const lastState = history[history.length - 1];
        setFrames(lastState);
        setHistory(prev => prev.slice(0, -1));
        if (currentFrameIndex >= lastState.length) setCurrentFrameIndex(lastState.length - 1);
        showNotification("Action undone", "info");
    };

    const handleReset = () => {
        pushToHistory();
        setFrames([{ tokens: [], paths: [] }]);
        setCurrentFrameIndex(0);
        setSelectedStrategyId(null);
        showNotification("Board Reset", "info");
    };

    const isPlayerOnCourt = (playerId) => currentTokens.some(t => t.playerId === playerId);

    const handleAddPlayer = (player) => {
        if (isPlayerOnCourt(player.id)) return;
        const playerTokens = currentTokens.filter(t => t.type === 'player');

        if (playerTokens.length >= 5) {
            setPendingSubstitute({ newPlayer: player });
            showNotification(`Select a player on court to replace with ${player.name}`, 'info');
            return;
        }

        pushToHistory();
        const pos = clampPosition(50, 50, 'player');
        const newToken = {
            id: `token-${Date.now()}`,
            playerId: player.id,
            name: player.name,
            number: player.jersey_number,
            photo: player.photo_url,
            type: 'player',
            x: pos.x,
            y: pos.y
        };
        updateCurrentFrame([...currentTokens, newToken], null);
    };

    const handleAddBall = () => {
        if (currentTokens.some(t => t.type === 'ball')) return;
        pushToHistory();
        const pos = clampPosition(50, 50, 'ball');
        const newToken = { id: `ball-${Date.now()}`, type: 'ball', label: '🏀', x: pos.x, y: pos.y };
        updateCurrentFrame([...currentTokens, newToken], null);
    };

    const handleAddDefense = (num) => {
        const label = `D${num}`;
        if (currentTokens.some(t => t.type === 'defense' && t.label === label)) return;
        pushToHistory();
        const pos = clampPosition(50, 50, 'defense');
        const newToken = { id: `def-${Date.now()}-${num}`, type: 'defense', label: label, x: pos.x, y: pos.y };
        updateCurrentFrame([...currentTokens, newToken], null);
    };

    const removeToken = (id) => {
        pushToHistory();
        updateCurrentFrame(currentTokens.filter(t => t.id !== id), null);
    };

    const handleTokenMouseDown = (e, token) => {
        if (mode === 'erase') {
            removeToken(token.id);
            return;
        }
        if (pendingSubstitute && token.type === 'player') {
            const newTokens = currentTokens.map(t => 
                t.id === token.id ? { 
                    ...t, 
                    playerId: pendingSubstitute.newPlayer.id, 
                    name: pendingSubstitute.newPlayer.name,
                    number: pendingSubstitute.newPlayer.jersey_number,
                    photo: pendingSubstitute.newPlayer.photo_url
                } : t
            );
            updateCurrentFrame(newTokens, null);
            setPendingSubstitute(null);
            showNotification("Substitution complete", "success");
            return;
        }
        onTokenMouseDown(e, token);
    };

    const loadStrategy = (originalStrategy) => {
        if (!originalStrategy.data || originalStrategy.data.length === 0) return;
        setSelectedStrategyId(originalStrategy.id);
        const newFrames = originalStrategy.data.map(frame => {
            const newTokens = (frame.tokens || []).map(t => {
                const posX = t.x;
                const posY = t.y;
                if (t.type === 'offense') {
                    const label = parseInt(t.label);
                    const starterId = starters[label - 1];
                    const player = summonedPlayers.find(p => p.id === starterId);
                    if (player) {
                        const pos = clampPosition(posX, posY, 'player');
                        return { id: `token-${t.id}-mapped`, playerId: player.id, name: player.name, number: player.jersey_number, photo: player.photo_url, type: 'player', x: pos.x, y: pos.y, label: t.label };
                    }
                    const pos = clampPosition(posX, posY, t.type);
                    return { ...t, x: pos.x, y: pos.y };
                }
                const pos = clampPosition(posX, posY, t.type);
                return { ...t, id: t.type === 'ball' ? `ball-${Date.now()}-${t.id}` : t.id, x: pos.x, y: pos.y };
            });
            return { tokens: newTokens, paths: frame.paths || [] };
        });
        setFrames(newFrames);
        setCurrentFrameIndex(0);
        if (onStrategyLoaded) onStrategyLoaded(originalStrategy.id);
        showNotification(`System deployed: ${originalStrategy.name}`, "success");
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    useEffect(() => {
        if (isPlaying) {
            playInterval.current = setInterval(() => {
                setCurrentFrameIndex(prev => (prev + 1) % frames.length);
            }, 1000);
        } else {
            clearInterval(playInterval.current);
        }
        return () => clearInterval(playInterval.current);
    }, [isPlaying, frames.length]);

    const addFrame = () => {
        pushToHistory();
        const newFrame = JSON.parse(JSON.stringify(currentFrame));
        const newFrames = [...frames];
        newFrames.splice(currentFrameIndex + 1, 0, newFrame);
        setFrames(newFrames);
        setCurrentFrameIndex(currentFrameIndex + 1);
    };

    const deleteFrame = () => {
        if (frames.length <= 1) return;
        pushToHistory();
        const newFrames = frames.filter((_, i) => i !== currentFrameIndex);
        setFrames(newFrames);
        setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1));
    };

    const handleBoardMouseDown = (e) => {
        if (mode === 'move') return;
        const rect = courtRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 1000;
        const y = ((e.clientY - rect.top) / rect.height) * 560;
        if (mode === 'draw') {
            pushToHistory();
            setCurrentPath(`M ${x} ${y}`);
        }
    };

    const handleBoardMouseMove = (e) => {
        if (mode === 'draw' && currentPath) {
            const rect = courtRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 1000;
            const y = ((e.clientY - rect.top) / rect.height) * 560;
            setCurrentPath(prev => `${prev} L ${x} ${y}`);
        }
    };

    const handleBoardMouseUp = () => {
        if (mode === 'draw' && currentPath) {
            updateCurrentFrame(null, [...currentPaths, currentPath]);
            setCurrentPath('');
        }
    };

    const handlePathClick = (index, e) => {
        if (mode === 'erase') {
            e.stopPropagation();
            pushToHistory();
            updateCurrentFrame(null, currentPaths.filter((_, i) => i !== index));
        }
    };

    return (
        <div id="workspace-match" className="intel-card" style={{ width: '100%', padding: '0', borderRadius: '0', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', background: '#050505', display: 'flex', flexDirection: 'column' }}>
            
            {/* Strategy Selection - Premium Card Row (Kept as requested) */}
            <div style={{ padding: '2rem 1.5rem', background: '#080808', borderBottom: '1px solid rgba(255,255,255,0.03)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '3px', height: '14px', background: '#DB0A40' }}></div>
                    <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: '950', letterSpacing: '4px', opacity: 0.6 }}>STRATEGIC_REGISTRY</span>
                </div>
                
                <div style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', paddingBottom: '15px', paddingTop: '5px' }} className="full-custom-scroll">
                    {strategies.map(s => (
                        <div 
                            key={s.id} 
                            onClick={() => loadStrategy(s)}
                            className="tactic-item-premium"
                            style={{ 
                                minWidth: '260px',
                                height: '140px',
                                background: selectedStrategyId === s.id ? 'rgba(219, 10, 64, 0.1)' : '#0a0a0a', 
                                borderColor: selectedStrategyId === s.id ? '#DB0A40' : 'rgba(255,255,255,0.05)',
                                padding: '1.5rem',
                                transform: selectedStrategyId === s.id ? 'translateY(-4px)' : 'none'
                            }}
                        >
                            <div className="tactic-header-premium" style={{ marginBottom: '1rem' }}>
                                <h4 className="tactic-name-label" style={{ fontSize: '1rem' }}>{s.name}</h4>
                                <span className="tactic-action-hint" style={{ color: selectedStrategyId === s.id ? '#DB0A40' : 'var(--dash-primary)' }}>
                                    {selectedStrategyId === s.id ? 'UPLINK_ACTIVE' : 'READY TO DEPLOY'}
                                </span>
                            </div>
                            <MiniCourtPreview tactic={s} />
                        </div>
                    ))}
                </div>

            </div>


            <div className="court-and-sidebar-grid-premium" style={{ display: 'flex', position: 'relative', overflow: 'hidden', background: '#080808' }}>
                {/* PERSONNEL SideBar (Image Only as requested) */}
                <aside className="active-players-sidebar full-custom-scroll" style={{ 
                    width: '100px', 
                    background: '#050505', 
                    borderRight: '1px solid rgba(219, 10, 64, 0.3)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%', 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    zIndex: 10,
                    boxShadow: '10px 0 30px rgba(0,0,0,0.5)',
                    overflowX: 'hidden'
                }}>
                    <div style={{ 
                        height: '60px',
                        padding: '0 0.5rem', 
                        borderBottom: '1px solid rgba(255,255,255,0.03)', 
                        background: 'linear-gradient(180deg, rgba(219, 10, 64, 0.1) 0%, transparent 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                    }}>
                        <Users size={14} color="#DB0A40" />
                        <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: '950', letterSpacing: '2px', textAlign: 'center', opacity: 0.8 }}>SQUAD_OPS</span>
                    </div>

                    <div className="active-players-list-premium full-custom-scroll" style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '22px', 
                        padding: '1.5rem 0', 
                        overflowY: 'auto' 
                    }}>
                        {summonedPlayers.map(player => {
                            const onCourt = isPlayerOnCourt(player.id);
                            return (
                                <div 
                                    key={player.id} 
                                    onClick={() => !onCourt && handleAddPlayer(player)}
                                    className="sidebar-player-unit"
                                    style={{ 
                                        opacity: onCourt ? 0.4 : 1, 
                                        cursor: onCourt ? 'default' : 'pointer', 
                                        width: '62px', 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        position: 'relative',
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!onCourt) {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.querySelector('.token-photo').style.borderColor = '#DB0A40';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!onCourt) {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.querySelector('.token-photo').style.borderColor = 'rgba(255,255,255,0.1)';
                                        }
                                    }}
                                >
                                    <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                                        <div className="token-photo" style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            borderRadius: '50%', 
                                            border: onCourt ? '2px solid #DB0A40' : '2px solid rgba(255,255,255,0.1)', 
                                            overflow: 'hidden',
                                            background: '#111',
                                            boxShadow: onCourt ? '0 0 15px rgba(219, 10, 64, 0.3)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <img src={player.photo_url || "/assets/players/default.png"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                                        </div>
                                        
                                        {/* Jersey Number Badge */}
                                        <div style={{ 
                                            position: 'absolute', 
                                            bottom: '-2px', 
                                            right: '-2px', 
                                            background: onCourt ? '#DB0A40' : '#111', 
                                            color: '#fff', 
                                            fontSize: '8px', 
                                            fontWeight: '900', 
                                            padding: '1px 4px', 
                                            borderRadius: '2px',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            zIndex: 2,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                                        }}>
                                            {player.jersey_number}
                                        </div>

                                        {onCourt && (
                                            <div style={{ 
                                                position: 'absolute', 
                                                top: '0', 
                                                right: '0', 
                                                background: '#4cd137', 
                                                width: '9px', 
                                                height: '9px', 
                                                borderRadius: '50%',
                                                boxShadow: '0 0 10px #4cd137',
                                                zIndex: 3,
                                                border: '2px solid #050505'
                                            }}></div>
                                        )}
                                    </div>
                                    
                                    {/* Name Label Below - Safe from Scroll */}
                                    <div style={{
                                        width: '100%',
                                        marginTop: '6px',
                                        textAlign: 'center',
                                        fontSize: '9px',
                                        color: onCourt ? '#DB0A40' : '#888',
                                        fontWeight: '700',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {player.name.split(' ')[0]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Right Main Unit - Defines the height */}
                <div className="tactical-workspace-right-unit" style={{ flex: 1, background: '#0a0a0a', paddingLeft: '100px', display: 'flex', flexDirection: 'column' }}>
                    <div className="strategy-bench-premium" style={{ height: '60px', padding: '0 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                        <div className="bench-group-premium" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div 
                                onClick={handleAddBall} 
                                style={{ 
                                    width: '38px', 
                                    height: '38px', 
                                    background: 'radial-gradient(circle at 35% 35%, #e67e22, #d35400)', 
                                    borderRadius: '50%', 
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 10px rgba(230, 126, 34, 0.3)',
                                    border: '1px solid rgba(0,0,0,0.2)'
                                }}
                            >
                                <div className="ball-seam-curves"></div>
                            </div>
                            
                            <div className="bench-separator-premium"></div>
                            
                            {[1, 2, 3, 4, 5].map(n => (
                                <div 
                                    key={n} 
                                    onClick={() => handleAddDefense(n)} 
                                    className="bench-token-premium" 
                                    style={{ 
                                        width: '34px', 
                                        height: '34px', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        background: '#111', 
                                        color: '#666', 
                                        fontSize: '0.7rem', 
                                        fontWeight: '950',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.background = '#222';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.color = '#666';
                                        e.currentTarget.style.background = '#111';
                                    }}
                                >
                                    D{n}
                                </div>
                            ))}

                            <div className="bench-separator-premium"></div>
                            <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.55rem', color: '#DB0A40', fontWeight: '950', letterSpacing: '2px', opacity: 0.8 }}>SIDEBAR</span>
                                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '950', letterSpacing: '1px', textTransform: 'uppercase' }}>TOOLS</span>
                            </div>
                        </div>
                    </div>
                    <div 
                        className={`court-board interactive-board ${draggingId ? 'is-dragging' : ''}`}
                        ref={courtRef}
                        onMouseDown={handleBoardMouseDown}
                        onMouseMove={handleBoardMouseMove}
                        onMouseUp={handleBoardMouseUp}
                        style={{
                            width: '100%',
                            aspectRatio: '1000 / 560',
                            background: '#0a0a0a',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <svg viewBox="0 0 1000 560" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                            <image href={husaLogo} x="420" y="205" width="160" height="150" opacity="0.03" style={{ filter: 'grayscale(1)' }} />
                            <g stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" fill="none">
                                <rect x="25" y="25" width="950" height="510" />
                                <line x1="500" y1="25" x2="500" y2="535" />
                                <circle cx="500" cy="280" r="70" />
                                <path d="M 25,80 L 240,80 A 250,250 0 0 1 240,480 L 25,480" />
                                <path d="M 975,80 L 760,80 A 250,250 0 0 0 760,480 L 975,480" />
                                <rect x="25" y="205" width="190" height="150" />
                                <rect x="785" y="205" width="190" height="150" />
                                <g stroke="#DB0A40" opacity="0.2">
                                    <line x1="215" y1="205" x2="215" y2="355" />
                                    <path d="M 215,205 A 75,75 0 0 1 215,355" />
                                    <line x1="785" y1="205" x2="785" y2="355" />
                                    <path d="M 785,205 A 75,75 0 0 0 785,355" />
                                </g>

                                {/* Rims and Backboards */}
                                <g stroke="#DB0A40" strokeWidth="2" opacity="0.3">
                                    {/* Left Rim */}
                                    <line x1="45" y1="250" x2="45" y2="310" />
                                    <line x1="45" y1="280" x2="55" y2="280" />
                                    <circle cx="67" cy="280" r="12" />

                                    {/* Right Rim */}
                                    <line x1="955" y1="250" x2="955" y2="310" />
                                    <line x1="955" y1="280" x2="945" y2="280" />
                                    <circle cx="933" cy="280" r="12" />
                                </g>
                            </g>
                        </svg>

                        {/* Tokens */}
                        {currentTokens.map(token => {
                            const isBeingDragged = draggingId === token.id;
                            return (
                                <div
                                    key={token.id}
                                    className={`player-token ${token.type === 'player' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`}
                                    onContextMenu={(e) => { e.preventDefault(); removeToken(token.id); }}
                                    style={{
                                        top: `${token.y}%`,
                                        left: `${token.x}%`,
                                        width: token.type === 'ball' ? '3.5%' : '5.5%',
                                        aspectRatio: '1 / 1',
                                        height: 'auto',
                                        cursor: mode === 'move' ? (isBeingDragged ? 'grabbing' : 'grab') : 'default',
                                        zIndex: isBeingDragged ? 100 : 10,
                                        pointerEvents: mode === 'move' ? 'auto' : 'none',
                                        transform: 'translate(-50%, -50%)',
                                        transition: isBeingDragged ? 'none' : (isPlaying ? 'all 1000ms linear' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'),
                                        boxShadow: isBeingDragged ? '0 15px 40px rgba(0,0,0,0.5)' : 'none'
                                    }}
                                    onMouseDown={(e) => handleTokenMouseDown(e, token)}
                                >
                                    {token.type === 'ball' ? (
                                        <div style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            background: 'radial-gradient(circle at 35% 35%, #e67e22, #d35400)', 
                                            borderRadius: '50%', 
                                            position: 'relative', 
                                            overflow: 'hidden',
                                            border: '1px solid rgba(0,0,0,0.2)',
                                            boxShadow: '0 4px 15px rgba(230, 126, 34, 0.4), inset 0 0 10px rgba(0,0,0,0.1)'
                                        }}>
                                            <div className="ball-seam-curves"></div>
                                        </div>
                                    ) : (
                                        token.type === 'player' ? (
                                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.8)', overflow: 'hidden', background: '#000', position: 'relative' }}>
                                                <img src={token.photo || "/assets/players/default.png"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(219,10,64,0.9)', color: '#fff', fontSize: '9px', textAlign: 'center', fontWeight: '900', padding: '1px 0' }}>#{token.number}</div>
                                            </div>
                                        ) : (
                                            <div style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                borderRadius: '6px', 
                                                border: '2px solid rgba(255,255,255,0.2)', 
                                                background: 'linear-gradient(135deg, #222 0%, #000 100%)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                color: '#fff', 
                                                fontSize: '0.94rem', 
                                                fontWeight: '950',
                                                fontFamily: 'Orbitron, sans-serif',
                                                boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)'
                                            }}>
                                                {token.label}
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Original Toolbar Style */}
            <div className="tactic-toolbar-premium" style={{ background: '#111', height: '60px', padding: '0 2rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className={`tool-btn-premium ${mode === 'move' ? 'active' : ''}`} onClick={() => setMode('move')}><Move size={20} /></button>
                    <button className="tool-btn-premium" onClick={handleUndo}><Undo2 size={20} /></button>
                    <button className={`tool-btn-premium ${mode === 'draw' ? 'active' : ''}`} onClick={() => setMode('draw')}><Pencil size={20} /></button>
                    <button className={`tool-btn-premium ${mode === 'erase' ? 'active' : ''}`} onClick={() => setMode('erase')}><Eraser size={20} /></button>
                    <button className="tool-btn-premium" onClick={handleReset}><RotateCcw size={20} /></button>
                </div>
                <div className="bench-separator-premium"></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="tool-btn-premium" onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}><SkipBack size={20} /></button>
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '900', minWidth: '40px', textAlign: 'center' }}>{currentFrameIndex + 1} / {frames.length}</span>
                    <button className="tool-btn-premium" onClick={togglePlay} >{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
                    <button className="tool-btn-premium" onClick={addFrame}><Plus size={20} /></button>
                    <button className="tool-btn-premium" onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}><SkipForward size={20} /></button>
                </div>
            </div>
        </div>
    );
};

export default MatchTacticsBoard;
