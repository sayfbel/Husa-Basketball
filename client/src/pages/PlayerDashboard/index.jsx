import React from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/dashboard.css'; // Shared premium style

const PlayerDashboard = () => {
    const { currentUser } = useAuth();

    return (
        <div className="dashboard-container container animate-fade-in">
            <div className="dashboard-header">
                <div className="dashboard-header-info">
                    <h1>Welcome, {currentUser?.name}</h1>
                    <p className="role-tag">Player Dashboard</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card status-card">
                    <h2>Current Status</h2>
                    <p>Training Camp: <span className="status-active">Active</span></p>
                    <p>Next Match: <span className="match-info">vs WAC (Feb 24)</span></p>
                </div>

                <div className="dashboard-card stats-card">
                    <h2>My Stats</h2>
                    <div className="stat-item">
                        <span>Games Played</span>
                        <strong>12</strong>
                    </div>
                    <div className="stat-item">
                        <span>Points Per Game</span>
                        <strong>18.5</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerDashboard;
