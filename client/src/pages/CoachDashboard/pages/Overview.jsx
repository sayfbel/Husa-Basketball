
import React from 'react';

const Overview = () => {
    return (
        <div className="dashboard-grid">
            <div className="dashboard-card tactics-card">
                <h2>Game Plan</h2>
                <p className="status-label">Upcoming: WAC</p>
                <div className="tactics-list">
                    <div className="tactic">Focus: Transition Defense</div>
                    <div className="tactic">Player Rotation: Aggressive Start</div>
                </div>
            </div>

            <div className="dashboard-card health-card">
                <h2>Player Health</h2>
                <div className="stat-item">
                    <span>Active Roster</span>
                    <strong>12/12</strong>
                </div>
                <div className="stat-item">
                    <span>Injuries</span>
                    <strong className="status-good">0</strong>
                </div>
            </div>
        </div>
    );
};

export default Overview;
