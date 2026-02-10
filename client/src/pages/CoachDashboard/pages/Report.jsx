
import React from 'react';

const Report = () => {
    return (
        <div className="dashboard-grid">
            <div className="dashboard-card status-card">
                <h2>Post-Game Analysis (Last Match)</h2>
                <div className="stat-item">
                    <span>FG %</span>
                    <strong>45.2%</strong>
                </div>
                <div className="stat-item">
                    <span>3P %</span>
                    <strong>33.1%</strong>
                </div>
                <div className="stat-item">
                    <span>Turnovers</span>
                    <strong>12</strong>
                </div>
            </div>
            <div className="dashboard-card health-card">
                <h2>Scouting Report (Next Opponent)</h2>
                <div className="tactics-list">
                    <div className="tactic">Key Player: A. Smith (PG)</div>
                    <div className="tactic">Weakness: Interior Defense</div>
                </div>
            </div>
        </div>
    );
};

export default Report;
