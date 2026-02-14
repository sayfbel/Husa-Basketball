import React, { useState, useEffect } from 'react';
import PlayerCard from './components/PlayerCard';
import axios from 'axios';

import './css/squad.css';

import coachImage from '../../assets/images/players/coach.jpg';
import presidentImage from '../../assets/images/players/President.jpg';

const Squad = () => {
    const [players, setPlayers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSquadData = async () => {
            try {
                const [playersRes, staffRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/players'),
                    axios.get('http://localhost:5000/api/staff')
                ]);

                setPlayers(playersRes.data);

                // Format staff data to match PlayerCard expectations
                const formattedStaff = staffRes.data.map(member => ({
                    ...member,
                    number: member.id === 'st1' ? 'HC' : (member.id === 'st2' ? 'PR' : 'ST'),
                    image: member.id === 'st1' ? coachImage : (member.id === 'st2' ? presidentImage : member.photo_url),
                    role: member.role || 'Staff'
                }));
                setStaff(formattedStaff);

            } catch (err) {
                console.error("Error fetching squad:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSquadData();
    }, []);

    return (
        <div className="squad-page container animate-fade-in">
            <h1 className="squad-title">The Squad List</h1>

            {/* Coach Section */}
            <div className="staff-section">
                <h2 className="section-title">Technical Staff</h2>
                <div className="staff-grid">
                    {staff.map(member => (
                        <PlayerCard key={member.id} player={member} isStaff={true} />
                    ))}
                </div>
            </div>

            {/* Players Section */}
            <div className="roster-section">
                <h2 className="section-title">Roster</h2>
                {loading ? (
                    <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Loading Roster...</div>
                ) : (
                    <div className="squad-grid">
                        {players.map(player => (
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
                )}
            </div>
        </div>
    );
};


export default Squad;
