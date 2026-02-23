import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import MatchTacticsBoard from './MatchTacticsBoard';
import '../../../css/dashboard.css';
import '../css/match.css';
import PlayerCard from '../../Squad/components/PlayerCard';
import '../../Squad/css/squad.css';

import { Search, User, Users, Shield, Activity, Send, Camera, Upload, Loader2, X, Calendar, ChevronRight } from 'lucide-react'; // Added icons
import TacticalModal from '../../../components/UI/TacticalModal';


const Match = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification?.() || { showNotification: (msg) => { } };
    const [players, setPlayers] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReportMatch, setSelectedReportMatch] = useState(null);
    const [reportContent, setReportContent] = useState("");
    const [ocrProgress, setOcrProgress] = useState(0);
    const [isOcrProcessing, setIsOcrProcessing] = useState(false);
    const [ocrStatus, setOcrStatus] = useState('');
    const ocrFileInputRef = useRef(null);

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
    const [loadingDeployment, setLoadingDeployment] = useState(false);

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

    const handleOcrUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsOcrProcessing(true);
        setOcrStatus('Initializing Scanner...');
        setOcrProgress(5);

        try {
            // Run OCR in the browser using tesseract.js (no server binary needed)
            const Tesseract = await import('tesseract.js');

            setOcrStatus('Scanning Document...');

            const { data } = await Tesseract.recognize(file, 'fra+eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.round(5 + m.progress * 80)); // 5→85%
                    } else if (m.status === 'loading tesseract core') {
                        setOcrStatus('Loading Engine...');
                    } else if (m.status === 'initializing tesseract') {
                        setOcrStatus('Initializing...');
                    }
                }
            });

            const rawText = data.text;
            const ocrConfidence = Math.round(data.confidence);

            setOcrProgress(88);
            setOcrStatus('Parsing FRMBB Structure...');

            // Send extracted text to backend for structured parsing & validation
            const res = await axios.post('http://localhost:5000/api/ocr/parse', {
                text: rawText,
                confidence: ocrConfidence
            });

            setOcrProgress(100);
            setOcrStatus('Intel Extracted');

            showNotification("Match sheet tactical data extracted successfully.", "success");

            setTimeout(() => {
                navigate('/dashboard/coach/match-sheet-page', { state: { matchData: res.data } });
            }, 1000);

        } catch (err) {
            console.error("Scanner Error:", err);
            const errorMessage = err.response?.data?.message || "Tactical scan failed. Verify image clarity.";
            showNotification(errorMessage, "error");
        } finally {
            setIsOcrProcessing(false);
            setOcrStatus('');
            setOcrProgress(0);
        }
    };

    // --- Actions ---

    const handleSelectMatch = (match) => {
        if (isPastMatch(match.date)) {
            setSelectedReportMatch(match);
            setShowReportModal(true);
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

    const handleSendMatchReport = async () => {
        if (!reportContent.trim()) {
            showNotification("Please enter report content.", "warning");
            return;
        }
        try {
            const opponent = selectedReportMatch.home.includes('HUSA') ? selectedReportMatch.away : selectedReportMatch.home;
            await axios.post('http://localhost:5000/api/reports/send', {
                sender_id: 'coach_id', // Should use auth context id
                sender_name: 'Staff Coach',
                recipient_role: 'president',
                title: `Match Report: vs ${opponent} (${selectedReportMatch.date})`,
                content: reportContent,
                type: 'performance',
                priority: 'normal'
            });
            showNotification("Match report transmitted to President.", "success");
            setShowReportModal(false);
            setReportContent("");
        } catch (err) {
            showNotification("Failed to transmit report.", "error");
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

        setLoadingDeployment(true);
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
        } finally {
            setLoadingDeployment(false);
        }
    };

    const availablePlayers = players.filter(p => !selectedPlayers.includes(p.id));
    const summonedPlayers = players.filter(p => selectedPlayers.includes(p.id));



    return (
        <div className="overview-container dashboard-fashion-theme" style={{ padding: '0' }}>
            {/* 1. Cinematic Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">MISSION</div>
                <div className="header-content-box">
                    <span className="premium-label">TACTICAL OPS COMMAND</span>
                    <h1 className="hero-dashboard-title">
                        MATCH <br />
                        <span className="accent-text">ENGAGEMENT</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <div className="pulse-dot"></div>
                            <span>MISSION READY</span>
                        </div>
                        <div className="divider"></div>
                        <div className="status-item">
                            <Shield size={14} />
                            <span>ENCRYPTED UPLINK</span>
                        </div>
                    </div>
                </div>
            </div>


            {/* 3. Schedule & Match Selection */}
            <div className="intel-card" style={{ margin: '0 2rem 2rem 2rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '2px' }}>OPERATIONAL SCHEDULE</h2>
                        <p style={{ color: '#444', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px', margin: '5px 0 0 0' }}>SELECT ENGAGEMENT FOR PARAMETER CONFIGURATION</p>
                    </div>
                    <button
                        onClick={fetchScrapedMatches}
                        disabled={loadingMatches}
                        className="intel-btn-primary"
                        style={{ padding: '10px 25px', fontSize: '0.7rem' }}
                    >
                        {loadingMatches ? 'SYNCING...' : 'SYNC DATA UPLINK'}
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

                            // Parse date if possible
                            let dateDisplay = match.date;
                            try {
                                const d = new Date(match.date && match.date.includes('/') ? match.date.split('/').reverse().join('-') : match.date);
                                if (!isNaN(d.getTime())) {
                                    dateDisplay = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                                }
                            } catch (e) { }

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectMatch(match)}
                                    className={`intel-card ${isActive ? 'active-border-glow' : ''}`}
                                    style={{
                                        flex: '0 0 300px',
                                        background: isActive ? 'linear-gradient(135deg, rgba(219, 10, 64, 0.1) 0%, #111 100%)' : 'rgba(255,255,255,0.02)',
                                        border: isActive ? '1px solid #DB0A40' : '1px solid rgba(255,255,255,0.05)',
                                        padding: '1.5rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1.5rem',
                                        opacity: isPast ? 0.4 : 1,
                                        filter: isPast ? 'grayscale(1)' : 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '900', color: '#DB0A40', letterSpacing: '2px' }}>{dateDisplay}</div>
                                        {isActive && <div className="pulse-dot"></div>}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: '900', color: isHome ? '#fff' : '#444', letterSpacing: '1px' }}>{match.home.toUpperCase()}</span>
                                            {isHome && <Shield size={14} color="#DB0A40" />}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.05)' }}></div>
                                            <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#222' }}>BATTLE</span>
                                            <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.05)' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: '900', color: !isHome ? '#fff' : '#444', letterSpacing: '1px' }}>{match.away.toUpperCase()}</span>
                                            {!isHome && <Shield size={14} color="#DB0A40" />}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: '900', color: isActive ? '#DB0A40' : '#333', letterSpacing: '1px' }}>
                                            {isActive ? 'STATUS: ACTIVE' : (isPast ? 'MISSION: COMPLETE' : 'STATUS: READY')}
                                        </span>
                                        <ChevronRight size={14} color={isActive ? '#DB0A40' : '#222'} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="intel-card" style={{ textAlign: 'center', padding: '4rem', color: '#222', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '2px' }}>NO DATA AVAILABLE</div>
                )}
            </div>

            {/* 4. Squad Management Section */}
            {activeMatch && (
                <div id="squad-section" className="intel-card" style={{ margin: '0 2rem 3rem 2rem', padding: '0', overflow: 'visible', border: '1px solid rgba(219, 10, 64, 0.2)' }}>
                    <div style={{ padding: '2rem', background: 'linear-gradient(90deg, rgba(219, 10, 64, 0.05) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#DB0A40', letterSpacing: '4px' }}>PRE-MATCH INTEL</span>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontWeight: '950', letterSpacing: '-1px' }}>
                                VS {activeMatch.home.includes('HUSA') ? activeMatch.away.toUpperCase() : activeMatch.home.toUpperCase()}
                            </h2>
                        </div>
                        {isSquadConfirmed && (
                            <button onClick={handleEditSquad} className="intel-btn-secondary" style={{ padding: '10px 25px', fontSize: '0.7rem' }}>
                                RECONFIGURE SQUAD
                            </button>
                        )}
                    </div>

                    <div style={{ padding: '2.5rem' }}>
                        {/* Custom Fashion Stepper */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: !isSquadConfirmed ? 1 : 0.4 }}>
                                <div style={{ width: '40px', height: '40px', background: !isSquadConfirmed ? '#DB0A40' : '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', border: '1px solid #DB0A40' }}>01</div>
                                <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px', color: '#fff' }}>SUMMON <br /> SQUAD</span>
                            </div>
                            <div style={{ height: '1px', width: '60px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: isSquadConfirmed ? 1 : 0.2 }}>
                                <div style={{ width: '40px', height: '40px', background: isSquadConfirmed ? '#DB0A40' : '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', border: '1px solid #DB0A40' }}>02</div>
                                <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px', color: '#fff' }}>STRATEGIC <br /> STARTING 5</span>
                            </div>
                            <button
                                onClick={handleConfirmSquad}
                                className="intel-btn-primary"
                                style={{ width: '50%', padding: '20px', letterSpacing: '3px', fontWeight: '950' }}
                                disabled={selectedPlayers.length === 0}
                            >
                                CONFIRM SQUAD &rarr;
                            </button>
                        </div>

                        {!isSquadConfirmed ? (
                            <div className="squad-selection-premium" style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '3rem' }}>
                                {/* Left: Personnel Pool */}
                                <div>
                                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                                        <input
                                            type="text"
                                            placeholder="FILTER PERSONNEL..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ width: '100%', padding: '18px 18px 18px 45px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '2px' }}
                                        />
                                    </div>
                                    <div className="full-custom-scroll" style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '20px',
                                        maxHeight: '700px',
                                        overflowY: 'auto',
                                        padding: '1rem'
                                    }}>
                                        {availablePlayers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                            <PlayerCard
                                                key={p.id}
                                                disableFlip={true}
                                                onClick={() => handleSummon(p.id)}
                                                player={{
                                                    ...p,
                                                    number: p.jersey_number?.toString().padStart(2, '0') || '--',
                                                    image: p.photo_url || null,
                                                    role: p.position || 'Player'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="intel-card" style={{ background: 'rgba(219, 10, 64, 0.05)', padding: '1.5rem 2rem', border: '1px solid rgba(219, 10, 64, 0.1)', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '2px', color: '#fff', margin: 0 }}>SUMMONED SQUAD [{selectedPlayers.length}/12]</h3>
                                        <Users size={18} color="#DB0A40" />
                                    </div>
                                    <div className="full-custom-scroll" style={{
                                        maxHeight: '700px',
                                        overflowY: 'auto',
                                        padding: '1.5rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div className='card-list' style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: '15px'
                                        }}>
                                            {Array.from({ length: 12 }).map((_, idx) => {
                                                const player = summonedPlayers[idx];
                                                if (player) {
                                                    return (
                                                        <PlayerCard
                                                            key={player.id}
                                                            disableFlip={true}
                                                            onClick={() => handleDismiss(player.id)}
                                                            player={{
                                                                ...player,
                                                                number: player.jersey_number?.toString().padStart(2, '0') || '--',
                                                                image: player.photo_url || null,
                                                                role: player.position || 'Player'
                                                            }}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            height: '250px',
                                                            background: 'rgba(255,255,255,0.01)',
                                                            border: '1px dashed rgba(255,255,255,0.05)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '0.6rem', color: '#111', fontWeight: '900', letterSpacing: '2px' }}>EMPTY_SLOT</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
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

                                    <div className="starters-slots-container squad-selection-premium">
                                        {/* 5 Slots for Starters */}
                                        {Array.from({ length: 5 }).map((_, idx) => {
                                            const starterId = starters[idx];
                                            const starter = players.find(p => p.id === starterId);
                                            const isActive = activePosition === idx;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`starter-slot-wrapper ${isActive ? 'active-slot' : ''}`}
                                                    onClick={() => setActivePosition(idx)}
                                                >
                                                    {starter ? (
                                                        <div style={{ position: 'relative' }}>
                                                            <PlayerCard
                                                                disableFlip={true}
                                                                player={{
                                                                    ...starter,
                                                                    number: starter.jersey_number?.toString().padStart(2, '0') || '--',
                                                                    image: starter.photo_url || null,
                                                                    role: 'POS ' + (idx + 1)
                                                                }}
                                                            />
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); toggleStarter(starterId); }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '-10px',
                                                                    right: '-10px',
                                                                    background: '#DB0A40',
                                                                    border: 'none',
                                                                    color: '#fff',
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '50%',
                                                                    zIndex: 10,
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: 'bold',
                                                                    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                                                                }}
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="player-card empty-starter-slot">
                                                            <div className="empty-slot-number">{idx + 1}</div>
                                                            <div className="empty-slot-label">SELECT PLAYER</div>
                                                        </div>
                                                    )}

                                                    {isActive && (
                                                        <div className="animate-pulse" style={{
                                                            position: 'absolute',
                                                            bottom: '-15px',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            background: '#da0a40',
                                                            color: '#fff',
                                                            padding: '2px 10px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.6rem',
                                                            fontWeight: '900',
                                                            zIndex: 5,
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            ACTIVE POSITION
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="court-title-container">
                                        <h3 className="court-title">Starting V</h3>
                                    </div>
                                </div>

                                {/* Bottom: Bench */}
                                <div className="bench-section squad-selection-premium">
                                    <h3 className="bench-title">
                                        Bench Rotation ({selectedPlayers.filter(id => !starters.includes(id)).length})
                                    </h3>
                                    <div className="bench-carousel full-custom-scroll">
                                        {summonedPlayers.filter(p => !starters.includes(p.id)).map(p => (
                                            <PlayerCard
                                                key={p.id}
                                                disableFlip={true}
                                                onClick={() => toggleStarter(p.id)}
                                                player={{
                                                    ...p,
                                                    number: p.jersey_number?.toString().padStart(2, '0') || '--',
                                                    image: p.photo_url || null,
                                                    role: p.position || 'Player'
                                                }}
                                            />
                                        ))}
                                        {summonedPlayers.filter(p => !starters.includes(p.id)).length === 0 && (
                                            <div className="empty-bench-placeholder">
                                                No bench units assigned. Expand squad to add depth.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 5. Strategy Board (Only if squad is confirmed) */}
            {isSquadConfirmed && summonedPlayers.length > 0 && (
                <div id="tactical-board-section" className="intel-card" style={{ margin: '3rem 2rem', padding: '0', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,10,10,0.4)' }}>
                    <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div className="pulse-dot"></div>
                        <h2 style={{ fontSize: '0.9rem', fontWeight: '950', letterSpacing: '4px', margin: 0, color: '#fff' }}>TACTICAL PROJECTION BOARD</h2>
                    </div>

                    <div style={{ padding: '2.5rem' }}>
                        <MatchTacticsBoard
                            summonedPlayers={summonedPlayers}
                            starters={starters}
                            strategies={fullCourtStrategies}
                            showNotification={showNotification}
                            fetchStrategies={fetchStrategies}
                            onStrategyLoaded={(id) => setActiveStrategyId(id)}
                        />
                    </div>
                </div>
            )}

            {/* 6. Tactical Briefing & Transmission */}
            {isSquadConfirmed && starters.every(id => id !== null && id !== undefined) && (
                <div id="briefing-section" className="intel-card" style={{ margin: '3rem 2rem 5rem 2rem', padding: '0', border: '1px solid rgba(219, 10, 64, 0.4)', background: 'rgba(10,10,10,0.6)' }}>
                    <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#DB0A40', letterSpacing: '4px' }}>OPERATIONAL DEPLOYMENT</span>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '950', margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>TACTICAL BRIEFING & TRANSMISSION</h2>
                        </div>
                        <Shield size={24} color="#DB0A40" style={{ opacity: 0.5 }} />
                    </div>

                    <div style={{ padding: '3.5rem' }}>
                        <div className="briefing-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '4rem' }}>

                            {/* Left Side: The Selection Review */}
                            <div className="briefing-selection-review">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                                    <div style={{ height: '1px', width: '30px', background: '#DB0A40' }}></div>
                                    <h3 style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.8rem', fontWeight: '950', margin: 0 }}>OFFICIAL STARTING FIVE</h3>
                                </div>

                                <div className="briefing-starters-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '4rem' }}>
                                    {starters.map((id, idx) => {
                                        const p = players.find(player => player.id === id);
                                        return (
                                            <div key={idx} className="intel-card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.01)', padding: '20px 10px', borderRadius: '0', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                <div style={{ width: '60px', height: '60px', margin: '0 auto 15px', background: '#000', border: '1px solid #DB0A40', padding: '3px' }}>
                                                    <img src={p?.photo_url || '/assets/players/default.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '950', letterSpacing: '1px' }}>{p?.name.split(' ')[0].toUpperCase()}</div>
                                                <div style={{ color: '#444', fontSize: '0.6rem', fontWeight: '900', marginTop: '5px' }}>POS {idx + 1}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                                    <div style={{ height: '1px', width: '30px', background: 'rgba(255,255,255,0.1)' }}></div>
                                    <h3 style={{ color: '#555', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.75rem', fontWeight: '950', margin: 0 }}>STRATEGIC ROTATION</h3>
                                </div>

                                <div className="briefing-bench-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                                    {summonedPlayers.filter(p => !starters.includes(p.id)).map(p => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ width: '30px', height: '30px', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <img src={p.photo_url || '/assets/players/default.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div>
                                                <div style={{ color: '#fff', fontSize: '0.7rem', fontWeight: '950' }}>{p.name.split(' ')[0].toUpperCase()}</div>
                                                <div style={{ color: '#333', fontSize: '0.55rem', fontWeight: '900' }}>#{p.jersey_number} // {p.position}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: System Selection */}
                            <div className="intel-card" style={{ background: '#080808', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '950', letterSpacing: '2px', margin: 0 }}>ATTACH SYSTEMS</h3>
                                    <Activity size={16} color="#DB0A40" />
                                </div>
                                <p style={{ color: '#444', fontSize: '0.65rem', lineHeight: '1.6', fontWeight: '900', marginBottom: '2rem', letterSpacing: '1px' }}>SELECT TECHNICAL SYSTEMS FOR DEPLOYMENT PARAMETERS.</p>

                                <div className="briefing-systems-list full-custom-scroll" style={{ flex: 1, maxHeight: '350px', overflowY: 'auto', display: 'grid', gap: '10px', paddingRight: '8px' }}>
                                    {fullCourtStrategies.map(s => {
                                        const isSelected = selectedBriefingStrategies.includes(s.id);
                                        return (
                                            <div
                                                key={s.id}
                                                onClick={() => toggleStrategyBriefing(s.id)}
                                                style={{
                                                    padding: '15px',
                                                    background: isSelected ? 'rgba(219,10,64,0.1)' : 'rgba(255,255,255,0.01)',
                                                    border: isSelected ? '1px solid #DB0A40' : '1px solid rgba(255,255,255,0.05)',
                                                    cursor: 'pointer',
                                                    transition: '0.3s',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: '950', letterSpacing: '1px' }}>{s.name.toUpperCase()}</div>
                                                    <div style={{ color: isSelected ? '#DB0A40' : '#333', fontSize: '0.55rem', fontWeight: '900', marginTop: '4px' }}>{s.type.toUpperCase()} // UPLINK_READY</div>
                                                </div>
                                                <div style={{ width: '12px', height: '12px', background: isSelected ? '#DB0A40' : 'transparent', border: '1px solid #DB0A40' }}></div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={handleSaveMatchSetup}
                                    disabled={loadingDeployment}
                                    className="intel-btn-primary"
                                    style={{ width: '100%', marginTop: '2rem', padding: '20px', fontWeight: '950', letterSpacing: '2px' }}
                                >
                                    {loadingDeployment ? 'ESTABLISHING LINK...' : 'EXECUTE MISSION DEPLOYMENT'}
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
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem 2rem', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* ... (keep modal content) */}
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
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                {/* Scan/Upload Action */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <input
                                        type="file"
                                        ref={ocrFileInputRef}
                                        onChange={handleOcrUpload}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />
                                    <button
                                        onClick={() => ocrFileInputRef.current.click()}
                                        disabled={isOcrProcessing}
                                        style={{
                                            width: '100%',
                                            background: isOcrProcessing ? 'rgba(219, 10, 64, 0.05)' : 'rgba(219, 10, 64, 0.1)',
                                            border: '1px solid #DB0A40',
                                            color: '#fff',
                                            padding: '1rem',
                                            borderRadius: '0',
                                            fontSize: '0.75rem',
                                            fontWeight: '900',
                                            cursor: isOcrProcessing ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            transition: '0.3s',
                                            textTransform: 'uppercase',
                                            letterSpacing: '2px',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        onMouseEnter={e => !isOcrProcessing && (e.currentTarget.style.background = 'rgba(219, 10, 64, 0.2)')}
                                        onMouseLeave={e => !isOcrProcessing && (e.currentTarget.style.background = 'rgba(219, 10, 64, 0.1)')}
                                    >
                                        {isOcrProcessing && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                height: '100%',
                                                width: `${ocrProgress}%`,
                                                background: 'rgba(219, 10, 64, 0.2)',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        )}
                                        {isOcrProcessing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                        {isOcrProcessing ? ocrStatus : 'Scan FRMBB Match Sheet'}
                                    </button>
                                </div>

                                <div style={{ fontSize: '0.55rem', color: '#444', letterSpacing: '2px', fontFamily: 'monospace' }}>
                                    ENCRYPTION: AES-256-GCM<br />
                                    STATUS: READY<br />
                                    ORIGIN: HUSA_OPERATIONS
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Composition Area */}
                        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column' }}>
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

                            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', border: '1px solid rgba(219, 10, 64, 0.1)', background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(219, 10, 64, 0.01) 1px, rgba(219, 10, 64, 0.01) 2px)', opacity: 0.5 }}></div>
                                <textarea
                                    value={reportContent}
                                    onChange={(e) => setReportContent(e.target.value)}
                                    placeholder="Begin tactical analysis input..."
                                    style={{
                                        flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '0', padding: '1.5rem', color: '#fff', fontSize: '1rem', lineHeight: '1.6',
                                        resize: 'none', outline: 'none', transition: 'border-color 0.3s', minHeight: '300px',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(219, 10, 64, 0.4)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
                                />
                                <div style={{ position: 'absolute', bottom: '15px', right: '15px', opacity: 0.2, display: 'flex', gap: '10px' }}>
                                    <Activity size={20} />
                                    <Send size={20} />
                                </div>
                            </div>

                            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
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
                                    TRANSMIT INTEL
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </TacticalModal>
        </div>
    );
};


export default Match;
