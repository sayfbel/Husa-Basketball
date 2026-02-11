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
    RotateCcw
} from 'lucide-react';

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

    // Get current state data derived from frame index
    const currentTokens = frames[currentFrameIndex].tokens;
    const currentPaths = frames[currentFrameIndex].paths;

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
            }, 800);
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
            <div className="strategy-card" style={{ width: '100%', marginBottom: '2rem' }}>
                <div className="card-header-flex">
                    <h2>{title}</h2>
                    <span className="live-indicator">ACTIVE</span>
                </div>

                {/* Bench Area */}
                <div className="strategy-bench">
                    <div className="bench-group">
                        {[1, 2, 3, 4, 5].map(num => {
                            const active = isTokenActive('offense', `${num}`);
                            return (
                                <div
                                    key={`bench-p-${num}`}
                                    className={`bench-token t-offense ${active ? 'disabled' : ''}`}
                                    style={{
                                        opacity: active ? 0.3 : 1,
                                        cursor: active ? 'not-allowed' : 'grab',
                                        filter: active ? 'grayscale(100%)' : 'none'
                                    }}
                                    onMouseDown={(e) => !active && handleBenchTokenMouseDown(e, 'offense', `${num}`)}
                                >
                                    {num}
                                </div>
                            );
                        })}
                    </div>
                    <div className="bench-separator"></div>
                    <div className="bench-group">
                        {[1, 2, 3, 4, 5].map(num => {
                            const active = isTokenActive('defense', `D${num}`);
                            return (
                                <div
                                    key={`bench-d-${num}`}
                                    className={`bench-token t-defense ${active ? 'disabled' : ''}`}
                                    style={{
                                        opacity: active ? 0.3 : 1,
                                        cursor: active ? 'not-allowed' : 'grab',
                                        filter: active ? 'grayscale(100%)' : 'none'
                                    }}
                                    onMouseDown={(e) => !active && handleBenchTokenMouseDown(e, 'defense', `D${num}`)}
                                >
                                    D{num}
                                </div>
                            );
                        })}
                    </div>
                    <div className="bench-separator"></div>
                    <div
                        className={`bench-token t-ball ${isTokenActive('ball', '🏀') ? 'disabled' : ''}`}
                        onMouseDown={(e) => !isTokenActive('ball', '🏀') && handleBenchTokenMouseDown(e, 'ball', '🏀')}
                        style={{
                            cursor: isTokenActive('ball', '🏀') ? 'not-allowed' : 'grab',
                            opacity: isTokenActive('ball', '🏀') ? 0.3 : 1,
                            filter: isTokenActive('ball', '🏀') ? 'grayscale(100%)' : 'none'
                        }}
                    >
                        🏀
                    </div>
                </div>

                <div className="court-and-sidebar" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {/* Active Players Sidebar */}
                    <div className="active-players-sidebar full-custom-scroll" style={{
                        width: '180px',
                        background: '#151515',
                        borderRadius: '8px',
                        padding: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        maxHeight: type === 'full' ? '560px' : '470px',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '10px', textTransform: 'uppercase' }}>On Court</h3>
                        {currentTokens.length === 0 && <p style={{ fontSize: '0.8rem', color: '#555', fontStyle: 'italic' }}>No players</p>}
                        {currentTokens.map((token, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '6px 10px',
                                borderRadius: '4px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className={`player-token ${token.type === 'offense' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`}
                                        style={{ position: 'relative', width: '20px', height: '20px', fontSize: '0.6rem', transform: 'none', top: 'auto', left: 'auto' }}>
                                        {token.label}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: '#ccc' }}>
                                        {token.type === 'offense' ? (
                                            token.label == '1' ? 'Point Guard (1)' :
                                                token.label == '2' ? 'Shooting Guard (2)' :
                                                    token.label == '3' ? 'Small Forward (3)' :
                                                        token.label == '4' ? 'Power Forward (4)' :
                                                            token.label == '5' ? 'Center (5)' : token.label
                                        ) : token.label}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeToken(token.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    title="Remove from court"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div
                        className="court-board interactive-board"
                        ref={courtRef}
                        onMouseDown={handleBoardMouseDown}
                        style={{
                            cursor: mode === 'draw' ? 'crosshair' : (mode === 'erase' ? 'not-allowed' : 'default'),
                            flex: 1
                        }}
                    >
                        {/* Drawing Layer */}
                        <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} className={`drawing-layer ${mode === 'draw' || mode === 'erase' ? 'active' : ''}`}>
                            {currentPaths.map((d, i) => (
                                <g key={i} onMouseEnter={(e) => handlePathHover(i, e)} onMouseDown={(e) => handlePathClick(i, e)} style={{ cursor: mode === 'erase' ? 'pointer' : 'default' }}>
                                    <path d={d} stroke="transparent" strokeWidth="20" fill="none" />
                                    <path d={d} className="drawing-path" style={{ stroke: mode === 'erase' ? '#ff4d4d' : '#fcd34d' }} />
                                </g>
                            ))}
                            {currentPath && <path d={currentPath} className="drawing-path" style={{ opacity: 0.5 }} />}
                        </svg>

                        {/* Court SVG */}
                        {type === 'full' ? (
                            <svg viewBox="0 0 1000 560" className="basketball-court-svg" style={{ pointerEvents: 'none' }}>
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
                            <svg viewBox="0 0 500 470" className="basketball-court-svg" style={{ pointerEvents: 'none' }}>
                                <rect width="500" height="470" fill="#1a1a1a" />
                                <rect x="15" y="15" width="470" height="440" fill="none" stroke="#fff" strokeWidth="4" />
                                <rect x="165" y="15" width="170" height="190" fill="rgba(219, 10, 64, 0.3)" stroke="#fff" strokeWidth="4" />
                                <circle cx="250" cy="205" r="60" fill="none" stroke="#fff" strokeWidth="4" />
                                <path d="M 30,15 L 30,230 A 250,250 0 0 0 470,230 L 470,15" fill="none" stroke="#fff" strokeWidth="4" />
                                <circle cx="250" cy="55" r="12" fill="none" stroke="#fff" strokeWidth="4" />
                                <line x1="220" y1="40" x2="280" y2="40" stroke="#fff" strokeWidth="4" />
                            </svg>
                        )}

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
                                    transition: draggingId === token.id ? 'none' : (isPlaying ? 'all 800ms ease' : 'all 300ms ease')
                                }}
                                onMouseDown={(e) => handleTokenMouseDown(e, token.id)}
                            >
                                {token.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controller Panel */}
                <div className="tactic-controls">
                    <div className="controls-row">
                        <div className="tools-group">
                            <button className={`tool-btn ${mode === 'move' ? 'active' : ''}`} onClick={() => setMode('move')} title="Move Players"><Move size={20} /></button>
                            <button className={`tool-btn ${mode === 'draw' ? 'active' : ''}`} onClick={() => setMode('draw')} title="Draw Lines"><Pencil size={20} /></button>
                            <button className={`tool-btn ${mode === 'erase' ? 'active' : ''}`} onClick={() => setMode('erase')} title="Eraser"><Eraser size={20} /></button>
                        </div>

                        <div className="timeline-controls">
                            <button className="frame-btn" onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}><SkipBack size={18} /></button>
                            <button className="frame-btn play-btn" onClick={togglePlay}>{isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}</button>
                            <button className="frame-btn" onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}><SkipForward size={18} /></button>
                            <div className="frame-counter"><span>FRAME</span>{currentFrameIndex + 1} / {frames.length}</div>
                            <button className="frame-btn" onClick={addFrame} title="Add New Frame"><Plus size={18} /></button>
                        </div>

                        <div className="save-controls">
                            <button className="control-btn btn-reset" onClick={handleUndo} disabled={history.length === 0} title="Undo Action"><Undo2 size={18} /></button>
                            <button className="control-btn btn-reset" onClick={handleReset} title="Clear Board"><RotateCcw size={18} /></button>
                            <button className="control-btn btn-reset" onClick={deleteFrame} disabled={frames.length <= 1} title="Delete Frame"><Trash2 size={18} /></button>
                            <button className="control-btn btn-save" onClick={handleSaveClick} title="Save Play"><Save size={18} style={{ marginRight: '6px' }} /> SAVE</button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Save Modal (Local to Workspace) - Moved outside strategy-card and into a Portal */}
            {showSaveModal && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                    <div className="dashboard-card" style={{ width: '400px', maxWidth: '90%', border: '1px solid rgba(255,49,49,0.2)', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, border: 'none', color: '#fff' }}>Save {title}</h2>
                            <button onClick={() => setShowSaveModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>System Name</label>
                            <input type="text" value={tacticName} onChange={(e) => setTacticName(e.target.value)} placeholder="e.g. Baseline Out" maxLength={50} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', fontSize: '1rem' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>

                            <button onClick={confirmSave} className="control-btn btn-save" disabled={!tacticName.trim()} style={{ background: '#ff3131' }}>CONFIRM SAVE</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default TacticalWorkspace;
