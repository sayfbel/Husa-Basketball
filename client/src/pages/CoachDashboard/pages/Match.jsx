import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import MatchTacticsBoard from './MatchTacticsBoard';
import '../../../css/dashboard.css';

const Match = () => {
    const { showNotification } = useNotification?.() || { showNotification: (msg) => console.log(msg) };
    const [players, setPlayers] = useState([]);

    // Match State
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [activeMatch, setActiveMatch] = useState(null); // The match currently being managed
    const [error, setError] = useState(null);

    // Squad State
    const [selectedPlayers, setSelectedPlayers] = useState([]); // Array of player IDs (The Squad)
    const [starters, setStarters] = useState([]); // Array of player IDs (The First 5)
    const [isSquadConfirmed, setIsSquadConfirmed] = useState(false);

    // Strategy State
    const [fullCourtStrategies, setFullCourtStrategies] = useState([]);
    const [activeStrategyId, setActiveStrategyId] = useState(null);

    useEffect(() => {
        fetchPlayers();
        fetchScrapedMatches();
        fetchStrategies();
    }, []);

    const fetchPlayers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/players');
            setPlayers(res.data);
        } catch (err) {
            console.error("Error fetching players:", err);
        }
    };

    const fetchScrapedMatches = async () => {
        setLoadingMatches(true);
        try {
            const res = await axios.get('http://localhost:5000/api/matches/scrape');
            if (res.data && Array.isArray(res.data)) {
                setMatches(res.data);
            } else {
                setMatches([]);
            }
        } catch (err) {
            console.error("Error scraping matches:", err);
            setError("Could not load match data from federation site.");
        } finally {
            setLoadingMatches(false);
        }
    };

    const fetchStrategies = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/strategies');
            setFullCourtStrategies(res.data);
        } catch (err) {
            console.error("Error fetching strategies:", err);
        }
    };

    // --- Actions ---

    const handleSelectMatch = (match) => {
        setActiveMatch(match);
        // Reset state for new match
        setSelectedPlayers([]);
        setStarters([]);
        setIsSquadConfirmed(false);
        setActiveStrategyId(null);
        showNotification(`Managing squad for vs ${match.home.includes('HUSA') ? match.away : match.home}`, 'info');
        // Scroll to squad section
        document.getElementById('squad-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSummon = (playerId) => {
        if (isSquadConfirmed) return;
        if (selectedPlayers.length >= 12) {
            showNotification("You can only select 12 players for the match squad.", "warning");
            return;
        }
        setSelectedPlayers(prev => [...prev, playerId]);
    };

    const handleDismiss = (playerId) => {
        if (isSquadConfirmed) return;
        setSelectedPlayers(prev => prev.filter(id => id !== playerId));
        if (starters.includes(playerId)) {
            setStarters(prev => prev.filter(id => id !== playerId));
        }
    };

    const handleConfirmSquad = () => {
        if (selectedPlayers.length === 0) {
            showNotification("Please select at least one player.", "warning");
            return;
        }
        setIsSquadConfirmed(true);
        showNotification("Squad confirmed. Now select your Starting 5.", "success");
    };

    const handleEditSquad = () => {
        setIsSquadConfirmed(false);
        setStarters([]);
    };

    const toggleStarter = (playerId) => {
        if (starters.includes(playerId)) {
            setStarters(prev => prev.filter(id => id !== playerId));
        } else {
            if (starters.length >= 5) {
                showNotification("Create your Starting 5 (Max 5 players).", "warning");
                return;
            }
            setStarters(prev => [...prev, playerId]);
        }
    };

    const handleSaveMatchSetup = async () => {
        if (!activeMatch) return;

        try {
            const payload = {
                matchData: activeMatch, // Pass the full scraped object
                matchId: null, // Scraped matches don't have our IDs initially
                squad: selectedPlayers,
                starters: starters,
                strategyId: activeStrategyId // Passed from Tactics Board if integrated, or null
            };

            const res = await axios.post('http://localhost:5000/api/matches/save', payload);
            showNotification("Match setup saved successfully!", "success");
        } catch (err) {
            console.error(err);
            showNotification("Failed to save match setup.", "error");
        }
    };

    const availablePlayers = players.filter(p => !selectedPlayers.includes(p.id));
    const summonedPlayers = players.filter(p => selectedPlayers.includes(p.id));

    const PlayerCard = ({ player, action, actionIcon, variant, isStarter }) => (
        <div
            onClick={() => action && action(player.id)}
            className={`player-card-interactive ${isStarter ? 'starter-glow' : ''}`}
            style={{
                position: 'relative',
                background: variant === 'summoned' || variant === 'starter'
                    ? 'linear-gradient(135deg, rgba(219, 10, 64, 0.15) 0%, rgba(20, 20, 20, 0.8) 100%)'
                    : 'rgba(255,255,255,0.03)',
                border: isStarter ? '2px solid #fcd34d' : (variant === 'summoned' ? '1px solid rgba(219, 10, 64, 0.4)' : '1px solid rgba(255,255,255,0.08)'),
                borderRadius: '12px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.8rem',
                minHeight: '180px',
                boxShadow: isStarter ? '0 0 15px rgba(252, 211, 77, 0.2)' : 'none',
                opacity: (isSquadConfirmed && variant === 'available') ? 0.5 : 1
            }}
        >
            {/* Action Badge */}
            <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: isStarter ? '#fcd34d' : (variant === 'summoned' ? '#DB0A40' : 'rgba(255,255,255,0.1)'),
                color: isStarter ? '#000' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '1.2rem',
                lineHeight: 1
            }}>
                {actionIcon}
            </div>

            {/* Jersey Number */}
            <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                #{player.jersey_number}
            </div>

            {/* Starter Label */}
            {isStarter && (
                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fcd34d',
                    color: '#000',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    zIndex: 2,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>
                    STARTER
                </div>
            )}

            {/* Player Image */}
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                padding: '3px',
                background: isStarter
                    ? 'linear-gradient(45deg, #fcd34d, #f59e0b)'
                    : (variant === 'summoned' ? 'linear-gradient(45deg, #DB0A40, #ff4d4d)' : 'linear-gradient(45deg, #444, #666)'),
                marginTop: '0.5rem'
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                    position: 'relative'
                }}>
                    <img
                        src={player.photo_url || "/assets/players/default.png"}
                        alt={player.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "/assets/players/default.png"; }}
                    />
                </div>
            </div>

            {/* Info */}
            <div style={{ width: '100%' }}>
                <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '0.95rem',
                    color: '#fff',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {player.name}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>
                    {player.position}
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-grid-vertical" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* 1. Schedule & Match Selection */}
            <div className="dashboard-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#fff' }}>Match Schedule</h2>
                        <p style={{ color: '#888', fontSize: '0.9rem', margin: '5px 0 0 0' }}>Select a match to manage the squad and strategy.</p>
                    </div>
                    <button
                        onClick={fetchScrapedMatches}
                        disabled={loadingMatches}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        {loadingMatches ? 'Syncing...' : 'Refresh Schedule'}
                    </button>
                </div>

                {matches.length > 0 ? (
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#ccc' }}>Match Details</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#ccc' }}>Date</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: '#ccc' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((match, idx) => {
                                    const isHome = match.home.includes('HUSA') || match.home.includes('Hassania');
                                    const isActive = activeMatch === match; // Simple object reference check for scraped data
                                    return (
                                        <tr key={idx} style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            background: isActive ? 'rgba(219, 10, 64, 0.1)' : 'transparent'
                                        }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: isHome ? '700' : '400', color: isHome ? '#DB0A40' : '#fff' }}>{match.home}</span>
                                                    <span style={{ color: '#555' }}>vs</span>
                                                    <span style={{ fontWeight: !isHome ? '700' : '400', color: !isHome ? '#DB0A40' : '#fff' }}>{match.away}</span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>{match.venue}</div>
                                            </td>
                                            <td style={{ padding: '12px', color: '#aaa' }}>
                                                <div>{match.date}</div>
                                                <div style={{ fontSize: '0.8rem' }}>{match.time}</div>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleSelectMatch(match)}
                                                    style={{
                                                        background: isActive ? '#DB0A40' : 'transparent',
                                                        border: isActive ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                                        color: '#fff',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        fontWeight: isActive ? 'bold' : 'normal',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {isActive ? 'Managing' : 'Select'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No matches found.</div>
                )}
            </div>

            {/* 2. Squad Management Section (Only visible if match selected) */}
            {activeMatch && (
                <div id="squad-section" className="dashboard-card animate-fade-in" style={{ padding: '1.5rem', border: '1px solid rgba(219, 10, 64, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ margin: 0, color: '#fff' }}>Squad & Lineup</h2>
                            <p style={{ color: '#DB0A40', margin: '4px 0 0 0', fontWeight: 'bold' }}>
                                vs {activeMatch.home.includes('HUSA') ? activeMatch.away : activeMatch.home}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {!isSquadConfirmed ? (
                                <button
                                    onClick={handleConfirmSquad}
                                    style={{
                                        background: '#DB0A40',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 12px rgba(219, 10, 64, 0.4)'
                                    }}
                                >
                                    Confirm Squad ({selectedPlayers.length})
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ color: '#4cd137', fontWeight: 'bold', fontSize: '0.9rem' }}>Squad Locked</span>
                                    <button
                                        onClick={handleEditSquad}
                                        style={{ background: 'transparent', border: '1px solid #666', color: '#aaa', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleSaveMatchSetup}
                                        style={{
                                            background: '#fcd34d',
                                            color: '#000',
                                            border: 'none',
                                            padding: '10px 24px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 12px rgba(252, 211, 77, 0.3)'
                                        }}
                                    >
                                        Save All
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="squad-builder-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                        {/* LEFT: Player Selection (Hidden if confirmed to focus on starters?) No, let's keep it visible but dimmed if confirmed */}
                        <div className="list-column" style={{ opacity: isSquadConfirmed ? 0.4 : 1, pointerEvents: isSquadConfirmed ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', color: '#aaa' }}>Available Pool</h3>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{availablePlayers.length}</span>
                            </div>
                            <div className="players-grid full-custom-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
                                {availablePlayers.map(p => (
                                    <PlayerCard
                                        key={p.id}
                                        player={p}
                                        action={handleSummon}
                                        actionIcon="+"
                                        variant="available"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Summoned & Starters */}
                        <div className="list-column">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>
                                        {isSquadConfirmed ? "Select Starting 5" : "Summoned Squad"}
                                    </h3>
                                    {isSquadConfirmed && <span style={{ fontSize: '0.75rem', color: '#fcd34d' }}>Click to toggle starter status</span>}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ background: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#fff' }}>
                                        Total: {selectedPlayers.length}/12
                                    </div>
                                    {isSquadConfirmed && (
                                        <div style={{ background: starters.length === 5 ? '#fcd34d' : '#333', color: starters.length === 5 ? '#000' : '#fcd34d', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            Starters: {starters.length}/5
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="players-grid full-custom-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
                                {summonedPlayers.map(p => (
                                    <PlayerCard
                                        key={p.id}
                                        player={p}
                                        // If confirmed, action is toggleStarter. If not, action is dismiss.
                                        action={isSquadConfirmed ? toggleStarter : handleDismiss}
                                        actionIcon={isSquadConfirmed ? (starters.includes(p.id) ? '★' : '☆') : '−'}
                                        variant="summoned"
                                        isStarter={starters.includes(p.id)}
                                    />
                                ))}
                                {summonedPlayers.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#555', fontStyle: 'italic', padding: '2rem' }}>Add players from the pool.</p>}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* 3. Strategy Board (Only if squad is confirmed) */}
            {isSquadConfirmed && summonedPlayers.length > 0 && (
                <div className="animate-slide-up">
                    <div className="section-header-row" style={{ marginTop: '3rem', marginBottom: '1rem' }}>
                        <div className="role-tag coach-tag">System</div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Strategy Board</h2>
                    </div>

                    <MatchTacticsBoard
                        summonedPlayers={summonedPlayers}
                        starters={starters}
                        strategies={fullCourtStrategies}
                        showNotification={showNotification}
                        // Optional: Pass function to let board notify parent of active strategy
                        onStrategyLoaded={(id) => setActiveStrategyId(id)}
                    />
                </div>
            )}
        </div>
    );
};


export default Match;
