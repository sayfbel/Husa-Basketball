import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import {
    Move,
    Pencil,
    Eraser,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Plus,
    Trash2,
    Save,
    X,
    Undo2,
    RotateCcw,
    Repeat
} from 'lucide-react';
import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const TacticalWorkspace = ({ title, type = 'full', showNotification, showConfirm, savedTactics, fetchTactics }) => {
    // Initial positions
    const initialTokens = [];
    const { currentUser } = useAuth();

    // State Management
    const [mode, setMode] = useState('move'); // 'move' | 'draw' | 'erase'
    const [frames, setFrames] = useState([{
        tokens: JSON.parse(JSON.stringify(initialTokens)),
        paths: []
    }]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Save System State
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [tacticName, setTacticName] = useState('');

    // Undo System
    const [history, setHistory] = useState([]); // Array of frames arrays

    // Interactive State
    const [draggingId, setDraggingId] = useState(null);
    const [currentPath, setCurrentPath] = useState(''); // Current line being drawn

    const courtRef = useRef(null);
    const playInterval = useRef(null);

    // Get current state data derived from frame index with safety fallback
    const currentFrame = frames[currentFrameIndex] || frames[0] || { tokens: [], paths: [] };
    const currentTokens = currentFrame.tokens || [];
    const currentPaths = currentFrame.paths || [];

    const viewBox = type === 'full' ? { w: 1000, h: 560 } : { w: 500, h: 470 };

    // --- Helpers ---
    const updateCurrentFrame = (newTokens, newPaths) => {
        setFrames(prev => prev.map((f, i) =>
            i === currentFrameIndex ? { tokens: newTokens || f.tokens, paths: newPaths || f.paths } : f
        ));
    };

    const isTokenActive = (type, label) => {
        return currentTokens.some(t => t.type === type && t.label === label);
    };

    const pushToHistory = () => {
        const framesClone = JSON.parse(JSON.stringify(frames));
        setHistory(prev => [...prev.slice(-19), framesClone]); // Keep last 20 actions
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const lastState = history[history.length - 1];
        setFrames(lastState);
        setHistory(prev => prev.slice(0, -1));

        // Sync index if it's now out of bounds
        if (currentFrameIndex >= lastState.length) {
            setCurrentFrameIndex(lastState.length - 1);
        }

        if (showNotification) showNotification('Action undone', 'info');
    };

    const handleReset = () => {
        pushToHistory();
        setFrames([{
            tokens: [],
            paths: []
        }]);
        setCurrentFrameIndex(0);
        if (showNotification) showNotification('Board reset', 'info');
    };

    // --- Mouse Handlers (Move Mode) ---
    const handleTokenMouseDown = (e, id) => {
        if (mode !== 'move') return;
        e.stopPropagation();
        e.preventDefault();
        pushToHistory(); // Save state before movement
        setDraggingId(id);
    };

    const removeToken = (id) => {
        pushToHistory();
        const newTokens = currentTokens.filter(t => t.id !== id);
        updateCurrentFrame(newTokens, null);
    };

    const handleBenchTokenMouseDown = (e, type, label) => {
        e.preventDefault();
        const exists = currentTokens.some(t => t.type === type && t.label === label);
        if (exists) return;
        if (!courtRef.current) return;

        const x = 50;
        const y = 50;

        pushToHistory();
        const newToken = {
            id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            label,
            type,
            x,
            y
        };

        const newTokens = [...currentTokens, newToken];
        updateCurrentFrame(newTokens, null);
    };

    // --- Mouse Handlers (Draw Mode) ---
    const handleBoardMouseDown = (e) => {
        if (mode !== 'draw') return;
        if (!courtRef.current) return;
        const rect = courtRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * viewBox.w;
        const y = ((e.clientY - rect.top) / rect.height) * viewBox.h;
        setCurrentPath(`M ${x} ${y}`);
    };

    const erasePath = (index) => {
        pushToHistory();
        const newPaths = currentPaths.filter((_, i) => i !== index);
        updateCurrentFrame(null, newPaths);
    };

    const handlePathClick = (index, e) => {
        if (mode === 'erase') {
            e.stopPropagation();
            erasePath(index);
        }
    };

    const handlePathHover = (index, e) => {
        if (mode === 'erase' && e.buttons === 1) {
            erasePath(index);
        }
    };

    const handleGlobalMouseMove = (e) => {
        if (!courtRef.current) return;
        const rect = courtRef.current.getBoundingClientRect();

        if (draggingId && mode === 'move') {
            let x = ((e.clientX - rect.left) / rect.width) * 100;
            let y = ((e.clientY - rect.top) / rect.height) * 100;
            x = Math.max(0, Math.min(100, x));
            y = Math.max(0, Math.min(100, y));

            const newTokens = currentTokens.map(t =>
                t.id === draggingId ? { ...t, x, y } : t
            );

            const ballIndex = newTokens.findIndex(t => t.type === 'ball');
            const moverIndex = newTokens.findIndex(t => t.id === draggingId);

            if (ballIndex !== -1 && moverIndex !== -1 && newTokens[moverIndex].type !== 'ball') {
                const ball = newTokens[ballIndex];
                const mover = newTokens[moverIndex];
                const dx = ball.x - mover.x;
                const dy = (ball.y - (mover.y)) * (viewBox.h / viewBox.w); // Adjusted for aspect ratio
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 4) {
                    newTokens[ballIndex] = { ...ball, x: mover.x + 2, y: mover.y + 2 };
                }
            }
            updateCurrentFrame(newTokens, null);
        }

        if (currentPath && mode === 'draw') {
            const x = ((e.clientX - rect.left) / rect.width) * viewBox.w;
            const y = ((e.clientY - rect.top) / rect.height) * viewBox.h;
            setCurrentPath(prev => `${prev} L ${x} ${y}`);
        }
    };

    const handleGlobalMouseUp = () => {
        if (draggingId) setDraggingId(null);
        if (currentPath) {
            pushToHistory();
            updateCurrentFrame(null, [...currentPaths, currentPath]);
            setCurrentPath('');
        }
    };

    useEffect(() => {
        if (draggingId || currentPath) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [draggingId, currentPath, currentTokens, currentPaths]);

    // --- Frame Controls ---
    const addFrame = () => {
        pushToHistory();
        const newFrame = JSON.parse(JSON.stringify(frames[currentFrameIndex]));
        const newFrames = [
            ...frames.slice(0, currentFrameIndex + 1),
            newFrame,
            ...frames.slice(currentFrameIndex + 1)
        ];
        setFrames(newFrames);
        setCurrentFrameIndex(currentFrameIndex + 1);
    };

    const deleteFrame = () => {
        if (frames.length <= 1) return;
        pushToHistory();
        const newFrames = frames.filter((_, i) => i !== currentFrameIndex);
        setFrames(newFrames);
        if (currentFrameIndex >= newFrames.length) {
            setCurrentFrameIndex(newFrames.length - 1);
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            if (currentFrameIndex >= frames.length - 1) {
                setCurrentFrameIndex(0);
            }
            setIsPlaying(true);
        }
    };

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
            }, 2000);
        } else {
            clearInterval(playInterval.current);
        }
        return () => clearInterval(playInterval.current);
    }, [isPlaying, frames.length]);

    // --- Save & Load Handlers ---
    const handleSaveClick = () => {
        setTacticName('');
        setShowSaveModal(true);
    };

    const confirmSave = async () => {
        if (!tacticName.trim()) return;
        try {
            await axios.post('http://localhost:5000/api/strategies', {
                name: tacticName,
                data: frames,
                type: type, // 'full' or 'half'
                userId: currentUser?.id
            });
            setShowSaveModal(false);
            if (fetchTactics) fetchTactics();
            showNotification('Strategy Saved Successfully!', 'success');
        } catch (err) {
            console.error(err);
            showNotification('Failed to save strategy', 'error');
        }
    };

    useEffect(() => {
        const handleForceLoad = (e) => {
            if (e.detail && e.detail.data) {
                setFrames(e.detail.data);
                setCurrentFrameIndex(0);
            }
        };
        window.addEventListener(`load-tactic-${type}`, handleForceLoad);
        return () => window.removeEventListener(`load-tactic-${type}`, handleForceLoad);
    }, [type]);

    return (
        <>
            {/* Component Header / Section Branding */}
            <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(90deg, rgba(219, 10, 64, 0.05) 0% , transparent 100%)', display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '3rem' }}>
                <div style={{ height: '40px', width: '2px', background: '#DB0A40' }}></div>
                <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#DB0A40', letterSpacing: '4px', textTransform: 'uppercase' }}>Technical Projection</span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '950', margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>{type === 'full' ? 'FULL COURT' : 'HALF COURT'} SYSTEM WORKSPACE</h2>
                </div>
            </div>

            <div id={`workspace-${type}`} className="intel-card" style={{ width: '100%', padding: '0', borderRadius: '0', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div className="court-and-sidebar-grid-premium">
                    {/* Sidebar Unit */}
                    <aside className="active-players-sidebar full-custom-scroll" style={{ background: '#080808' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(219, 10, 64, 0.02)' }}>
                            <span style={{ fontSize: '0.6rem', color: '#DB0A40', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>DEPLOYED UNITS</span>
                        </div>
                        <div className="sidebar-tab-premium on-court">ON COURT</div>
                        <div className="sidebar-tab-premium vacant">VACANT</div>

                        <div className="active-players-list-premium">
                            {currentTokens.map((token) => (
                                <div key={token.id} className="sidebar-token-row-premium">
                                    <div className={`sidebar-token-circle-premium ${token.type === 'offense' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`}>
                                        {token.type === 'ball' ? <div className="ball-seam-curves"></div> : token.label}
                                    </div>
                                    <button
                                        onClick={() => removeToken(token.id)}
                                        className="remove-token-btn-premium"
                                        title="Remove from court"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Right Main Unit */}
                    <div className="tactical-workspace-right-unit">
                        {/* Bench / Selection Area */}
                        <div className="strategy-bench-premium">
                            <div className="bench-group-premium">
                                {[1, 2, 3, 4, 5].map((num) => {
                                    const active = isTokenActive('offense', `${num}`);
                                    return (
                                        <div
                                            key={`bench-p-${num}`}
                                            className={`bench-token-premium ${active ? 'disabled' : ''} ${!active && num === 1 ? 'active' : ''}`}
                                            onMouseDown={(e) => !active && handleBenchTokenMouseDown(e, 'offense', `${num}`)}
                                        >
                                            {num}
                                        </div>
                                    );
                                })}
                                {[1, 2, 3, 4, 5].map((num) => {
                                    const label = `D${num}`;
                                    const active = isTokenActive('defense', `${label}`);
                                    return (
                                        <div
                                            key={`bench-d-${num}`}
                                            className={`bench-token-premium ${active ? 'disabled' : ''}`}
                                            onMouseDown={(e) => !active && handleBenchTokenMouseDown(e, 'defense', `${label}`)}
                                        >
                                            {label}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="bench-separator-premium"></div>
                            <div
                                className={`bench-token-premium t-ball ${isTokenActive('ball', '🏀') ? 'disabled' : ''}`}
                                onMouseDown={(e) => !isTokenActive('ball', '🏀') && handleBenchTokenMouseDown(e, 'ball', '🏀')}
                                style={{ background: 'transparent', border: 'none', padding: 0 }}
                            >
                                <div className={`sidebar-token-circle-premium p-ball ${isTokenActive('ball', '🏀') ? 'disabled' : ''}`} style={{ width: '42px', height: '42px' }}>
                                    <div className="ball-seam-curves"></div>
                                </div>
                            </div>
                        </div>

                        {/* Court Interactive Area */}
                        <div
                            className={`court-board interactive-board ${draggingId ? 'is-dragging' : ''}`}
                            ref={courtRef}
                            onMouseDown={handleBoardMouseDown}
                            style={{
                                cursor: mode === 'draw' ? 'crosshair' : (mode === 'erase' ? 'not-allowed' : 'default'),
                                background: '#0a0a0a',
                                position: 'relative',
                                overflow: 'hidden',
                                aspectRatio: `${viewBox.w} / ${viewBox.h}`,
                                margin: '0 auto',
                                maxHeight: '100%',
                                width: '100%'
                            }}
                        >
                            {/* Drawing Layer */}
                            <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className={`drawing-layer ${mode === 'draw' || mode === 'erase' ? 'active' : ''}`}>
                                <defs>
                                    <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
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
                                    <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#DB0A40" />
                                    </marker>
                                </defs>
                                {currentPaths.map((d, i) => (
                                    <g key={i} onMouseEnter={(e) => handlePathHover(i, e)} onMouseDown={(e) => handlePathClick(i, e)} style={{ cursor: mode === 'erase' ? 'pointer' : 'default' }}>
                                        <path d={d} stroke="transparent" strokeWidth="20" fill="none" />
                                        <path d={d} className="drawing-path" style={{
                                            stroke: mode === 'erase' ? '#ff4d4d' : '#DB0A40',
                                            filter: mode === 'erase' ? 'none' : 'url(#path-glow)',
                                            markerEnd: mode === 'draw' ? 'url(#arrowhead)' : 'none'
                                        }} />
                                    </g>
                                ))}
                                {currentPath && <path d={currentPath} className="drawing-path" style={{ opacity: 0.5, stroke: '#DB0A40' }} />}
                            </svg>

                            {/* Court Graphics SVG */}
                            <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className="basketball-court-svg" style={{ pointerEvents: 'none' }}>
                                <rect width={viewBox.w} height={viewBox.h} fill="#0a0a0a" />

                                {type === 'full' && (
                                    <image
                                        href={husaLogo}
                                        x="420"
                                        y="205"
                                        width="160"
                                        height="150"
                                        opacity="0.05"
                                        style={{ filter: 'grayscale(1) brightness(0.3)' }}
                                    />
                                )}

                                {type === 'full' ? (
                                    <>
                                        <rect x="25" y="25" width="950" height="510" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                                        <line x1="500" y1="25" x2="500" y2="535" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                        <circle cx="500" cy="280" r="70" className="court-center-circle" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />

                                        <g>
                                            <rect x="25" y="205" width="190" height="150" className="court-painted-area" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                        </g>
                                        <g>
                                            <rect x="785" y="205" width="190" height="150" className="court-painted-area" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                        </g>

                                        <path d="M 215,205 A 75,75 0 0 1 215,355" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                        <path d="M 25,80 L 240,80 A 250,250 0 0 1 240,480 L 25,480" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                        <circle cx="75" cy="280" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />

                                        <path d="M 785,205 A 75,75 0 0 0 785,355" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                        <path d="M 975,80 L 760,80 A 250,250 0 0 0 760,480 L 975,480" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                        <circle cx="925" cy="280" r="15" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                                    </>
                                ) : (
                                    <>
                                        <rect x="15" y="15" width="470" height="440" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                                        <g>
                                            <rect x="165" y="15" width="170" height="190" className="court-painted-area" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                        </g>
                                        <circle cx="250" cy="205" r="60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                        <path d="M 30,15 L 30,230 A 250,250 0 0 0 470,230 L 470,15" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                        <circle cx="250" cy="55" r="12" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                                        <line x1="220" y1="40" x2="280" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                                    </>
                                )}
                            </svg>

                            {/* Live Target Tokens */}
                            {currentTokens.map(token => {
                                const isBeingDragged = draggingId === token.id;
                                const shouldDisableTransition = isBeingDragged || (draggingId && token.type === 'ball');

                                return (
                                    <div
                                        key={token.id}
                                        className={`player-token ${token.type === 'offense' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`}
                                        style={{
                                            top: `${token.y}%`,
                                            left: `${token.x}%`,
                                            width: token.type === 'ball' ? '3.5%' : '5%',
                                            aspectRatio: '1/1',
                                            height: 'auto',
                                            cursor: mode === 'move' ? (isBeingDragged ? 'grabbing' : 'grab') : 'default',
                                            zIndex: isBeingDragged ? 10 : 5,
                                            pointerEvents: mode === 'move' ? 'auto' : 'none',
                                            opacity: mode === 'erase' ? 0.5 : 1,
                                            borderRadius: '50%',
                                            fontWeight: '900',
                                            transition: shouldDisableTransition ? 'none' : (isPlaying ? 'all 1500ms cubic-bezier(0.4, 0, 0.2, 1)' : 'all 800ms ease')
                                        }}
                                        onMouseDown={(e) => handleTokenMouseDown(e, token.id)}
                                    >
                                        {token.type === 'ball' ? <div className="ball-seam-curves"></div> : token.label}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tactical Toolbar Integration */}
                        <div className="tactic-toolbar-premium">
                            <div className="bench-group-premium" style={{ gap: '1.5rem' }}>
                                <button className={`tool-btn-premium ${mode === 'move' ? 'active' : ''}`} onClick={() => setMode('move')} title="Move System"><Move size={24} /></button>
                                <button className="tool-btn-premium" onClick={handleUndo} title="Undo"><Undo2 size={24} /></button>
                                <button className={`tool-btn-premium ${mode === 'draw' ? 'active' : ''}`} onClick={() => setMode('draw')}><Pencil size={24} /></button>
                                <button className={`tool-btn-premium ${mode === 'erase' ? 'active' : ''}`} onClick={() => setMode('erase')}><Eraser size={24} /></button>
                                <button className="tool-btn-premium" onClick={() => handleReset()}><Repeat size={24} /></button>
                            </div>

                            <div className="bench-separator-premium"></div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <button className="tool-btn-premium active" onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}><SkipBack size={20} /></button>
                                <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', opacity: 0.9 }}>
                                    <span style={{ opacity: 0.4 }}>FLIGHT</span> {currentFrameIndex + 1} // {frames.length}
                                </div>
                                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                                    <button className="tool-btn-premium" onClick={togglePlay}>{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
                                    <button className="tool-btn-premium" onClick={addFrame}><Plus size={20} /></button>
                                    <button className="tool-btn-premium" onClick={deleteFrame} disabled={frames.length <= 1} style={{ fontSize: '1.8rem', fontWeight: '200', lineHeight: '0' }}>-</button>
                                    <button className="tool-btn-premium active" onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}><SkipForward size={20} /></button>
                                </div>
                            </div>

                            <div className="bench-separator-premium"></div>

                            <button className="commit-btn-premium" onClick={handleSaveClick} title="Save Strategy" style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Save size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Modal Portal */}
            {showSaveModal && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                    <div className="intel-card" style={{ width: '500px', maxWidth: '90%', border: '1px solid rgba(219,10,64,0.3)', borderRadius: '0', padding: '0', overflow: 'hidden', boxShadow: '0 0 100px rgba(219,10,64,0.1)' }}>
                        <div className="briefing-banner" style={{ background: 'linear-gradient(90deg, #222 0%, #111 100%)', padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0' }}>
                            <div>
                                <h2 style={{ margin: 0, border: 'none', color: '#fff', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '2px' }}>SAVE {title.toUpperCase()}</h2>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.65rem', color: '#DB0A40', fontWeight: 'bold' }}>SYSTEM UPLINK ENCRYPTION</p>
                            </div>
                            <button onClick={() => setShowSaveModal(false)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <div style={{ padding: '2.5rem' }}>
                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', color: '#444', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '3px' }}>SYSTEM DESIGNATION</label>
                                <input
                                    type="text"
                                    value={tacticName}
                                    onChange={(e) => setTacticName(e.target.value)}
                                    placeholder="Briefing Title..."
                                    maxLength={50}
                                    style={{ width: '100%', padding: '18px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', borderRadius: '0', fontSize: '1rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={confirmSave} className="intel-btn-primary" disabled={!tacticName.trim()} style={{ width: '100%', padding: '20px', justifyContent: 'center', letterSpacing: '2px', fontWeight: '900', borderRadius: '0' }}>SAVE SYSTEM DATA</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default TacticalWorkspace;
