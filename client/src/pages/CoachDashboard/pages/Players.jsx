import React, { useState, useEffect } from 'react';
import { Users, Activity, Search } from 'lucide-react';
import PlayerCard from '../../Squad/components/PlayerCard';
import '../../../css/dashboard.css';
import '../../Squad/css/squad.css';
import '../../PresidentDashboard/css/Overview.css';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const Players = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/players');
                const data = await res.json();
                setPlayers(data);
            } catch (err) {
                console.error("Failed to fetch players", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.position.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="loading-spinner">Accessing Athlete Database...</div>;

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">PLAYERS</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">ATHLETE ROSTER</span>
                    <h1 className="hero-dashboard-title">
                        SQUAD <br />
                        <span className="accent-text">DATABASE</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <Users size={14} />
                            <span>{players.length} ACTIVE ASSETS</span>
                        </div>
                        <div className="status-item">
                            <Activity size={14} />
                            <span>SYSTEM READY</span>
                        </div>
                    </div>
                </div>

                {/* Header Actions */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div className="search-box-v2" style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                        <input
                            type="text"
                            placeholder="SEARCH ASSETS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                padding: '12px 15px 12px 45px',
                                borderRadius: '0',
                                color: '#fff',
                                fontSize: '0.8rem',
                                letterSpacing: '1px',
                                outline: 'none',
                                width: '250px',
                                transition: '0.3s'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Player Grid */}
            <div className="squad-grid">
                {filteredPlayers.map(player => (
                    <PlayerCard
                        key={player.id}
                        player={{
                            ...player,
                            number: player.jersey_number?.toString().padStart(2, '0') || '--',
                            image: player.photo_url || null,
                            role: player.position || 'Player'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Players;
