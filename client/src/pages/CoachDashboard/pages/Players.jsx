import React, { useState, useEffect } from 'react';
import '../../../css/dashboard.css';
import '../css/players.css';

const Players = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div>Loading Roster...</div>;

    return (
        <div className="dashboard-grid players-grid">
            {players.map(player => {
                // Try to find a local image matched by name if photo_url is missing
                // Convert "MOUDDEN MOHAMED" or "moudden mohamed" to "MouddenMohamed"
                const formattedName = player.name
                    .split(/\s+/)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join('');

                const localImagePath = `/assets/players/${formattedName}.jpg`;
                const imageSrc = player.photo_url || localImagePath;

                return (
                    <div key={player.id} className="dashboard-card player-card">
                        <div className="player-card-image">
                            <img
                                src={imageSrc}
                                alt={player.name}
                                onError={(e) => {
                                    if (e.target.src.includes('.jpg')) {
                                        // If the name-based jpg failed, try the default png
                                        e.target.src = '/assets/players/default.png';
                                    } else {
                                        // Final fallback
                                        e.target.src = '/assets/players/default.png';
                                    }
                                }}
                            />
                            <div className="player-number">#{player.jersey_number}</div>
                        </div>
                        <div className="player-card-info">
                            <h3>{player.name}</h3>
                            <p className="player-pos">{player.position}</p>
                            <div className="player-stats-mini">
                                <span>{player.height}</span>
                                <span>{player.weight}</span>
                                <span>{player.age} yrs</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Players;
