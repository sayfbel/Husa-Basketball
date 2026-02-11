import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext'; // Adjusted path
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
    FolderOpen, // For loading strategies
    Shield,
    Undo2,
    RotateCcw
} from 'lucide-react';

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
            opacity: 0.6,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
        }}>
            <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} style={{ width: '100%', height: '100%' }}>
                <rect width={viewBoxW} height={viewBoxH} fill="none" stroke={themeColor} strokeWidth="3" opacity="0.3" />
                {viewBoxW === 1000 && <line x1="500" y1="0" x2="500" y2="560" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />}
                <circle cx={viewBoxW / 2} cy={viewBoxW === 1000 ? 280 : 205} r={viewBoxW === 1000 ? 70 : 60} fill="none" stroke={themeColor} strokeWidth="3" opacity="0.3" />
                {firstFrame.tokens && firstFrame.tokens.map((token, idx) => (
                    <circle
                        key={idx}
                        cx={`${token.x * (viewBoxW / 100)}`}
                        cy={`${token.y * (viewBoxH / 100)}`}
                        r="25"
                        fill={token.type === 'offense' ? '#DB0A40' : token.type === 'defense' ? '#111' : '#f97316'}
                        stroke={token.type === 'defense' ? 'rgba(255,255,255,0.5)' : 'none'}
                        strokeWidth="2"
                    />
                ))}
            </svg>
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0, height: '100%',
                background: `linear-gradient(to bottom, rgba(26,26,26,0.2), rgba(26,26,26,0.9))`,
                zIndex: 0
            }} />
        </div>
    );
};

