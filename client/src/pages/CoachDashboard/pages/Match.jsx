import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import MatchTacticsBoard from './MatchTacticsBoard';
import '../../../css/dashboard.css';

import { Search, User, Users, Shield } from 'lucide-react'; // Added icons

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
    const [starters, setStarters] = useState([null, null, null, null, null]); // Array of 5 player IDs (Positions 1-5)
    const [activePosition, setActivePosition] = useState(0); // 0-4 (corresponds to Pos 1-5)
    const [isSquadConfirmed, setIsSquadConfirmed] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // Added search term

    // Strategy State
    const [fullCourtStrategies, setFullCourtStrategies] = useState([]);
    const [activeStrategyId, setActiveStrategyId] = useState(null);
    const [selectedBriefingStrategies, setSelectedBriefingStrategies] = useState([]); // Array of IDs for the final briefing

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
        setStarters([null, null, null, null, null]);
        setActivePosition(0);
        setIsSquadConfirmed(false);
        setActiveStrategyId(null);
        setSelectedBriefingStrategies([]);
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
        setStarters(prev => prev.map(id => id === playerId ? null : id));
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
        setStarters([null, null, null, null, null]);
        setActivePosition(0);
    };

    const toggleStarter = (playerId) => {
        // If player is already a starter, remove them from whatever position they are in
        if (starters.includes(playerId)) {
            setStarters(prev => prev.map(id => id === playerId ? null : id));
            return;
        }

        // If not a starter, assign to activePosition
        const newStarters = [...starters];

        // If activePosition already has a player, it will be replaced
        newStarters[activePosition] = playerId;
        setStarters(newStarters);

        // Security/UX: Scroll to tactical board when all starters are selected
        if (newStarters.every(id => id !== null)) {
            setTimeout(() => {
                document.getElementById('tactical-board-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }

        // Auto-advance activePosition to next empty slot or loop
        const nextPosition = [0, 1, 2, 3, 4].find(i => newStarters[i] === null);
        if (nextPosition !== undefined) {
            setActivePosition(nextPosition);
        }
    };

    const handleSaveMatchSetup = async () => {
        if (!activeMatch) return;

        try {
            const payload = {
                matchData: activeMatch,
                matchId: null,
                squad: selectedPlayers,
                starters: starters.filter(id => id !== null),
                strategyIds: selectedBriefingStrategies // Array of IDs
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



    return (
        <div className="dashboard-grid-vertical" style={{ display: 'flex', padding: '3rem 0', flexDirection: 'column', gap: '2rem' }}>

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
                    <div className="full-custom-scroll" style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px 0 20px 0' }}>
                        {matches.map((match, idx) => {
                            const isHome = match.home.includes('HUSA') || match.home.includes('Hassania');
                            const isActive = activeMatch === match;

                            // Parse date if possible, otherwise use string
                            let dateDisplay = match.date;
                            try {
                                const d = new Date(match.date && match.date.includes('/') ? match.date.split('/').reverse().join('-') : match.date);
                                if (!isNaN(d.getTime())) {
                                    const day = String(d.getDate()).padStart(2, '0');
                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                    const year = d.getFullYear();
                                    dateDisplay = `${day}/${month}/${year}`;
                                }
                            } catch (e) { /* ignore */ }

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectMatch(match)}
                                    className={`match-card-interactive ${isActive ? 'active-match-card' : ''}`}
                                    style={{
                                        flex: '0 0 280px',
                                        background: isActive ? 'linear-gradient(135deg, rgba(219, 10, 64, 0.1) 0%, rgba(20,20,20,0.9) 100%)' : '#1e1e1e',
                                        border: isActive ? '2px solid #DB0A40' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        boxShadow: isActive ? '0 10px 30px rgba(219, 10, 64, 0.2)' : '0 4px 6px rgba(0,0,0,0.2)',
                                        transform: isActive ? 'translateY(-4px)' : 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
                                        }
                                    }}
                                >
                                    {/* Date Badge */}
                                    <div style={{
                                        alignSelf: 'flex-start',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        color: '#aaa',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        {dateDisplay}
                                    </div>

                                    {/* Teams */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: isHome ? '800' : '500', color: isHome ? '#fff' : '#ccc' }}>
                                                {match.home}
                                            </span>
                                            {isHome && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DB0A40' }}></div>}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>VS</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: !isHome ? '800' : '500', color: !isHome ? '#fff' : '#ccc' }}>
                                                {match.away}
                                            </span>
                                            {!isHome && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DB0A40' }}></div>}
                                        </div>
                                    </div>

                                    {/* Action Status */}
                                    <div style={{
                                        marginTop: 'auto',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '0.8rem', color: isActive ? '#DB0A40' : '#666', fontWeight: '600' }}>
                                            {isActive ? 'Currently Managing' : 'Click to Manage'}
                                        </span>
                                        {isActive && <Shield size={16} color="#DB0A40" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No matches found.</div>
                )}
            </div>

            {/* 2. Squad Management Section (Only visible if match selected) */}
            {activeMatch && (
                <div id="squad-section" className="dashboard-card animate-fade-in" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(219, 10, 64, 0.3)' }}>
                    {/* Header */}
                    <div style={{ padding: '1.5rem', background: 'rgba(219, 10, 64, 0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>Match Preparation</h2>
                                <p style={{ color: '#aaa', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                                    vs <span style={{ color: '#DB0A40', fontWeight: 'bold' }}>{activeMatch.home.includes('HUSA') ? activeMatch.away : activeMatch.home}</span>
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {isSquadConfirmed && (
                                    <>
                                        <button
                                            onClick={handleEditSquad}
                                            style={{ background: 'transparent', border: '1px solid #666', color: '#aaa', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            Back to Squad
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
                                            Save Setup
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '2rem' }}>
                        {/* Stepper */}
                        <div className="stepper-container">
                            <div className={`step-item ${!isSquadConfirmed ? 'active' : 'completed'}`}>
                                <div className="step-circle">1</div>
                                <div className="step-label">Summon Squad</div>
                            </div>
                            <div style={{ width: '100px', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '0 1rem' }}>
                                <div style={{ height: '100%', width: isSquadConfirmed ? '100%' : '0%', background: '#4cd137', transition: 'all 0.5s' }} />
                            </div>
                            <div className={`step-item ${isSquadConfirmed ? 'active' : ''}`}>
                                <div className="step-circle">2</div>
                                <div className="step-label">Starting 5</div>
                            </div>
                        </div>

                        {/* STEP 1: SQUAD SELECTION */}
                        {!isSquadConfirmed && (
                            <div className="squad-selection-container animate-fade-in">
                                {/* Left: Player Pool */}
                                <div className="player-pool-sidebar">
                                    <div className="pool-search">
                                        <div style={{ position: 'relative' }}>
                                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                                            <input
                                                type="text"
                                                placeholder="Search players..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                style={{ paddingLeft: '34px' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="pool-list full-custom-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gridAutoRows: 'max-content', alignContent: 'start', gap: '10px', padding: '10px' }}>
                                        {availablePlayers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                            <div
                                                key={p.id}
                                                className="pool-player-card animate-scale-in"
                                                onClick={() => handleSummon(p.id)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: '12px',
                                                    padding: '1rem 0.5rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',

                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    textAlign: 'center',
                                                    position: 'relative',
                                                    transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.borderColor = '#4cd137';
                                                    e.currentTarget.style.background = 'rgba(76, 209, 55, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                }}
                                            >
                                                {/* Plus Icon Overlay */}
                                                <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#4cd137', opacity: 0.5 }}>
                                                    <Users size={12} />
                                                </div>

                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: '#000', border: '2px solid rgba(255,255,255,0.1)' }}>
                                                    <img src={p.photo_url || "/assets/players/default.png"} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ width: '100%' }}>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name.split(' ')[0]}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name.split(' ').slice(1).join(' ')}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>#{p.jersey_number} • {p.position}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {availablePlayers.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1rem', color: '#666' }}>No available players.</div>}
                                    </div>
                                </div>

                                {/* Right: The Squad Grid */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Summoned Squad ({selectedPlayers.length}/12)</h3>
                                        {selectedPlayers.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    if (selectedPlayers.length === 0) {
                                                        showNotification("Select players first", "warning");
                                                        return;
                                                    }
                                                    handleConfirmSquad();
                                                }}
                                                className="animate-pulse"
                                                style={{
                                                    background: '#DB0A40',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '8px 24px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Next: Select Starters &rarr;
                                            </button>
                                        )}
                                    </div>
                                    <div className="squad-grid-view full-custom-scroll" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', flex: 1 }}>
                                        {/* Render 12 Slots */}
                                        {Array.from({ length: 12 }).map((_, idx) => {
                                            const player = summonedPlayers[idx];
                                            return (
                                                <div key={idx} className={`squad-slot ${player ? 'filled' : ''}`} onClick={() => player && handleDismiss(player.id)}>
                                                    {player ? (
                                                        <div className="slot-player-content">
                                                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', marginBottom: '0.5rem' }}>
                                                                <img src={player.photo_url || "/assets/players/default.png"} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.2' }}>{player.name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>#{player.jersey_number}</div>

                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '5px',
                                                                right: '5px',
                                                                background: 'rgba(0,0,0,0.5)',
                                                                borderRadius: '50%',
                                                                width: '20px',
                                                                height: '20px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.8rem',
                                                                opacity: 0
                                                            }}>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span>{idx + 1}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: STARTER SELECTION */}
                        {isSquadConfirmed && (
                            <div className="starter-selection-container animate-fade-in">
                                {/* Top: Court Stage */}
                                <div className="court-stage">
                                    {/* SVG Background */}
                                    <div className="court-bg-svg">
                                        <svg viewBox="0 0 1000 500" width="100%" height="100%">
                                            {/* Half Court simplified */}
                                            <rect width="1000" height="500" fill="#1a1a1a" />
                                            <path d="M 50,450 L 950,450" stroke="#444" strokeWidth="2" /> {/* Baseline */}
                                            <path d="M 50,450 L 50,50 L 950,50 L 950,450" fill="none" stroke="#444" strokeWidth="2" />
                                            <path d="M 200,450 L 200,260 L 800,260 L 800,450" fill="none" stroke="#444" strokeWidth="2" /> {/* Paint */}
                                            <path d="M 500,260 A 100,100 0 0 1 500,450" fill="none" stroke="#444" strokeWidth="2" /> {/* FT Circle */}
                                            <path d="M 50,450 A 400,400 0 0 1 950,450" fill="none" stroke="#666" strokeWidth="3" /> {/* 3PT Line */}
                                        </svg>
                                    </div>

                                    <div className="starters-slots-container">
                                        {/* 5 Slots for Starters */}
                                        {Array.from({ length: 5 }).map((_, idx) => {
                                            const starterId = starters[idx];
                                            const starter = players.find(p => p.id === starterId);
                                            const isActive = activePosition === idx;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`starter-slot-fancy ${!starter ? 'empty' : ''} ${isActive ? 'active-slot' : ''}`}
                                                    onClick={() => setActivePosition(idx)}
                                                    style={{
                                                        border: isActive ? '3px solid #fcd34d' : '2px dashed rgba(252, 211, 77, 0.3)',
                                                        background: isActive ? 'rgba(252, 211, 77, 0.15)' : (starter ? 'rgba(252, 211, 77, 0.1)' : 'rgba(255, 255, 255, 0.05)'),
                                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                                        position: 'relative',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'visible',
                                                        boxShadow: isActive ? '0 0 20px rgba(252, 211, 77, 0.2)' : 'none'
                                                    }}
                                                >
                                                    {/* Large Position Number Background */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        fontSize: '6rem',
                                                        fontWeight: '950',
                                                        color: '#fcd34d',
                                                        opacity: starter ? 0.1 : 0.2,
                                                        lineHeight: 1,
                                                        pointerEvents: 'none',
                                                        zIndex: 0,
                                                        fontFamily: '"Impact", "Oswald", sans-serif',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        {idx + 1}
                                                    </div>

                                                    {starter ? (
                                                        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%' }}>
                                                            {/* Remove Button */}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleStarter(starterId); }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '-15px',
                                                                    right: '5px',
                                                                    background: 'rgba(219, 10, 64, 0.8)',
                                                                    border: 'none',
                                                                    color: '#fff',
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    borderRadius: '50%',
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                &times;
                                                            </button>

                                                            <div style={{ width: '75px', height: '75px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #fcd34d', marginBottom: '8px', boxShadow: '0 0 15px rgba(252, 211, 77, 0.4)' }}>
                                                                <img src={starter.photo_url || "/assets/players/default.png"} alt={starter.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff', textAlign: 'center', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{starter.name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#fcd34d', fontWeight: 'bold' }}>#{starter.jersey_number}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', marginTop: '2px', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>Pos {idx + 1}</div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ zIndex: 1, textAlign: 'center' }}>
                                                            <div style={{ color: '#fcd34d', fontSize: '2.5rem', fontWeight: '900', lineHeight: 1 }}>{idx + 1}</div>
                                                            <div style={{ color: '#fcd34d', opacity: 0.6, fontSize: '0.7rem', fontWeight: 'bold', marginTop: '5px' }}>SELECT PLAYER</div>
                                                        </div>
                                                    )}

                                                    {isActive && (
                                                        <div className="animate-pulse" style={{
                                                            position: 'absolute',
                                                            bottom: '-12px',
                                                            background: '#fcd34d',
                                                            color: '#000',
                                                            padding: '4px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.65rem',
                                                            fontWeight: '900',
                                                            textTransform: 'uppercase',
                                                            boxShadow: '0 4px 10px rgba(252, 211, 77, 0.4)',
                                                            zIndex: 2
                                                        }}>
                                                            ACTIVE POS
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', textAlign: 'center', pointerEvents: 'none' }}>
                                        <h3 style={{ margin: 0, color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.8 }}>Starting V</h3>
                                    </div>
                                </div>

                                {/* Bottom: Bench */}
                                <div className="bench-section">
                                    <h3 style={{ margin: 0, color: '#aaa', fontSize: '1rem', textTransform: 'uppercase' }}>Bench Rotation ({selectedPlayers.filter(id => !starters.includes(id)).length})</h3>
                                    <div className="bench-carousel full-custom-scroll">
                                        {summonedPlayers.filter(p => !starters.includes(p.id)).map(p => (
                                            <div
                                                key={p.id}
                                                className="bench-card"
                                                onClick={() => toggleStarter(p.id)}
                                            >
                                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', marginBottom: '8px', border: '2px solid rgba(255,255,255,0.1)' }}>
                                                    <img src={p.photo_url || "/assets/players/default.png"} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#888' }}>#{p.jersey_number}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#666', textAlign: 'center', textTransform: 'uppercase' }}>{p.position}</div>
                                            </div>
                                        ))}
                                        {summonedPlayers.filter(p => !starters.includes(p.id)).length === 0 && (
                                            <div style={{ padding: '1rem', color: '#666', fontStyle: 'italic' }}>Everyone is starting? Add more players to squad.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 3. Strategy Board (Only if squad is confirmed) */}
            {isSquadConfirmed && summonedPlayers.length > 0 && (
                <div id="tactical-board-section" className="animate-slide-up">
                    <div className="section-header-row" style={{ marginTop: '3rem', marginBottom: '1rem' }}>
                        <div className="role-tag coach-tag">System</div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Tactical Board</h2>
                    </div>

                    <MatchTacticsBoard
                        summonedPlayers={summonedPlayers}
                        starters={starters}
                        strategies={fullCourtStrategies}
                        showNotification={showNotification}
                        fetchStrategies={fetchStrategies}
                        // Optional: Pass function to let board notify parent of active strategy
                        onStrategyLoaded={(id) => setActiveStrategyId(id)}
                    />
                </div>
            )}

            {/* 4. Tactical Briefing & Transmission */}
            {isSquadConfirmed && starters.every(id => id !== null) && (
                <div id="briefing-section" className="animate-fade-in" style={{ marginTop: '4rem', paddingBottom: '5rem' }}>
                    <div className="section-header-row" style={{ marginBottom: '2rem' }}>
                        <div className="role-tag coach-tag">Briefing</div>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Tactical Briefing & Deployment</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#888' }}>Finalize the package to be transmitted to the squad.</p>
                    </div>

                    <div className="briefing-container shadow-premium" style={{ background: '#111', borderRadius: '24px', padding: '2.5rem', border: '1px solid rgba(255,215,0,0.1)' }}>
                        <div className="briefing-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>

                            {/* Left Side: The Selection Review */}
                            <div className="briefing-selection-review">
                                <h3 style={{ color: '#ffd700', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Shield size={18} /> Official Starting Five
                                </h3>
                                <div className="briefing-starters-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '3rem' }}>
                                    {starters.map((id, idx) => {
                                        const p = players.find(player => player.id === id);
                                        return (
                                            <div key={idx} style={{ textAlign: 'center', background: 'rgba(255,215,0,0.03)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,215,0,0.1)' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', border: '2px solid #ffd700' }}>
                                                    <img src={p?.photo_url || '/assets/players/default.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>{p?.name.split(' ')[0]}</div>
                                                <div style={{ color: '#ffd700', fontSize: '0.75rem', fontWeight: 'bold' }}>POS {idx + 1}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <h3 style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Strategic Rotation (Bench)</h3>
                                <div className="briefing-bench-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                                    {summonedPlayers.filter(p => !starters.includes(p.id)).map(p => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <img src={p.photo_url || '/assets/players/default.png'} alt="" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} />
                                            <div>
                                                <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>{p.name.split(' ')[0]}</div>
                                                <div style={{ color: '#666', fontSize: '0.65rem' }}>#{p.jersey_number} - {p.position}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: System Selection */}
                            <div className="briefing-systems-selection" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Attach Systems</h3>
                                <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Select the technical systems to be deployed for this match.</p>

                                <div className="briefing-systems-list full-custom-scroll" style={{ maxHeight: '400px', overflowY: 'auto', display: 'grid', gap: '10px' }}>
                                    {fullCourtStrategies.map(s => {
                                        const isSelected = selectedBriefingStrategies.includes(s.id);
                                        return (
                                            <div
                                                key={s.id}
                                                onClick={() => {
                                                    setSelectedBriefingStrategies(prev =>
                                                        prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                                                    );
                                                }}
                                                style={{
                                                    padding: '12px',
                                                    background: isSelected ? 'rgba(219, 10, 64, 0.1)' : 'rgba(255,255,255,0.02)',
                                                    border: isSelected ? '1px solid #DB0A40' : '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSelected ? '#DB0A40' : '#333' }} />
                                                    <span style={{ color: isSelected ? '#fff' : '#aaa', fontSize: '0.85rem', fontWeight: isSelected ? 'bold' : 'normal' }}>{s.name}</span>
                                                </div>
                                                {isSelected && <Shield size={14} color="#DB0A40" />}
                                            </div>
                                        );
                                    })}
                                    {fullCourtStrategies.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: '#444', fontSize: '0.8rem', fontStyle: 'italic' }}>No systems available.</div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSaveMatchSetup}
                                    className="shiny-btn"
                                    style={{
                                        width: '100%',
                                        marginTop: '2rem',
                                        background: '#DB0A40',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '15px',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 20px rgba(219, 10, 64, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    SAVE & TRANSMIT BRIEFING
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Match;
