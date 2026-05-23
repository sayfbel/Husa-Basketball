import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import {
    Move, Pencil, Eraser, Play, Pause, SkipBack, 
    SkipForward, Plus, Trash2, Save, X, Undo2, 
    RotateCcw, Repeat
} from 'lucide-react';
import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';
import { useCourtDrag } from '../hooks/useCourtDrag';
import '../css/strategy.css';

const particlesDots = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    cx: `${Math.random() * 100}%`,
    cy: `${Math.random() * 100}%`,
    r: Math.random() * 1.5 + 0.5,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * -20
}));

const ParticlesOverlay = () => (
    <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particlesDots.map(dot => (
            <circle
                key={dot.id}
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
                fill="rgba(255, 255, 255, 0.2)"
                style={{
                    animation: `float-particles ${dot.duration}s infinite linear`,
                    animationDelay: `${dot.delay}s`
                }}
            />
        ))}
        <style>{`
            @keyframes float-particles {
                0% { transform: translateY(0px) translateX(0px); opacity: 0; }
                10% { opacity: 0.8; }
                90% { opacity: 0.8; }
                100% { transform: translateY(-60px) translateX(20px); opacity: 0; }
            }
        `}</style>
    </svg>
);

const TacticalWorkspace = ({ title, type = 'full', showNotification, showConfirm, savedTactics, fetchTactics }) => {
    const { currentUser } = useAuth();
    const [mode, setMode] = useState('move'); // 'move' | 'draw' | 'erase'
    const [frames, setFrames] = useState([{ tokens: [], paths: [] }]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [history, setHistory] = useState([]);
    const [tacticName, setTacticName] = useState(title || '');
    const [isSaving, setIsSaving] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const [showSaveModal, setShowSaveModal] = useState(false);

    const courtRef = useRef(null);
    const playInterval = useRef(null);

    const viewBox = type === 'full' ? { w: 1000, h: 560 } : { w: 500, h: 470 };

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

    // Initial clamping on mount
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
        showNotification("Board Reset", "info");
    };

    const removeToken = (id) => {
        pushToHistory();
        updateCurrentFrame(currentTokens.filter(t => t.id !== id), null);
    };

    const handleAddToken = (type, label) => {
        if (currentTokens.some(t => t.type === type && t.label === label)) return;
        pushToHistory();
        const startX = 50;
        const startY = 50;
        const pos = clampPosition(startX, startY, type);
        const newToken = { id: `token-${Date.now()}-${label}`, type, label, x: pos.x, y: pos.y };
        updateCurrentFrame([...currentTokens, newToken], null);
    };

    const isTokenActive = (type, label) => currentTokens.some(t => t.type === type && t.label === label);

    const handleBenchTokenMouseDown = (e, type, label) => {
        e.preventDefault();
        handleAddToken(type, label);
    };

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

    const togglePlay = () => setIsPlaying(!isPlaying);

    useEffect(() => {
        if (isPlaying) {
            playInterval.current = setInterval(() => {
                setCurrentFrameIndex(prev => (prev + 1) % frames.length);
            }, 1000 / playbackSpeed);
        } else {
            clearInterval(playInterval.current);
        }
        return () => clearInterval(playInterval.current);
    }, [isPlaying, frames.length, playbackSpeed]);

    // Listen for load events from Registry
    useEffect(() => {
        const handleLoad = (e) => {
            if (e.detail && e.detail.data) {
                setFrames(e.detail.data);
                setCurrentFrameIndex(0);
                setIsPlaying(false);
            }
        };

        window.addEventListener(`load-tactic-${type}`, handleLoad);
        return () => window.removeEventListener(`load-tactic-${type}`, handleLoad);
    }, [type]);

    const handleBoardMouseDown = (e) => {
        if (mode === 'move') return;
        const rect = courtRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * viewBox.w;
        const y = ((e.clientY - rect.top) / rect.height) * viewBox.h;
        if (mode === 'draw') {
            pushToHistory();
            setCurrentPath(`M ${x} ${y}`);
        }
    };

    const handleBoardMouseMove = (e) => {
        if (mode === 'draw' && currentPath) {
            const rect = courtRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * viewBox.w;
            const y = ((e.clientY - rect.top) / rect.height) * viewBox.h;
            setCurrentPath(prev => `${prev} L ${x} ${y}`);
        }
    };

    const handleBoardMouseUp = () => {
        if (mode === 'draw' && currentPath) {
            updateCurrentFrame(null, [...currentPaths, currentPath]);
            setCurrentPath('');
        }
    };

    const handleSaveTactic = async () => {
        if (!tacticName.trim()) return showNotification('Please provide a name for this tactic', 'warning');
        setIsSaving(true);
        try {
            await axios.post('http://localhost:5000/api/strategies', {
                name: tacticName,
                type,
                creatorId: currentUser.id,
                data: frames
            });
            showNotification('Strategy saved successfully', 'success');
            fetchTactics();
            setShowSaveModal(false);
        } catch (error) {
            showNotification('Failed to save strategy', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePathInteraction = (index, e) => {
        if (mode === 'erase') {
            if (e.type === 'mousedown' || (e.type === 'mouseenter' && e.buttons === 1)) {
                e.stopPropagation();
                pushToHistory();
                updateCurrentFrame(null, currentPaths.filter((_, i) => i !== index));
            }
        }
    };

    return (
        <>
            {showSaveModal && createPortal(
                <div className="strategy-modal-overlay">
                    <div className="strategy-modal-card">
                        <h3 className="strategy-modal-title">Save Strategy</h3>
                        <div className="strategy-modal-input-group">
                            <label className="strategy-modal-label">Strategy Title</label>
                            <input 
                                className="strategy-modal-input"
                                placeholder="Enter title..." 
                                value={tacticName}
                                onChange={(e) => setTacticName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="strategy-modal-actions">
                            <button className="strategy-modal-btn cancel" onClick={() => setShowSaveModal(false)}>Cancel</button>
                            <button className="strategy-modal-btn save" onClick={handleSaveTactic} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Confirm Save'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <div id={`workspace-${type}`} className="intel-card" style={{ width: '100%', padding: '0', borderRadius: '0', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', marginTop: '3rem', position: 'relative' }}>
                <div className="court-and-sidebar-grid-premium" style={{ display: 'flex', position: 'relative', overflow: 'hidden', background: '#080808' }}>
                
                {/* PERSONNEL SideBar */}
                <aside className="active-players-sidebar" style={{ 
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
                    overflow: 'hidden'
                }}>
                    <div style={{ 
                        height: '60px',
                        flexShrink: 0,
                        padding: '0 0.5rem', 
                        borderBottom: '1px solid rgba(255,255,255,0.03)', 
                        background: 'linear-gradient(180deg, rgba(219, 10, 64, 0.1) 0%, transparent 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                    }}>
                        <span style={{ fontSize: '0.55rem', color: '#DB0A40', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>DEPLOYED</span>
                        <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: '950', letterSpacing: '2px', textAlign: 'center', opacity: 0.8 }}>UNITS</span>
                    </div>

                    <div className="active-players-list-premium full-custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.2rem 0' }}>
                        {currentTokens.map((token) => (
                            <div 
                                key={token.id} 
                                className="sidebar-token-row-premium"
                                onContextMenu={(e) => { e.preventDefault(); removeToken(token.id); }}
                                style={{ cursor: 'context-menu', justifyContent: 'center' }}
                                title="Right click to remove"
                            >
                                <div className={`sidebar-token-circle-premium ${token.type === 'offense' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`} style={{ borderRadius: '50%' }}>
                                    {token.type === 'ball' ? (
                                        <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at 35% 35%, #ff9f43, #e67e22)', borderRadius: '50%', position: 'relative', overflow: 'hidden' }}>
                                            <div className="ball-seam-curves"></div>
                                        </div>
                                    ) : token.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                <div className="tactical-workspace-right-unit" style={{ flex: 1, background: '#0a0a0a', paddingLeft: '100px', display: 'flex', flexDirection: 'column' }}>
                    <div className="strategy-bench-premium" style={{ height: '60px', padding: '0 2rem', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                        <div className="bench-group-premium" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {[1, 2, 3, 4, 5].map((num) => {
                                const active = isTokenActive('offense', `${num}`);
                                return (
                                    <div
                                        key={`bench-p-${num}`}
                                        className={`bench-token-premium ${active ? 'disabled' : ''} ${!active && num === 1 ? 'active' : ''}`}
                                        onMouseDown={(e) => !active && handleBenchTokenMouseDown(e, 'offense', `${num}`)}
                                        style={{ width: '34px', height: '34px', borderRadius: '4px', fontSize: '0.8rem' }}
                                    >
                                        {num}
                                    </div>
                                );
                            })}
                            
                            <div className="bench-separator-premium"></div>
                            
                            {[1, 2, 3, 4, 5].map((num) => {
                                const label = `D${num}`;
                                const active = isTokenActive('defense', `${label}`);
                                return (
                                    <div
                                        key={`bench-d-${num}`}
                                        className={`bench-token-premium ${active ? 'disabled' : ''}`}
                                        onMouseDown={(e) => !active && handleBenchTokenMouseDown(e, 'defense', `${label}`)}
                                        style={{ 
                                            width: '34px', 
                                            height: '34px', 
                                            background: active ? '#1a1a1a' : '#111', 
                                            border: active ? '1px solid #333' : '1px solid rgba(255,255,255,0.1)',
                                            color: active ? '#444' : '#888',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: '950'
                                        }}
                                    >
                                        {label}
                                    </div>
                                );
                            })}
                            
                            <div className="bench-separator-premium"></div>
                            
                            <div
                                className={`bench-token-premium ${isTokenActive('ball', '🏀') ? 'disabled' : ''}`}
                                onMouseDown={(e) => !isTokenActive('ball', '🏀') && handleBenchTokenMouseDown(e, 'ball', '🏀')}
                                style={{ 
                                    width: '38px', 
                                    height: '38px', 
                                    background: 'radial-gradient(circle at 35% 35%, #e67e22, #d35400)', 
                                    borderRadius: '50%', 
                                    position: 'relative', 
                                    overflow: 'hidden',
                                    border: '1px solid rgba(0,0,0,0.2)',
                                    boxShadow: '0 4px 10px rgba(230, 126, 34, 0.3)',
                                    opacity: isTokenActive('ball', '🏀') ? 0.3 : 1
                                }}
                            >
                                <div className="ball-seam-curves"></div>
                            </div>

                            <div className="bench-separator-premium"></div>
                            <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.55rem', color: '#DB0A40', fontWeight: '950', letterSpacing: '2px', opacity: 0.8 }}>BENCH</span>
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
                            flex: 1,
                            background: '#0a0a0a',
                            position: 'relative',
                            overflow: 'hidden',
                            aspectRatio: `${viewBox.w} / ${viewBox.h}`
                        }}
                    >
                        <ParticlesOverlay />
                        <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
                            <image href={husaLogo} x={viewBox.w/2 - 80} y={viewBox.h/2 - 75} width="160" height="150" opacity="0.03" style={{ filter: 'grayscale(1)' }} />
                            <g stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1.5" fill="none">
                                {type === 'full' ? (
                                    <>
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
                                    </>
                                ) : (
                                    <>
                                        <rect x="15" y="15" width="470" height="440" />
                                        <circle cx="250" cy="455" r="70" />
                                        <path d="M 15,60 L 100,60 A 180,180 0 0 1 400,60 L 485,60" />
                                        <rect x="180" y="15" width="140" height="150" />
                                        <g stroke="#DB0A40" opacity="0.2">
                                            <line x1="180" y1="165" x2="320" y2="165" />
                                            <path d="M 180,165 A 70,70 0 0 0 320,165" />
                                        </g>
                                        
                                        {/* Rim and Backboard for Half-Court */}
                                        <g stroke="#DB0A40" strokeWidth="2" opacity="0.3">
                                            <line x1="220" y1="35" x2="280" y2="35" />
                                            <line x1="250" y1="35" x2="250" y2="45" />
                                            <circle cx="250" cy="57" r="10" />
                                        </g>
                                    </>
                                )}
                            </g>
                        </svg>

                        {/* Drawing Layer */}
                        <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}>
                            <defs>
                                <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#DB0A40" />
                                </marker>
                            </defs>
                            {currentPaths.map((d, i) => (
                                <g key={i} onMouseDown={(e) => handlePathInteraction(i, e)} onMouseEnter={(e) => handlePathInteraction(i, e)} style={{ pointerEvents: mode === 'erase' ? 'auto' : 'none', cursor: mode === 'erase' ? 'pointer' : 'default' }}>
                                    <path d={d} stroke="transparent" strokeWidth="20" fill="none" />
                                    <path d={d} stroke={mode === 'erase' ? '#ff4d4d' : '#DB0A40'} strokeWidth="4" fill="none" strokeLinecap="round" style={{ markerEnd: 'url(#arrowhead)' }} />
                                </g>
                            ))}
                            {currentPath && <path d={currentPath} stroke="#DB0A40" strokeWidth="4" fill="none" strokeLinecap="round" style={{ opacity: 0.5 }} />}
                        </svg>

                        {/* Tokens */}
                        {currentTokens.map(token => {
                            const isBeingDragged = draggingId === token.id;
                            return (
                                <div
                                    key={token.id}
                                    className={`player-token ${token.type === 'offense' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`}
                                    style={{
                                        top: `${token.y}%`,
                                        left: `${token.x}%`,
                                        width: token.type === 'ball' ? '3.5%' : (type === 'full' ? '5.5%' : '7%'),
                                        aspectRatio: '1 / 1',
                                        height: 'auto',
                                        cursor: mode === 'move' ? (isBeingDragged ? 'grabbing' : 'grab') : 'default',
                                        zIndex: isBeingDragged ? 100 : 10,
                                        pointerEvents: mode === 'move' ? 'auto' : 'none',
                                        transform: 'translate(-50%, -50%)',
                                        transition: isBeingDragged ? 'none' : (isPlaying ? `all ${1000 / playbackSpeed}ms linear` : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)')
                                    }}
                                    onMouseDown={(e) => onTokenMouseDown(e, token)}
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
                                        <div style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            borderRadius: token.type === 'defense' ? '6px' : '50%', 
                                            border: token.type === 'defense' ? '2px solid rgba(255,255,255,0.2)' : '2px solid #DB0A40', 
                                            background: token.type === 'defense' ? 'linear-gradient(135deg, #222 0%, #000 100%)' : '#DB0A40', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            color: '#fff', 
                                            fontSize: '0.94rem', 
                                            fontWeight: '950',
                                            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)'
                                        }}>
                                            {token.label}
                                        </div>
                                    )}
                                    <div onContextMenu={(e) => { e.preventDefault(); removeToken(token.id); }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="tactic-toolbar-premium">
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className={`tool-btn-premium ${mode === 'move' ? 'active' : ''}`} onClick={() => setMode('move')}><Move size={20} /></button>
                            <button className="tool-btn-premium" onClick={handleUndo} title="Undo"><Undo2 size={20} /></button>
                            <button className={`tool-btn-premium ${mode === 'draw' ? 'active' : ''}`} onClick={() => setMode('draw')}><Pencil size={20} /></button>
                            <button className={`tool-btn-premium ${mode === 'erase' ? 'active' : ''}`} onClick={() => setMode('erase')}><Eraser size={20} /></button>
                            <button className="tool-btn-premium" onClick={handleReset} title="Reset"><RotateCcw size={20} /></button>
                        </div>
                        
                        <div className="bench-separator-premium"></div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="tool-btn-premium" onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}><SkipBack size={20} /></button>
                            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '800', minWidth: '40px', textAlign: 'center' }}>{currentFrameIndex + 1} / {frames.length}</span>
                            <button className="tool-btn-premium" onClick={togglePlay} >{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
                            <button className="tool-btn-premium" onClick={() => {
                                setPlaybackSpeed(prev => prev === 1 ? 1.5 : (prev === 1.5 ? 2 : 1));
                            }} style={{ fontSize: '0.8rem', fontWeight: '900', minWidth: '36px' }}>x{playbackSpeed}</button>
                            <button className="tool-btn-premium" onClick={addFrame}><Plus size={20} /></button>
                            <button className="tool-btn-premium" onClick={deleteFrame} disabled={frames.length <= 1}><Trash2 size={20} /></button>
                            <button className="tool-btn-premium" onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}><SkipForward size={20} /></button>
                        </div>

                        <div className="bench-separator-premium"></div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setShowSaveModal(true)} 
                                disabled={isSaving}
                                className="commit-btn-premium"
                            >
                                {isSaving ? '...' : <Save size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
};

export default TacticalWorkspace;