const MatchTacticsBoard = ({ summonedPlayers, starters, strategies, showNotification, onStrategyLoaded, fetchStrategies }) => {
    const { currentUser } = useAuth();
    const [mode, setMode] = useState('move');
    const [frames, setFrames] = useState([{
        tokens: [],
        paths: []
    }]);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Save State
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [tacticName, setTacticName] = useState('');

    // Strategy Load State
    const [showLoadDropdown, setShowLoadDropdown] = useState(false);
    const [selectedStrategyId, setSelectedStrategyId] = useState(null);
    const [pendingSubstitute, setPendingSubstitute] = useState(null); // { newPlayer: playerObj }
    const [history, setHistory] = useState([]); // Array of frames arrays

    // Interactive State
    const [draggingId, setDraggingId] = useState(null);
    const [currentPath, setCurrentPath] = useState('');

    const courtRef = useRef(null);
    const playInterval = useRef(null);

    const currentTokens = frames[currentFrameIndex].tokens;
    const currentPaths = frames[currentFrameIndex].paths;
    const viewBox = { w: 1000, h: 560 }; // Full Court

    // --- Helpers ---
    const updateCurrentFrame = (newTokens, newPaths) => {
        setFrames(prev => prev.map((f, i) =>
            i === currentFrameIndex ? { tokens: newTokens || f.tokens, paths: newPaths || f.paths } : f
        ));
    };

    const pushToHistory = () => {
        // Deep clone frames to avoid reference soup
        const framesClone = JSON.parse(JSON.stringify(frames));
        setHistory(prev => [...prev.slice(-19), framesClone]);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const lastState = history[history.length - 1];
        setFrames(lastState);
        setHistory(prev => prev.slice(0, -1));
        showNotification("Action undone", "info");
    };

    const handleReset = () => {
        pushToHistory();
        setFrames([{ tokens: [], paths: [] }]);
        setCurrentFrameIndex(0);
        setSelectedStrategyId(null);
        showNotification("Board Reset", "info");
    };

    // Check if a player is already on the court
    const isPlayerOnCourt = (playerId) => {
        return currentTokens.some(t => t.playerId === playerId);
    };

    // --- Actions ---
    const handleAddPlayer = (player) => {
        if (isPlayerOnCourt(player.id)) return;

        const playerTokens = currentTokens.filter(t => t.type === 'player');

        if (playerTokens.length >= 5) {
            setPendingSubstitute({ newPlayer: player });
            if (showNotification) showNotification(`Select a player on the court to replace with ${player.name}`, 'info');
            return;
        }

        pushToHistory();
        const newToken = {
            id: `token-${Date.now()}`,
            playerId: player.id,
            name: player.name,
            number: player.jersey_number,
            photo: player.photo_url,
            type: 'player',
            x: 50,
            y: 50
        };
        updateCurrentFrame([...currentTokens, newToken], null);
    };

    const handleAddBall = () => {
        if (currentTokens.some(t => t.type === 'ball')) return;
        pushToHistory();
        const newToken = {
            id: `ball-${Date.now()}`,
            type: 'ball',
            label: '🏀',
            x: 50,
            y: 50
        };
        updateCurrentFrame([...currentTokens, newToken], null);
    };

    const handleAddDefense = (num) => {
        const label = `D${num}`;
        if (currentTokens.some(t => t.type === 'defense' && t.label === label)) return;
        pushToHistory();
        const newToken = {
            id: `def-${Date.now()}-${num}`,
            type: 'defense',
            label: label,
            x: 50,
            y: 50
        };
        updateCurrentFrame([...currentTokens, newToken], null);
    };

    const removeToken = (id) => {
        pushToHistory();
        updateCurrentFrame(currentTokens.filter(t => t.id !== id), null);
    };

    // --- Strategy Loading ---


    const loadStrategy = (originalStrategy) => {
        if (!originalStrategy.data || originalStrategy.data.length === 0) return;

        setSelectedStrategyId(originalStrategy.id);

        const newFrames = originalStrategy.data.map(frame => {
            const newTokens = (frame.tokens || []).map(t => {
                if (t.type === 'offense') {
                    const label = parseInt(t.label); // '1', '2', etc.
                    // Map label '1' to starters[0], '2' to starters[1], etc.
                    const starterId = starters[label - 1];
                    const player = summonedPlayers.find(p => p.id === starterId);

                    if (player) {
                        return {
                            id: `token-${t.id}-mapped`,
                            playerId: player.id,
                            name: player.name,
                            number: player.jersey_number,
                            photo: player.photo_url,
                            type: 'player',
                            x: t.x,
                            y: t.y,
                            label: t.label
                        };
                    } else {
                        // Keep as generic offense token with no photo if no starter matched
                        return t;
                    }
                }
                if (t.type === 'ball') {
                    return { ...t, id: `ball-${Date.now()}-${t.id}` };
                }
                return t;
            });

            return { tokens: newTokens, paths: frame.paths || [] };
        });

        setFrames(newFrames);
        setCurrentFrameIndex(0);
        showNotification(`Strategy loaded with assigned Starting 5.`, 'success');

        if (typeof onStrategyLoaded === 'function') {
            onStrategyLoaded(originalStrategy.id);
        }
    };


    // --- Mouse Handlers (Same as Workspace) ---
    const handleTokenMouseDown = (e, token) => {
        if (pendingSubstitute) {
            e.stopPropagation();
            if (token.type !== 'player') return;

            const newPlayer = pendingSubstitute.newPlayer;
            const oldName = token.name;

            pushToHistory();
            const newFrames = frames.map(frame => ({
                ...frame,
                tokens: (frame.tokens || []).map(t =>
                    t.id === token.id ? {
                        ...t,
                        playerId: newPlayer.id,
                        name: newPlayer.name,
                        number: newPlayer.jersey_number,
                        photo: newPlayer.photo_url
                    } : t
                )
            }));

            setFrames(newFrames);
            setPendingSubstitute(null);
            if (showNotification) showNotification(`Substituted ${oldName} for ${newPlayer.name} globally.`, 'success');
            return;
        }

        if (mode !== 'move') return;
        e.stopPropagation();
        pushToHistory(); // Save state before movement starts
        setDraggingId(token.id);
    };

    // ... (Coordinate logic copied from Workspace but cleaned up)
    const handleBoardMouseDown = (e) => {
        if (mode !== 'draw') return;
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

            // Ball Following Logic
            const ballIndex = newTokens.findIndex(t => t.type === 'ball');
            const moverIndex = newTokens.findIndex(t => t.id === draggingId);

            if (ballIndex !== -1 && moverIndex !== -1 && newTokens[moverIndex].type !== 'ball') {
                const ball = newTokens[ballIndex];
                const mover = newTokens[moverIndex];

                // Calculate distance in viewBox coordinates to be consistent
                const dx = ball.x - mover.x;
                const dy = (ball.y - mover.y) * (viewBox.h / viewBox.w); // Aspect ratio correction
                const dist = Math.sqrt(dx * dx + dy * dy);

                // If player is close enough (e.g. within 4% of width), snap ball
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
            pushToHistory(); // Save state before adding the new path permanently
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


    // --- Frame & Play Logic ---
    const addFrame = () => {
        pushToHistory();
        setFrames(prev => [...prev, JSON.parse(JSON.stringify(prev[currentFrameIndex]))]);
        setCurrentFrameIndex(prev => prev + 1);
    };

    const deleteFrame = () => {
        if (frames.length <= 1) return;
        pushToHistory();
        const newFrames = frames.filter((_, i) => i !== currentFrameIndex);
        setFrames(newFrames);
        setCurrentFrameIndex(prev => Math.min(prev, newFrames.length - 1));
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

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

    // --- Save Logic ---
    const handleSaveClick = () => {
        // Open Initial Save Modal to get Name
        setTacticName('');
        setShowSaveModal(true);
    };

    const finalizeSaveStrategy = async () => {
        if (!tacticName.trim()) return;

        try {
            // Mapping logic: Look at the player ID in the token. Find which Position (1-5) that player occupies in starters.
            // That position number (index + 1) becomes the label.

            const abstractFrames = frames.map(frame => ({
                ...frame,
                tokens: (frame.tokens || []).map(t => {
                    // Convert Player -> Offense
                    if (t.type === 'player') {
                        // Find which position number (1-5) this player is in starters
                        const starterIdx = starters.indexOf(t.playerId);
                        const assignedLabel = starterIdx !== -1 ? String(starterIdx + 1) : '?';

                        return {
                            id: t.id,
                            x: t.x,
                            y: t.y,
                            type: 'offense',
                            label: assignedLabel
                        };
                    }
                    if (t.type === 'ball') {
                        return { ...t, label: t.label || '🏀' };
                    }
                    return t;
                }),
                paths: frame.paths || []
            }));

            await axios.post('http://localhost:5000/api/strategies', {
                name: tacticName,
                data: abstractFrames,
                type: 'full',
                userId: currentUser?.id
            });
            setShowSaveModal(false);
            showNotification('Strategy Saved successfully.', 'success');
            if (typeof fetchStrategies === 'function') {
                fetchStrategies();
            }
        } catch (err) {
            console.error(err);
            showNotification('Failed to save strategy', 'error');
        }
    };

    return (
        <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Header */}
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#fff' }}>Tactical Board</h2>
                        <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.9rem' }}>Plan your plays with the active squad</p>
                    </div>
                </div>

                {/* Systems Archive Strip */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={16} color="#DB0A40" /> Full Court Systems
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#666' }}>Archive of 5v5 transition and offensive systems.</p>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                            {strategies.filter(s => s.type === 'full').length} Systems Available
                        </div>
                    </div>

                    <div className="full-custom-scroll" style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '10px' }}>
                        {strategies.filter(s => s.type === 'full').length === 0 ? (
                            <div style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem', width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                No full court systems created yet. Go to Strategy page to build your playbook.
                            </div>
                        ) : (
                            strategies.filter(s => s.type === 'full').map(s => {
                                const isSelected = s.id === selectedStrategyId;
                                return (
                                    <div
                                        key={s.id}
                                        onClick={() => loadStrategy(s)}
                                        style={{
                                            flex: '0 0 200px',
                                            height: '120px',
                                            position: 'relative',
                                            background: '#222',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            border: isSelected ? '2px solid #DB0A40' : '1px solid rgba(255,255,255,0.1)',
                                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                            boxShadow: isSelected ? '0 0 15px rgba(219, 10, 64, 0.3)' : '0 4px 6px rgba(0,0,0,0.2)',
                                            transform: isSelected ? 'translateY(-2px)' : 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.borderColor = '#DB0A40';
                                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(219, 10, 64, 0.15)';
                                                e.currentTarget.querySelector('.play-overlay').style.opacity = 1;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
                                                e.currentTarget.querySelector('.play-overlay').style.opacity = 0;
                                            }
                                        }}
                                    >
                                        <MiniCourtPreview tactic={s} />

                                        {/* Content Gradient */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            width: '100%',
                                            padding: '10px',
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 80%, transparent 100%)',
                                            zIndex: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end'
                                        }}>
                                            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{s.name}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                                <span style={{ fontSize: '0.7rem', color: '#aaa', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>5v5 Full</span>
                                                <span style={{ fontSize: '0.7rem', color: '#666' }}>{(s.data || []).length} Frames</span>
                                            </div>
                                        </div>

                                        {/* Play Overlay Icon */}
                                        <div className="play-overlay" style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '40px',
                                            height: '40px',
                                            background: 'rgba(219, 10, 64, 0.9)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 3,
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            color: '#fff',
                                            boxShadow: '0 0 15px rgba(219, 10, 64, 0.5)'
                                        }}>
                                            <FolderOpen size={18} fill="#fff" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', height: '600px' }}>
                {/* Sidebar: Summoned Squad */}
                <div style={{ width: '250px', borderRight: '1px solid rgba(255,255,255,0.05)', background: '#111', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#aaa', textTransform: 'uppercase' }}>Summoned Squad</h3>
                    </div>
                    <div className="full-custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {summonedPlayers.map(player => {
                            const onCourt = isPlayerOnCourt(player.id);
                            const isStarter = starters && starters.includes(player.id);
                            return (
                                <div
                                    key={player.id}
                                    onClick={() => !onCourt && handleAddPlayer(player)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '8px',
                                        background: onCourt ? 'rgba(76, 209, 55, 0.1)' : (isStarter ? 'rgba(252, 211, 77, 0.05)' : 'rgba(255,255,255,0.03)'),
                                        border: isStarter ? '1px solid #fcd34d' : (onCourt ? '1px solid rgba(76, 209, 55, 0.3)' : '1px solid rgba(255,255,255,0.05)'),
                                        borderRadius: '8px',
                                        cursor: onCourt ? 'default' : 'pointer',
                                        opacity: onCourt ? 0.6 : 1,
                                        boxShadow: isStarter ? '0 0 5px rgba(252, 211, 77, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: '#000', border: isStarter ? '1px solid #fcd34d' : 'none' }}>
                                        <img src={player.photo_url || "/assets/players/default.png"} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.85rem', color: isStarter ? '#fcd34d' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isStarter ? '600' : 'normal' }}>
                                            {player.name} {isStarter && '★'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>#{player.jersey_number}</div>
                                    </div>
                                    {onCourt && <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#4cd137' }}></div>}
                                </div>
                            );
                        })}

                        {/* Ball Token */}
                        <div
                            onClick={handleAddBall}
                            style={{
                                marginTop: '1rem',
                                padding: '8px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                color: '#fff'
                            }}
                        >
                            Add Ball 🏀
                        </div>

                        {/* Defense Players - Generic */}
                        <div style={{ marginTop: '1.5rem', padding: '0 5px' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Opposition Units</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {[1, 2, 3, 4, 5].map(num => {
                                    const active = currentTokens.some(t => t.type === 'defense' && t.label === `D${num}`);
                                    return (
                                        <div
                                            key={num}
                                            onClick={() => !active && handleAddDefense(num)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: '#111',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                color: '#fff',
                                                cursor: active ? 'default' : 'pointer',
                                                opacity: active ? 0.3 : 1
                                            }}
                                        >
                                            D{num}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Court Area */}
                <div style={{ flex: 1, position: 'relative', background: '#1a1a1a', display: 'flex', flexDirection: 'column' }}>

                    {/* Toolbar */}
                    <div style={{ padding: '10px', background: '#151515', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <div className="tools-group" style={{ background: '#222', borderRadius: '6px', padding: '4px' }}>
                            <button className={`tool-btn ${mode === 'move' ? 'active' : ''}`} onClick={() => setMode('move')}><Move size={18} /></button>
                            <button className={`tool-btn ${mode === 'draw' ? 'active' : ''}`} onClick={() => setMode('draw')}><Pencil size={18} /></button>
                            <button className={`tool-btn ${mode === 'erase' ? 'active' : ''}`} onClick={() => setMode('erase')}><Eraser size={18} /></button>
                        </div>
                        <div className="tools-group" style={{ background: '#222', borderRadius: '6px', padding: '4px', display: 'flex', alignItems: 'center' }}>
                            <button className="tool-btn" onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}><SkipBack size={18} /></button>
                            <button className="tool-btn" onClick={togglePlay}>{isPlaying ? <Pause size={18} /> : <Play size={18} />}</button>
                            <button className="tool-btn" onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}><SkipForward size={18} /></button>
                            <span style={{ fontSize: '0.8rem', color: '#888', margin: '0 8px' }}>{currentFrameIndex + 1}/{frames.length}</span>
                            <button className="tool-btn" onClick={addFrame}><Plus size={18} /></button>
                        </div>
                        <div className="tools-group" style={{ background: '#222', borderRadius: '6px', padding: '4px' }}>
                            <button className="tool-btn" onClick={handleUndo} disabled={history.length === 0} title="Undo last action"><Undo2 size={18} /></button>
                            <button className="tool-btn" onClick={handleReset} title="Reset Board (Clear all)"><RotateCcw size={18} /></button>
                            <button className="tool-btn" onClick={deleteFrame}><Trash2 size={18} /></button>
                            <button className="tool-btn" onClick={handleSaveClick}><Save size={18} /></button>
                        </div>
                        {pendingSubstitute && (
                            <div style={{
                                position: 'absolute',
                                top: '60px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#ff3131',
                                color: '#fff',
                                padding: '8px 16px',
                                borderRadius: '30px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                zIndex: 100,
                                boxShadow: '0 4px 15px rgba(255, 49, 49, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span>REPLACING WITH {pendingSubstitute.newPlayer.name.toUpperCase()}</span>
                                <X size={14} style={{ cursor: 'pointer' }} onClick={() => setPendingSubstitute(null)} />
                            </div>
                        )}
                    </div>

                    <div
                        className="interactive-court"
                        ref={courtRef}
                        onMouseDown={handleBoardMouseDown}
                        style={{ flex: 1, position: 'relative', cursor: mode === 'draw' ? 'crosshair' : 'default' }}
                    >
                        {/* Drawing Layer */}
                        <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                            {currentPaths.map((d, i) => (
                                <g key={i} onMouseEnter={(e) => handlePathHover(i, e)} onMouseDown={(e) => handlePathClick(i, e)} style={{ pointerEvents: mode === 'erase' ? 'auto' : 'none', cursor: mode === 'erase' ? 'pointer' : 'default' }}>
                                    <path d={d} stroke="transparent" strokeWidth="20" fill="none" />
                                    <path d={d} stroke={mode === 'erase' ? '#ff4d4d' : '#fcd34d'} strokeWidth="4" fill="none" strokeLinecap="round" style={{ opacity: 0.8 }} />
                                </g>
                            ))}
                            {currentPath && <path d={currentPath} stroke="#fcd34d" strokeWidth="4" fill="none" strokeLinecap="round" style={{ opacity: 0.5 }} />}
                        </svg>

                        {/* SVG Court Background */}
                        <svg viewBox="0 0 1000 560" style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}>
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

                        {/* Tokens */}
                        {currentTokens.map(token => (
                            <div
                                key={token.id}
                                style={{
                                    position: 'absolute',
                                    top: `${token.y}%`,
                                    left: `${token.x}%`,
                                    width: token.type === 'ball' ? '30px' : '40px',
                                    height: token.type === 'ball' ? '30px' : '40px',
                                    transform: 'translate(-50%, -50%)',
                                    cursor: mode === 'move' ? (draggingId === token.id ? 'grabbing' : 'grab') : 'default',
                                    zIndex: draggingId === token.id ? 10 : 2,
                                    pointerEvents: mode === 'move' ? 'auto' : 'none',
                                    transition: draggingId === token.id ? 'none' : (isPlaying ? 'all 800ms ease' : 'all 300ms ease'),
                                    fontSize: token.type === 'ball' ? '1.5rem' : '0',
                                    outline: (pendingSubstitute && token.type === 'player') ? '3px solid #ff3131' : 'none',
                                    borderRadius: '50%'
                                }}
                                onMouseDown={(e) => handleTokenMouseDown(e, token)}
                            >
                                {token.type === 'ball' ? token.label : token.type === 'player' ? (
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #fff', overflow: 'hidden', background: '#000', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', position: 'relative' }}>
                                        <img src={token.photo || "/assets/players/default.png"} alt={token.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', textAlign: 'center', fontWeight: 'bold' }}>#{token.number}</div>
                                    </div>
                                ) : (
                                    <div className={`player-token ${token.type === 'offense' ? 'p-offense' : token.type === 'defense' ? 'p-defense' : 'p-ball'}`} style={{ position: 'relative', top: 'auto', left: 'auto', transform: 'none', width: '100%', height: '100%' }}>
                                        {token.label}
                                    </div>
                                )}
                                {/* Right click remove handler overlay */}
                                <div
                                    onContextMenu={(e) => { e.preventDefault(); removeToken(token.id); }}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    title="Right Click to Remove"
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Modal - Step 1: Name */}
            {showSaveModal && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
                    <div className="dashboard-card" style={{ width: '400px', maxWidth: '90%', border: '1px solid rgba(255,49,49,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, border: 'none', color: '#fff' }}>Save Setup</h2>
                            <button onClick={() => setShowSaveModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <input type="text" value={tacticName} onChange={(e) => setTacticName(e.target.value)} placeholder="Name of this play..." maxLength={50} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={finalizeSaveStrategy} className="control-btn btn-save" style={{ background: '#ff3131' }}>SAVE STRATEGY</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}


        </div>
    );
};

export default MatchTacticsBoard;
