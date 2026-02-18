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
            }, 1200);
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



    // Listen for global load events if we want the Saved List to work with both boards
    // Actually, it's easier to just pass the ability to load a tactic down
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
            <div id={`workspace-${type}`} className="intel-card" style={{ width: '100%', padding: '0', borderRadius: '0', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div className="briefing-banner" style={{ background: 'transparent', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#fff', position: 'absolute', right: '1rem' }}>
                        <div className="pulse-dot" style={{ background: '#DB0A40', boxShadow: '0 0 10px #DB0A40' }}></div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '1px' }}>SYSTEM LIVE</span>
                    </div>
                </div>

                {/* Bench Area - Premium Pill */}
                <div className="strategy-bench-premium" style={{ marginBottom: '2rem' }}>
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
                        style={{ background: 'transparent', fontSize: '1.5rem', border: 'none', padding: 0 }}
                    >
                        🏀
                    </div>
                </div>

                <div className="court-and-sidebar" style={{ padding: '0', borderRadius: '1.5rem', background: '#111', border: '10px solid #222', boxSizing: 'content-box', maxWidth: '100%', overflow: 'hidden' }}>
                    {/* Active Players Sidebar */}
                    <div className="active-players-sidebar full-custom-scroll" style={{
                        maxHeight: type === 'full' ? '560px' : '470px',
                        width: '120px',
                        padding: '0',
                        background: 'rgba(255,255,255,0.02)',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        marginRight: '0',
                        borderRadius: '0'
                    }}>
                        <div className="sidebar-tab-premium on-court">ON COURT</div>
                        <div className="sidebar-tab-premium vacant" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>VACANT</div>

                        <div style={{ padding: '10px' }}>
                            {currentTokens.map((token, idx) => (
                                <div key={idx} style={{ marginBottom: '10px', position: 'relative' }}>
                                    <div className={`player-token ${token.type === 'offense' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`}
                                        style={{ position: 'relative', width: '32px', height: '32px', fontSize: '0.9rem', transform: 'none', top: 'auto', left: 'auto', borderRadius: '50%', fontWeight: '900', margin: '0 auto' }}>
                                        {token.label}
                                    </div>
                                    <button
                                        onClick={() => removeToken(token.id)}
                                        className="remove-token-btn"
                                        style={{ position: 'absolute', top: '-2px', right: '18px', background: '#fff', color: '#DB0A40', padding: '0', width: '12px', height: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <X size={6} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="court-board interactive-board"
                        ref={courtRef}
                        onMouseDown={handleBoardMouseDown}
                        style={{
                            cursor: mode === 'draw' ? 'crosshair' : (mode === 'erase' ? 'not-allowed' : 'default'),
                            borderRadius: '0',
                            background: '#0a0a0a',
                            border: 'none',
                            boxShadow: 'none'
                        }}
                    >
                        {/* Drawing Layer */}
                        <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className={`drawing-layer ${mode === 'draw' || mode === 'erase' ? 'active' : ''}`}>
                            <defs>
                                <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
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

                        {/* Court SVG */}
                        <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className="basketball-court-svg" style={{ pointerEvents: 'none' }}>
                            <rect width={viewBox.w} height={viewBox.h} fill="#0a0a0a" />

                            {/* Team Logo Watermark in Center (Full Court Only) */}
                            {type === 'full' && (
                                <image
                                    href={husaLogo}
                                    x="420"
                                    y="205"
                                    width="160"
                                    height="150"
                                    opacity="1"
                                />
                            )}

                            {type === 'full' ? (
                                <>
                                    <rect x="25" y="25" width="950" height="510" fill="none" stroke="#fff" strokeWidth="4" />
                                    <line x1="500" y1="25" x2="500" y2="535" stroke="#fff" strokeWidth="4" />
                                    <circle cx="500" cy="280" r="70" className="court-center-circle" />

                                    {/* Painted Areas with All Side White Borders */}
                                    <g>
                                        <rect x="25" y="205" width="190" height="150" className="court-painted-area" />
                                        <line x1="25" y1="205" x2="215" y2="205" stroke="#fff" strokeWidth="4" />
                                        <line x1="25" y1="355" x2="215" y2="355" stroke="#fff" strokeWidth="4" />
                                        <line x1="25" y1="205" x2="25" y2="355" stroke="#fff" strokeWidth="4" />
                                        <line x1="215" y1="205" x2="215" y2="355" stroke="#fff" strokeWidth="4" />
                                    </g>
                                    <g>
                                        <rect x="785" y="205" width="190" height="150" className="court-painted-area" />
                                        <line x1="785" y1="205" x2="975" y2="205" stroke="#fff" strokeWidth="4" />
                                        <line x1="785" y1="355" x2="975" y2="355" stroke="#fff" strokeWidth="4" />
                                        <line x1="785" y1="205" x2="785" y2="355" stroke="#fff" strokeWidth="4" />
                                        <line x1="975" y1="205" x2="975" y2="355" stroke="#fff" strokeWidth="4" />
                                    </g>

                                    <path d="M 215,205 A 75,75 0 0 1 215,355" fill="none" stroke="#fff" strokeWidth="4" />
                                    <path d="M 25,80 L 240,80 A 250,250 0 0 1 240,480 L 25,480" fill="none" stroke="#fff" strokeWidth="4" />
                                    <circle cx="75" cy="280" r="15" fill="none" stroke="#fff" strokeWidth="4" />

                                    <path d="M 785,205 A 75,75 0 0 0 785,355" fill="none" stroke="#fff" strokeWidth="4" />
                                    <path d="M 975,80 L 760,80 A 250,250 0 0 0 760,480 L 975,480" fill="none" stroke="#fff" strokeWidth="4" />
                                    <circle cx="925" cy="280" r="15" fill="none" stroke="#fff" strokeWidth="4" />
                                </>
                            ) : (
                                <>
                                    <rect x="15" y="15" width="470" height="440" fill="none" stroke="#fff" strokeWidth="4" />
                                    {/* Half Court Painted Area with Borders */}
                                    <g>
                                        <rect x="165" y="15" width="170" height="190" className="court-painted-area" />
                                        <line x1="165" y1="15" x2="335" y2="15" stroke="#fff" strokeWidth="4" />
                                        <line x1="165" y1="205" x2="335" y2="205" stroke="#fff" strokeWidth="4" />
                                        <line x1="165" y1="15" x2="165" y2="205" stroke="#fff" strokeWidth="4" />
                                        <line x1="335" y1="15" x2="335" y2="205" stroke="#fff" strokeWidth="4" />
                                    </g>
                                    <circle cx="250" cy="205" r="60" fill="none" stroke="#fff" strokeWidth="4" />
                                    <path d="M 30,15 L 30,230 A 250,250 0 0 0 470,230 L 470,15" fill="none" stroke="#fff" strokeWidth="4" />
                                    <circle cx="250" cy="55" r="12" fill="none" stroke="#fff" strokeWidth="4" />
                                    <line x1="220" y1="40" x2="280" y2="40" stroke="#fff" strokeWidth="4" />
                                </>
                            )}
                        </svg>

                        {/* Draggable Tokens */}
                        {currentTokens.map(token => (
                            <div
                                key={token.id}
                                className={`player-token ${token.type === 'offense' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`}
                                style={{
                                    top: `${token.y}%`,
                                    left: `${token.x}%`,
                                    cursor: mode === 'move' ? (draggingId === token.id ? 'grabbing' : 'grab') : 'default',
                                    zIndex: draggingId === token.id ? 10 : 2,
                                    pointerEvents: mode === 'move' ? 'auto' : 'none',
                                    opacity: mode === 'erase' ? 0.5 : 1,
                                    borderRadius: '0',
                                    fontWeight: '900',
                                    transition: draggingId === token.id ? 'none' : (isPlaying ? 'all 800ms ease' : 'all 300ms ease')
                                }}
                                onMouseDown={(e) => handleTokenMouseDown(e, token.id)}
                            >
                                {token.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controller Panel - Premium Toolbar */}
                <div className="tactic-toolbar-premium">
                    <div className="bench-group-premium" style={{ gap: '1.5rem' }}>
                        <button className="tool-btn-premium" onClick={handleUndo} title="Undo"><Undo2 size={24} /></button>
                        <button className={`tool-btn-premium ${mode === 'draw' ? 'active' : ''}`} onClick={() => setMode('draw')}><Pencil size={24} /></button>
                        <button className={`tool-btn-premium ${mode === 'erase' ? 'active' : ''}`} onClick={() => setMode('erase')}><Eraser size={24} /></button>
                        <button className="tool-btn-premium" onClick={() => handleReset()}><Repeat size={24} /></button>
                    </div>

                    <div className="bench-separator-premium"></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button
                            className="tool-btn-premium active"
                            onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}
                        >
                            <SkipBack size={20} />
                        </button>

                        <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', opacity: 0.9 }}>
                            <span style={{ opacity: 0.4 }}>METRIC FLIGHT</span> {currentFrameIndex + 1} // {frames.length}
                        </div>

                        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                            <button className="tool-btn-premium" onClick={togglePlay}>
                                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button className="tool-btn-premium" onClick={addFrame}>
                                <Plus size={20} />
                            </button>
                            <button
                                className="tool-btn-premium"
                                onClick={deleteFrame}
                                disabled={frames.length <= 1}
                                style={{ fontSize: '1.8rem', fontWeight: '200', lineHeight: '0' }}
                            >
                                -
                            </button>
                            <button
                                className="tool-btn-premium active"
                                onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}
                            >
                                <SkipForward size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="bench-separator-premium"></div>

                    <button className="commit-btn-premium" onClick={handleSaveClick} style={{ fontFamily: 'Orbitron, sans-serif' }}>COMMIT SYSTEM</button>
                </div>

            </div>

            {/* Save Modal (Local to Workspace) - Moved outside strategy-card and into a Portal */}
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
