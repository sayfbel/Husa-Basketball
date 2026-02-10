import React from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/dashboard.css'; // Shared premium style

const PresidentDashboard = () => {
    const { currentUser } = useAuth();

    return (
        <div className="dashboard-container container animate-fade-in">
            <div className="dashboard-header">
                <div className="dashboard-header-info">
                    <h1>Welcome, Mr. President {currentUser?.name}</h1>
                    <p className="role-tag president-tag">Club Executive</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card status-card">
                    <h2>Financial Overview</h2>
                    <div className="stat-item">
                        <span>Current Budget</span>
                        <strong>1,200,000 DH</strong>
                    </div>
                </div>

                <div className="dashboard-card">
                    <h2>Staff Meetings</h2>
                    <div className="tactic">Weekly Briefing - Tue 10:00</div>
                </div>
            </div>
        </div>
    );
};

export default PresidentDashboard;
