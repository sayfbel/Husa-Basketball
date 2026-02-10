import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import MatchTacticsBoard from './MatchTacticsBoard';
import '../../../css/dashboard.css';

const Match = () => {
    const { showNotification } = useNotification?.() || { showNotification: (msg) => console.log(msg) };
    const [players, setPlayers] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState([]); // Array of player IDs
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [error, setError] = useState(null);
    const [fullCourtStrategies, setFullCourtStrategies] = useState([]);

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

    const handleSummon = (playerId) => {
        if (selectedPlayers.length >= 12) {
            showNotification("You can only select 12 players for the match squad.", "warning");
            return;
        }
        setSelectedPlayers(prev => [...prev, playerId]);
    };

    const handleDismiss = (playerId) => {
        setSelectedPlayers(prev => prev.filter(id => id !== playerId));
    };

    const availablePlayers = players.filter(p => !selectedPlayers.includes(p.id));
    const summonedPlayers = players.filter(p => selectedPlayers.includes(p.id));

    const PlayerCard = ({ player, action, actionLabel, variant }) => (
        <div
            onClick={() => action(player.id)}
            className="player-card-interactive"
            style={{
                position: 'relative',
                background: variant === 'summoned'
                    ? 'linear-gradient(135deg, rgba(219, 10, 64, 0.15) 0%, rgba(20, 20, 20, 0.8) 100%)'
                    : 'rgba(255,255,255,0.03)',
                border: variant === 'summoned' ? '1px solid rgba(219, 10, 64, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.8rem',
                height: '100%',
                boxShadow: variant === 'summoned' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
                if (variant === 'summoned') {
                    e.currentTarget.style.borderColor = '#DB0A40';
                } else {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = variant === 'summoned' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none';
                if (variant === 'summoned') {
                    e.currentTarget.style.borderColor = 'rgba(219, 10, 64, 0.4)';
                } else {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }
            }}
        >
            {/* Action Badge (Absolute) */}
            <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: variant === 'summoned' ? '#DB0A40' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '1.2rem',
                lineHeight: 1
            }}>
                {actionLabel === '+' ? '+' : '−'}
            </div>

            {/* Jersey Number Badge (Absolute) */}
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

            {/* Player Image */}
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                padding: '3px',
                background: variant === 'summoned'
                    ? 'linear-gradient(45deg, #DB0A40, #ff4d4d)'
                    : 'linear-gradient(45deg, #444, #666)',
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

            {/* Info Section */}
            <div style={{ width: '100%' }}>
                <h4 style={{
                    margin: '0 0 4px 0',
                    fontSize: '1rem',
                    color: '#fff',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {player.name}
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {player.position}
                </div>
                {player.height && (
                    <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
                        {player.height}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="dashboard-grid-vertical" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 2. Scraped Matches Table */}
            <div className="dashboard-card" style={{ padding: '1.5rem', minHeight: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#fff' }}>HUSA Schedule</h2>
                        <p style={{ color: '#888', fontSize: '0.9rem', margin: '5px 0 0 0' }}>Live data from FRMBB (Groupe -3-)</p>
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
                        {loadingMatches ? 'Syncing...' : 'Refresh Data'}
                    </button>
                </div>

                {loadingMatches ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                        <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#DB0A40', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        <p>Connecting to federation server...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '2rem', background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '8px', color: '#ff4d4d', textAlign: 'center' }}>
                        {error}
                        <br />
                        <button onClick={fetchScrapedMatches} style={{ marginTop: '1rem', background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Try Again</button>
                    </div>
                ) : matches.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#555', fontStyle: 'italic', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                        No HUSA matches found in the current schedule.
                    </div>
                ) : (
                    <div className="table-responsive" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontWeight: '600' }}>Date</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontWeight: '600' }}>Time</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontWeight: '600' }}>Match</th>
                                    <th style={{ padding: '12px', textAlign: 'center', color: '#ccc', fontWeight: '600' }}>Score</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: '#ccc', fontWeight: '600' }}>Venue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches && matches.map((match, idx) => {
                                    const isHome = match.home.includes('HUSA') || match.home.includes('Hassania');
                                    // Highlight row if contains HUSA (which all should)
                                    return (
                                        <tr key={idx} style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                                            transition: 'background 0.2s'
                                        }} className="match-row">
                                            <td style={{ padding: '12px', color: '#fff' }}>{match.date}</td>
                                            <td style={{ padding: '12px', color: '#888' }}>{match.time}</td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ color: isHome ? '#DB0A40' : '#fff', fontWeight: isHome ? '700' : '400' }}>{match.home}</span>
                                                    <span style={{ color: '#555', fontSize: '0.8rem' }}>vs</span>
                                                    <span style={{ color: !isHome ? '#DB0A40' : '#fff', fontWeight: !isHome ? '700' : '400' }}>{match.away}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <span style={{
                                                    background: match.score && match.score !== '-' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {match.score || '-'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', color: '#888' }}>{match.venue}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* 1. Squad Selection Section */}
            <div className="dashboard-card" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: '#fff' }}>Match Day Squad</h2>
                    <p style={{ color: '#888', fontSize: '0.9rem', margin: '5px 0 0 0' }}>Manage the 12-man roster for the upcoming game.</p>
                </div>

                <div className="squad-builder-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                    {/* Available Players Column */}
                    <div className="list-column">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ fontSize: '1rem', color: '#aaa', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Available Pool</h3>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>{availablePlayers.length} Players</span>
                        </div>
                        <div className="players-list-scroll full-custom-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', maxHeight: '500px', padding: '1rem', overflowY: 'auto', paddingRight: '5px' }}>
                            {availablePlayers.map(player => (
                                <PlayerCard
                                    key={player.id}
                                    player={player}
                                    action={handleSummon}
                                    actionLabel="+"
                                    variant="available"
                                />
                            ))}
                            {availablePlayers.length === 0 && <p style={{ textAlign: 'center', color: '#555', fontStyle: 'italic', padding: '1rem', gridColumn: '1/-1' }}>All players summoned.</p>}
                        </div>
                    </div>

                    {/* Summoned Players Column */}
                    <div className="list-column">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <h3 style={{ fontSize: '1rem', color: '#DB0A40', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Summoned Squad</h3>
                            <div style={{
                                background: summonedPlayers.length === 12 ? '#DB0A40' : 'rgba(219, 10, 64, 0.2)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                color: summonedPlayers.length === 12 ? '#fff' : '#DB0A40',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {summonedPlayers.length} / 12
                            </div>
                        </div>
                        <div className="players-list-scroll full-custom-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', maxHeight: '500px', overflowY: 'auto', padding: '1rem' }}>
                            {summonedPlayers.map(player => (
                                <PlayerCard
                                    key={player.id}
                                    player={player}
                                    action={handleDismiss}
                                    actionLabel="−"
                                    variant="summoned"
                                />
                            ))}
                            {summonedPlayers.length === 0 && <p style={{ textAlign: 'center', color: '#555', fontStyle: 'italic', padding: '1rem', gridColumn: '1/-1' }}>No players selected yet.</p>}
                        </div>
                    </div>

                </div>
            </div>



            {/* 3. Match Tactics Board */}
            {summonedPlayers.length > 0 && (
                <MatchTacticsBoard
                    summonedPlayers={summonedPlayers}
                    strategies={fullCourtStrategies}
                    showNotification={showNotification}
                />
            )}
        </div>
    );
};

export default Match;
