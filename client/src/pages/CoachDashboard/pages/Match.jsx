import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import MatchTacticsBoard from './MatchTacticsBoard';
import '../../../css/dashboard.css';
import '../css/match.css';

import Tesseract from 'tesseract.js';
import { Search, User, Users, Shield, Send, Activity, Camera, X, ArrowLeft, Plus, Check, Upload, Loader2 } from 'lucide-react';
import TacticalModal from '../../../components/UI/TacticalModal';

const Match = () => {
    const { showNotification } = useNotification?.() || { showNotification: (msg) => { } };
    const [players, setPlayers] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReportMatch, setSelectedReportMatch] = useState(null);
    const [reportContent, setReportContent] = useState("");
    const [playerStats, setPlayerStats] = useState({});
    const [viewingImage, setViewingImage] = useState(null);
    const [dossierMode, setDossierMode] = useState('stats'); // 'stats', 'squad_select', 'starter_select'
    const [tempSquad, setTempSquad] = useState([]);
    const [tempStarters, setTempStarters] = useState([]);
    const intelImageInputRef = useRef(null);

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
    const scheduleContainerRef = useRef(null);

    useEffect(() => {
        fetchPlayers();
        fetchCachedMatches(); // Get from database first (Fast)
        fetchStrategies();
    }, []);

    // Auto-scroll to first non-past match
    useEffect(() => {
        if (matches.length > 0 && scheduleContainerRef.current) {
            const firstUpcomingIndex = matches.findIndex(m => !isPastMatch(m.date));
            if (firstUpcomingIndex !== -1) {
                // Approximate card width (280px) + gap (20px)
                const scrollAmount = firstUpcomingIndex * 300;
                scheduleContainerRef.current.scrollTo({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        }
    }, [matches]);

    const fetchPlayers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/players');
            setPlayers(res.data);
        } catch (err) {

        }
    };

    const fetchCachedMatches = async () => {
        setLoadingMatches(true);
        try {
            const res = await axios.get('http://localhost:5000/api/matches/schedule');
            if (res.data && Array.isArray(res.data)) {
                setMatches(res.data);
            }
        } catch (err) {

        } finally {
            setLoadingMatches(false);
        }
    };

    const fetchScrapedMatches = async () => {
        setLoadingMatches(true);
        try {
            showNotification("Checking for schedule updates from FRMBB...", "info");
            const res = await axios.get('http://localhost:5000/api/matches/scrape');
            if (res.data && Array.isArray(res.data)) {
                setMatches(res.data);
                showNotification("Schedule updated successfully.", "success");
            } else {
                setMatches([]);
            }
        } catch (err) {

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

        }
    };

    const isPastMatch = (matchDate) => {
        try {
            if (!matchDate || matchDate.includes('00/00')) return false;
            const d = new Date(matchDate && matchDate.includes('/') ? matchDate.split('/').reverse().join('-') : matchDate);
            if (isNaN(d.getTime())) return false;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return d < today;
        } catch (e) {
            return false;
        }
    };

    // --- OCR Logic ---
    // (Functions removed per user request)

    const [isIntelExisting, setIsIntelExisting] = useState(false);
    const [intelImages, setIntelImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    // --- Actions ---

    const fetchMatchIntel = async (match) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/matches/intel/${match.external_id || match.id}`);
            if (res.data) {
                setReportContent(res.data.report || '');
                let parsedStats = {};
                try { parsedStats = typeof res.data.player_stats === 'string' ? JSON.parse(res.data.player_stats) : res.data.player_stats; } catch (e) { }
                setPlayerStats(parsedStats || {});

                let pImages = [];
                try { pImages = typeof res.data.images === 'string' ? JSON.parse(res.data.images) : res.data.images; } catch (e) { }
                setExistingImages(pImages || []);

                setIsIntelExisting(!!res.data.id);
            }
        } catch (err) {
            console.error('Error fetching intel', err);
            setReportContent('');
            setPlayerStats({});
            setExistingImages([]);
            setIsIntelExisting(false);
        }
    };

    const handleSelectMatch = (match) => {
        const isSaved = !!(match.saved_match_id || match.intel_id);
        setDossierMode('stats');
        setTempSquad([]);
        setTempStarters([]);

        if (isPastMatch(match.date) || isSaved) {
            setSelectedReportMatch(match);
            setIntelImages([]); // reset new images
            fetchMatchIntel(match).then(() => {
                setShowReportModal(true);
            });
            return;
        }

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

    const handleSaveDossierSquad = async () => {
        if (tempSquad.length < 6 || tempSquad.length > 12) {
            showNotification("Please select between 6 and 12 players.", "warning");
            return;
        }
        if (tempStarters.length !== 5) {
            showNotification("Please select exactly 5 starters.", "warning");
            return;
        }

        try {
            const res = await axios.post('http://localhost:5000/api/matches/save', {
                matchId: selectedReportMatch.saved_match_id || null,
                matchData: selectedReportMatch,
                squad: tempSquad,
                starters: tempStarters,
                strategyIds: []
            });

            if (res.data) {
                showNotification("Squad for match saved.", "success");
                // Update the local match object in selectedReportMatch
                setSelectedReportMatch(prev => ({
                    ...prev,
                    saved_match_id: res.data.matchId,
                    starters: JSON.stringify(tempStarters),
                    bench: JSON.stringify(tempSquad.filter(id => !tempStarters.includes(id)))
                }));
                // Refresh main matches list to show red border
                fetchCachedMatches();
                setDossierMode('stats');
            }
        } catch (err) {
            console.error('Error saving dossier squad', err);
            showNotification("Failed to save dossier squad.", "error");
        }
    };

    const handleSendMatchReport = async () => {
        if (!reportContent.trim() && intelImages.length === 0 && Object.keys(playerStats).length === 0 && existingImages.length === 0) {
            showNotification("Please enter report content, stats, or images.", "warning");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('match_id', selectedReportMatch.external_id || selectedReportMatch.id);
            formData.append('report', reportContent);
            formData.append('player_stats', JSON.stringify(playerStats));
            formData.append('existingImages', JSON.stringify(existingImages));

            intelImages.forEach(file => {
                formData.append('images', file);
            });

            await axios.post('http://localhost:5000/api/matches/intel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Also send notification to president (keeping existing logic loosely)
            const opponent = selectedReportMatch.home.includes('HUSA') ? selectedReportMatch.away : selectedReportMatch.home;
            await axios.post('http://localhost:5000/api/reports/send', {
                sender_id: 'coach_id',
                sender_name: 'Staff Coach',
                recipient_role: 'president',
                title: `Match Report: vs ${opponent} (${selectedReportMatch.date})`,
                content: reportContent + '\n[Check Tactical DOSSIER for full intel]',
                type: 'performance',
                priority: 'normal'
            });

            showNotification(isIntelExisting ? "Match Intel Updated." : "Match Intel Saved.", "success");
            setIsIntelExisting(true);

            // Close the modal on success
            setShowReportModal(false);
        } catch (err) {
            console.error('Error saving intel', err);
            showNotification("Failed to save match intel.", "error");
        }
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
                            padding: '8px 20px',
                            borderRadius: '0',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '900',
                            letterSpacing: '1px'
                        }}
                    >
                        {loadingMatches ? 'SYNCING...' : 'REFRESH SCHEDULE'}
                    </button>
                </div>

                {matches.length > 0 ? (
                    <div
                        ref={scheduleContainerRef}
                        className="full-custom-scroll"
                        style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px 0 20px 0' }}
                    >
                        {matches.map((match, idx) => {
                            const isHome = match.home.includes('HUSA') || match.home.includes('Hassania');
                            const isActive = activeMatch === match;
                            const isPast = isPastMatch(match.date);

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

                            const isSaved = !!(match.saved_match_id || match.intel_id);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectMatch(match)}
                                    className={`match-card-interactive ${isActive ? 'active-match-card' : ''} ${isPast ? 'past-match-card' : ''} ${isSaved ? 'saved-match-card' : ''}`}
                                    style={{
                                        flex: '0 0 280px',
                                        background: isSaved ? 'rgba(219, 10, 64, 0.05)' : (isActive ? 'linear-gradient(135deg, rgba(219, 10, 64, 0.1) 0%, rgba(20,20,20,0.9) 100%)' : '#1e1e1e'),
                                        border: isSaved ? '1px solid #DB0A40' : (isActive ? '2px solid #DB0A40' : (isPast ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)')),
                                        borderRadius: '0',
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        boxShadow: isActive ? '0 10px 30px rgba(219, 10, 64, 0.2)' : '0 4px 6px rgba(0,0,0,0.2)',
                                        transform: (isActive && !isSaved) ? 'translateY(-4px)' : 'none',
                                        filter: (isPast && !isSaved) ? 'grayscale(0.7) opacity(0.6)' : 'none',
                                        opacity: isSaved ? 0.9 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive && !isSaved) {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive && !isSaved) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.borderColor = isSaved ? '#DB0A40' : 'rgba(255,255,255,0.1)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
                                        }
                                    }}
                                >
                                    {/* Date Badge */}
                                    <div style={{
                                        alignSelf: 'flex-start',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '4px 12px',
                                        borderRadius: '0',
                                        fontSize: '0.75rem',
                                        color: '#aaa',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        fontWeight: '900',
                                        letterSpacing: '1px'
                                    }}>
                                        {dateDisplay}
                                    </div>

                                    {/* Teams */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: isHome ? '900' : '600', color: isHome ? '#fff' : '#ccc', letterSpacing: '-0.5px' }}>
                                                {match.home.toUpperCase()}
                                            </span>
                                            {isHome && <div style={{ width: '8px', height: '8px', background: '#DB0A40' }}></div>}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold' }}>VS</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: !isHome ? '900' : '600', color: !isHome ? '#fff' : '#ccc', letterSpacing: '-0.5px' }}>
                                                {match.away.toUpperCase()}
                                            </span>
                                            {!isHome && <div style={{ width: '8px', height: '8px', background: '#DB0A40' }}></div>}
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
                                        <span style={{ fontSize: '0.8rem', color: isSaved ? '#DB0A40' : (isActive ? '#DB0A40' : (isPast ? '#444' : '#666')), fontWeight: '600' }}>
                                            {isSaved ? 'Intel Saved / Planned' : (isActive ? 'Currently Managing' : (isPast ? 'Match Concluded' : 'Click to Manage'))}
                                        </span>
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
                <div id="squad-section" className="intel-card animate-fade-in" style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(219, 10, 64, 0.3)', borderRadius: '0' }}>
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
                                            style={{ background: 'transparent', border: '1px solid #666', color: '#aaa', padding: '8px 20px', borderRadius: '0', cursor: 'pointer', fontWeight: '900', fontSize: '0.8rem', letterSpacing: '1px' }}
                                        >
                                            BACK TO SQUAD
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
                                                    padding: '10px 30px',
                                                    borderRadius: '0',
                                                    cursor: 'pointer',
                                                    fontWeight: '900',
                                                    letterSpacing: '1px'
                                                }}
                                            >
                                                INITIALIZE STARTING 5 &rarr;
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
                                            <path d="M 350,450 L 350,300 L 650,300 L 650,450" fill="none" stroke="#444" strokeWidth="2" /> {/* Paint */}
                                            <path d="M 350,300 A 350,800 0 0 1 650,300" fill="none" stroke="#444" strokeWidth="2" /> {/* FT Circle */}
                                            <path d="M 100,450 A 450,500 0 0 1 900,450" fill="none" stroke="#666" strokeWidth="3" /> {/* 3PT Line */}
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
                                                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', textAlign: 'center', width: '100%', marginBottom: '4px' }}>{p.name}</div>
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
            {/* Match Paper Modal - Redesigned with reusable component */}
            <TacticalModal isOpen={showReportModal && selectedReportMatch} onClose={() => setShowReportModal(false)}>
                {selectedReportMatch && (
                    <>
                        {/* Left Side: Metadata & Intel Context */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem 2rem', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', overflowY: 'auto', minHeight: 0 }} className="full-custom-scroll">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#DB0A40', clipPath: 'polygon(0% 0%, 100% 0%, 75% 100%, 0% 100%)' }}></div>
                                    <span style={{ fontSize: '0.65rem', letterSpacing: '3px', color: '#DB0A40', fontWeight: '900' }}>TACTICAL DOSSIER</span>
                                </div>
                                <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-2px', lineHeight: 0.9, textTransform: 'uppercase' }}>INTEL<br /><span style={{ color: 'rgba(255,255,255,0.3)' }}>LOG</span></h1>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                                <div style={{ opacity: 0.6 }}>
                                    <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '4px' }}>TARGET_TEAM</label>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', borderLeft: '2px solid #DB0A40', paddingLeft: '12px' }}>
                                        {selectedReportMatch.home.includes('HUSA') ? selectedReportMatch.away : selectedReportMatch.home}
                                    </div>
                                </div>
                                <div style={{ opacity: 0.6 }}>
                                    <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '4px' }}>MISSION_DATE</label>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
                                        {selectedReportMatch.date}
                                    </div>
                                </div>
                                <div style={{ opacity: 0.6 }}>
                                    <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '4px' }}>CLEARANCE_LEVEL</label>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#DB0A40', paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Shield size={14} /> LEVEL_04_COACH
                                    </div>
                                </div>
                                <div style={{ opacity: 0.6 }}>
                                    <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '4px' }}>MATCH_SCORE</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {(() => {
                                            const scoreStr = selectedReportMatch.score;
                                            if (!scoreStr || scoreStr === '-') return 'N/A';

                                            let resultTag = null;
                                            const parts = scoreStr.split('-');
                                            if (parts.length === 2) {
                                                const homeScore = parseInt(parts[0].trim(), 10);
                                                const awayScore = parseInt(parts[1].trim(), 10);
                                                if (!isNaN(homeScore) && !isNaN(awayScore)) {
                                                    const isHome = selectedReportMatch.home.includes('HUSA') || selectedReportMatch.home.includes('Hassania');
                                                    const husaScore = isHome ? homeScore : awayScore;
                                                    const oppScore = isHome ? awayScore : homeScore;

                                                    if (husaScore > oppScore) {
                                                        resultTag = <span style={{ background: 'rgba(76, 209, 55, 0.2)', color: '#4cd137', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>VICTORY</span>;
                                                    } else if (husaScore < oppScore) {
                                                        resultTag = <span style={{ background: 'rgba(219, 10, 64, 0.2)', color: '#DB0A40', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>DEFEAT</span>;
                                                    } else {
                                                        resultTag = <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ccc', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>DRAW</span>;
                                                    }
                                                }
                                            }

                                            return (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {scoreStr}
                                                    {resultTag}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                {/* Images List */}
                                {(existingImages.length > 0 || intelImages.length > 0) && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem' }} className="full-custom-scroll">
                                        {existingImages.map((imgPath, i) => (
                                            <div key={`ext-${i}`} onClick={() => setViewingImage(`http://localhost:5000${imgPath}`)} style={{ position: 'relative', width: '100%', paddingTop: '100%', background: '#111', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden', cursor: 'pointer' }}>
                                                {/* Cyber Corner Marks */}
                                                <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', borderTop: '2px solid #DB0A40', borderLeft: '2px solid #DB0A40', zIndex: 10 }}></div>
                                                <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', borderTop: '2px solid #DB0A40', borderRight: '2px solid #DB0A40', zIndex: 10 }}></div>
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '10px', height: '10px', borderBottom: '2px solid #DB0A40', borderLeft: '2px solid #DB0A40', zIndex: 10 }}></div>
                                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderBottom: '2px solid #DB0A40', borderRight: '2px solid #DB0A40', zIndex: 10 }}></div>

                                                <img src={`http://localhost:5000${imgPath}`} alt="Match Data" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button onClick={(e) => { e.stopPropagation(); setExistingImages(prev => prev.filter((_, idx) => idx !== i)); if (viewingImage === `http://localhost:5000${imgPath}`) setViewingImage(null); }} style={{ position: 'absolute', top: '2px', width: '15px', height: '15px', display: 'flex', right: '2px', background: '#DB0A40', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '2px', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}><X size={12} /></button>
                                            </div>
                                        ))}
                                        {intelImages.map((file, i) => (
                                            <div key={`new-${i}`} onClick={() => setViewingImage(URL.createObjectURL(file))} style={{ position: 'relative', width: '100%', paddingTop: '100%', background: '#111', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden', cursor: 'pointer' }}>
                                                {/* Cyber Corner Marks */}
                                                <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', borderTop: '2px solid #DB0A40', borderLeft: '2px solid #DB0A40', zIndex: 10 }}></div>
                                                <div style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', borderTop: '2px solid #DB0A40', borderRight: '2px solid #DB0A40', zIndex: 10 }}></div>
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '10px', height: '10px', borderBottom: '2px solid #DB0A40', borderLeft: '2px solid #DB0A40', zIndex: 10 }}></div>
                                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderBottom: '2px solid #DB0A40', borderRight: '2px solid #DB0A40', zIndex: 10 }}></div>

                                                <img src={URL.createObjectURL(file)} alt="Match Data" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button onClick={(e) => { e.stopPropagation(); setIntelImages(prev => prev.filter((_, idx) => idx !== i)); if (viewingImage === URL.createObjectURL(file)) setViewingImage(null); }} style={{ position: 'absolute', top: '2px', width: '15px', height: '15px', display: 'flex', right: '2px', background: '#DB0A40', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '2px', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload Images Action */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <input
                                        type="file"
                                        ref={intelImageInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                const maxAllowed = 3 - (existingImages.length + intelImages.length);
                                                if (maxAllowed <= 0) {
                                                    showNotification("Maximum 3 images allowed.", "warning");
                                                    return;
                                                }
                                                const newFiles = Array.from(e.target.files).slice(0, maxAllowed);
                                                if (e.target.files.length > maxAllowed) {
                                                    showNotification(`Only ${maxAllowed} more images can be added.`, "warning");
                                                }
                                                setIntelImages(prev => [...prev, ...newFiles]);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => intelImageInputRef.current.click()}
                                        style={{
                                            width: '100%', background: 'rgba(219, 10, 64, 0.1)', border: '1px solid #DB0A40', color: '#fff', padding: '1rem', borderRadius: '0', fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: '0.3s', textTransform: 'uppercase', letterSpacing: '2px'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(219, 10, 64, 0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(219, 10, 64, 0.1)'}
                                    >
                                        <Camera size={16} /> Upload match sheets ({(existingImages.length + intelImages.length)}/3)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Composition Area */}
                        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minHeight: 0 }}>
                            {viewingImage ? (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', minHeight: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
                                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#DB0A40', textTransform: 'uppercase', letterSpacing: '1px' }}>Document Viewer</h3>
                                        <button onClick={() => setViewingImage(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '5px 15px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}><ArrowLeft size={14} /></button>
                                    </div>
                                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                                        <img src={viewingImage} alt="Match Document" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Compose Briefing</h2>
                                            <p style={{ color: '#555', fontSize: '0.75rem', margin: '4px 0 0 0' }}>Provide performance analysis and tactical adjustments.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowReportModal(false)}
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', width: '36px', height: '36px', borderRadius: '0', color: '#777', cursor: 'pointer', transition: '0.2s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#DB0A40'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = '#777'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflowY: 'auto' }} className="full-custom-scroll">
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', border: '1px solid rgba(219, 10, 64, 0.1)', background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(219, 10, 64, 0.01) 1px, rgba(219, 10, 64, 0.01) 2px)', opacity: 0.5 }}></div>

                                        {dossierMode === 'stats' ? (
                                            <>
                                                {/* Players Table for Stats */}
                                                <div style={{ width: '100%', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
                                                        <button
                                                            onClick={() => {
                                                                setDossierMode('squad_select');
                                                                let currentS = [];
                                                                let currentB = [];
                                                                try { currentS = typeof selectedReportMatch.starters === 'string' ? JSON.parse(selectedReportMatch.starters) : (selectedReportMatch.starters || []); } catch (e) { }
                                                                try { currentB = typeof selectedReportMatch.bench === 'string' ? JSON.parse(selectedReportMatch.bench) : (selectedReportMatch.bench || []); } catch (e) { }
                                                                setTempSquad([...currentS, ...currentB]);
                                                                setTempStarters(currentS);
                                                            }}
                                                            style={{ background: 'transparent', border: '1px solid #DB0A40', color: '#DB0A40', padding: '4px 12px', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
                                                        >MANAGE SQUAD</button>
                                                    </div>
                                                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', fontWeight: '900', color: '#666', padding: '10px 15px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                                        <div style={{ flex: 2 }}>OPERATOR</div>
                                                        <div style={{ flex: 1, textAlign: 'center' }}>PTS</div>
                                                        <div style={{ flex: 1, textAlign: 'center' }}>FOL</div>
                                                    </div>
                                                    <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="full-custom-scroll">
                                                        {(() => {
                                                            let dossierSquad = [];
                                                            if (selectedReportMatch) {
                                                                const isCurrentlyActive = activeMatch && (activeMatch.external_id === selectedReportMatch?.external_id || activeMatch.id === selectedReportMatch?.id);
                                                                if (isCurrentlyActive && selectedPlayers.length > 0) {
                                                                    dossierSquad = selectedPlayers;
                                                                } else {
                                                                    let sIds = [];
                                                                    let bIds = [];
                                                                    try { sIds = typeof selectedReportMatch?.starters === 'string' ? JSON.parse(selectedReportMatch.starters) : (selectedReportMatch?.starters || []); } catch (e) { }
                                                                    try { bIds = typeof selectedReportMatch?.bench === 'string' ? JSON.parse(selectedReportMatch.bench) : (selectedReportMatch?.bench || []); } catch (e) { }
                                                                    dossierSquad = [...sIds, ...bIds];
                                                                }
                                                            }

                                                            return players
                                                                .filter(p => dossierSquad.includes(p.id))
                                                                .sort((a, b) => dossierSquad.indexOf(a.id) - dossierSquad.indexOf(b.id))
                                                                .map((p, index) => (
                                                                    <div key={p.id} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.02)', padding: '6px 15px', alignItems: 'center', borderLeft: index < 5 ? '3px solid #DB0A40' : 'none', background: index < 5 ? 'rgba(219, 10, 64, 0.03)' : 'transparent' }}>
                                                                        <div style={{ flex: 2, fontSize: '0.8rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <span style={{ color: '#DB0A40', fontWeight: 'bold', width: '25px' }}>#{p.jersey_number}</span>
                                                                            <span style={{ fontWeight: '600' }}>{p.name}</span>
                                                                        </div>
                                                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="0"
                                                                                value={playerStats[p.id]?.pts || ''}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value;
                                                                                    if (val === '') {
                                                                                        setPlayerStats(prev => ({ ...prev, [p.id]: { ...prev[p.id], pts: val } }));
                                                                                    } else if (/^\d+$/.test(val)) {
                                                                                        const scoreStr = selectedReportMatch?.score;
                                                                                        const parts = scoreStr && scoreStr !== '-' ? scoreStr.split('-') : [];
                                                                                        let husaScoreLimit = Infinity;
                                                                                        if (parts.length === 2) {
                                                                                            const homeScore = parseInt(parts[0].trim(), 10);
                                                                                            const awayScore = parseInt(parts[1].trim(), 10);
                                                                                            if (!isNaN(homeScore) && !isNaN(awayScore)) {
                                                                                                const homeName = selectedReportMatch?.home || "";
                                                                                                const isHome = homeName.includes('HUSA') || homeName.includes('Hassania');
                                                                                                husaScoreLimit = isHome ? homeScore : awayScore;
                                                                                            }
                                                                                        }

                                                                                        let currentTotal = 0;
                                                                                        Object.keys(playerStats).forEach(id => {
                                                                                            if (id !== p.id.toString() && playerStats[id]?.pts) {
                                                                                                currentTotal += parseInt(playerStats[id].pts, 10) || 0;
                                                                                            }
                                                                                        });

                                                                                        const newTotal = currentTotal + parseInt(val, 10);
                                                                                        if (newTotal > husaScoreLimit) {
                                                                                            showNotification?.(`Total points cannot exceed the team's match score (${husaScoreLimit}).`, "warning");
                                                                                        } else {
                                                                                            setPlayerStats(prev => ({ ...prev, [p.id]: { ...prev[p.id], pts: val } }));
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                style={{ width: '45px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', textAlign: 'center', borderRadius: '0', padding: '4px', fontSize: '0.8rem', outline: 'none' }}
                                                                                onFocus={(e) => e.target.style.borderColor = '#DB0A40'}
                                                                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                                            />
                                                                        </div>
                                                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="0"
                                                                                value={playerStats[p.id]?.fol || ''}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value;
                                                                                    if (val === '') {
                                                                                        setPlayerStats(prev => ({ ...prev, [p.id]: { ...prev[p.id], fol: val } }));
                                                                                    } else if (/^\d+$/.test(val)) {
                                                                                        if (parseInt(val) > 5) {
                                                                                            showNotification?.("Foul count cannot exceed 5.", "warning");
                                                                                        } else {
                                                                                            setPlayerStats(prev => ({ ...prev, [p.id]: { ...prev[p.id], fol: val } }));
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                style={{ width: '45px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#DB0A40', textAlign: 'center', borderRadius: '0', padding: '4px', fontSize: '0.8rem', outline: 'none', fontWeight: 'bold' }}
                                                                                onFocus={(e) => e.target.style.borderColor = '#DB0A40'}
                                                                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))
                                                        })()}
                                                    </div>
                                                </div>

                                                <textarea
                                                    value={reportContent}
                                                    onChange={(e) => setReportContent(e.target.value)}
                                                    placeholder="Begin tactical analysis input..."
                                                    style={{
                                                        flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                                                        borderRadius: '0', padding: '1.5rem', color: '#fff', fontSize: '1rem', lineHeight: '1.6',
                                                        resize: 'none', outline: 'none', transition: 'border-color 0.3s', minHeight: '300px',
                                                        fontFamily: 'inherit', zIndex: 10
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = 'rgba(219, 10, 64, 0.4)'}
                                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                                                />
                                            </>
                                        ) : dossierMode === 'squad_select' ? (
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#fff', letterSpacing: '2px' }}>SELECT OPERATORS ({tempSquad.length}/12)</h4>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => setDossierMode('stats')} style={{ background: 'transparent', border: '1px solid #444', color: '#777', padding: '5px 15px', fontSize: '0.6rem', fontWeight: '900', cursor: 'pointer' }}>CANCEL</button>
                                                        <button
                                                            onClick={() => tempSquad.length >= 6 && setDossierMode('starter_select')}
                                                            disabled={tempSquad.length < 6}
                                                            style={{ background: tempSquad.length >= 6 ? '#DB0A40' : '#222', border: 'none', color: '#fff', padding: '5px 15px', fontSize: '0.6rem', fontWeight: '900', cursor: tempSquad.length >= 6 ? 'pointer' : 'not-allowed' }}
                                                        >NEXT: LINEUP</button>
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', overflowY: 'auto', paddingRight: '10px' }} className="full-custom-scroll">
                                                    {players.map(p => {
                                                        const isSelected = tempSquad.includes(p.id);
                                                        return (
                                                            <div
                                                                key={p.id}
                                                                onClick={() => {
                                                                    if (isSelected) setTempSquad(prev => prev.filter(id => id !== p.id));
                                                                    else if (tempSquad.length < 12) setTempSquad(prev => [...prev, p.id]);
                                                                }}
                                                                style={{
                                                                    position: 'relative', height: '180px', background: '#111', border: isSelected ? '1px solid #DB0A40' : '1px solid rgba(255,255,255,0.05)',
                                                                    cursor: 'pointer', transition: '0.3s', overflow: 'hidden'
                                                                }}
                                                            >
                                                                {p.photo_url ? (
                                                                    <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSelected ? 1 : 0.4 }} />
                                                                ) : (
                                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}><User size={40} /></div>
                                                                )}
                                                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '8px', background: 'linear-gradient(to top, #000, transparent)' }}>
                                                                    <div style={{ fontSize: '0.65rem', fontWeight: '900', color: isSelected ? '#DB0A40' : '#fff' }}>#{p.jersey_number}</div>
                                                                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fff', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                                                </div>
                                                                {isSelected && <Check size={12} style={{ position: 'absolute', top: '8px', right: '8px', color: '#DB0A40' }} />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#fff', letterSpacing: '2px' }}>DESIGNATE STARTING 5 ({tempStarters.length}/5)</h4>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => setDossierMode('squad_select')} style={{ background: 'transparent', border: '1px solid #444', color: '#777', padding: '5px 15px', fontSize: '0.6rem', fontWeight: '900', cursor: 'pointer' }}>BACK</button>
                                                        <button
                                                            onClick={handleSaveDossierSquad}
                                                            disabled={tempStarters.length !== 5}
                                                            style={{ background: tempStarters.length === 5 ? '#DB0A40' : '#222', border: 'none', color: '#fff', padding: '5px 15px', fontSize: '0.6rem', fontWeight: '900', cursor: tempStarters.length === 5 ? 'pointer' : 'not-allowed' }}
                                                        >CONFIRM SQUAD</button>
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', overflowY: 'auto' }} className="full-custom-scroll">
                                                    {players.filter(p => tempSquad.includes(p.id)).sort((a, b) => tempSquad.indexOf(a.id) - tempSquad.indexOf(b.id)).map(p => {
                                                        const isStarter = tempStarters.includes(p.id);
                                                        return (
                                                            <div
                                                                key={p.id}
                                                                onClick={() => {
                                                                    if (isStarter) setTempStarters(prev => prev.filter(id => id !== p.id));
                                                                    else if (tempStarters.length < 5) setTempStarters(prev => [...prev, p.id]);
                                                                }}
                                                                style={{
                                                                    position: 'relative', height: '180px', background: '#111', border: isStarter ? '2px solid #DB0A40' : '1px solid rgba(255,255,255,0.05)',
                                                                    cursor: 'pointer', transition: '0.3s', overflow: 'hidden'
                                                                }}
                                                            >
                                                                {p.photo_url ? (
                                                                    <img src={p.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isStarter ? 1 : 0.6 }} />
                                                                ) : (
                                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}><User size={40} /></div>
                                                                )}
                                                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '8px', background: 'linear-gradient(to top, #000, transparent)' }}>
                                                                    <div style={{ fontSize: '0.65rem', fontWeight: '900', color: isStarter ? '#DB0A40' : '#fff' }}>#{p.jersey_number} {isStarter && 'STARTER'}</div>
                                                                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fff', textTransform: 'uppercase' }}>{p.name}</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ position: 'absolute', bottom: '15px', right: '15px', opacity: 0.2, display: 'flex', gap: '10px' }}>
                                        <Activity size={20} />
                                        <Send size={20} />
                                    </div>

                                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ textAlign: 'right', display: 'none' }}> {/* hidden for cleaner ui */}
                                            <div style={{ fontSize: '0.7rem', color: '#444', fontWeight: '900' }}>TRANSMISSION_SECURE</div>
                                            <div style={{ fontSize: '0.6rem', color: '#222' }}>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                                        </div>
                                        <button
                                            onClick={handleSendMatchReport}
                                            style={{
                                                background: '#DB0A40', color: '#fff', border: 'none',
                                                padding: '1rem 3.5rem', borderRadius: '0', fontWeight: '900',
                                                cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase',
                                                fontSize: '0.85rem', boxShadow: '0 10px 40px rgba(219, 10, 64, 0.2)',
                                                display: 'flex', alignItems: 'center', gap: '15px', transition: '0.3s'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 50px rgba(219, 10, 64, 0.3)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(219, 10, 64, 0.2)'; }}
                                        >
                                            {isIntelExisting ? "UPDATE INTEL" : "TRANSMIT INTEL"}
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </TacticalModal>
        </div>
    );
};

export default Match;
