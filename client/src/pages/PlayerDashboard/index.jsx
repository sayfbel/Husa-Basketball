import React from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/dashboard.css'; // Shared premium style
import './css/playerDashboard.css'; // Player specific style
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';

// Import Sub-Pages
import Overview from './pages/Overview';
import Profile from './pages/Profile';
import Match from './pages/Match';
import Report from './pages/Report';
import Tactics from './pages/Tactics';

const PlayerDashboard = () => {
    const { currentUser } = useAuth();

    return (
        <div className="dashboard-container player-dashboard container animate-fade-in">
            <div className="dashboard-header">
                <div className="dashboard-header-top">
                    <div className="dashboard-header-info">
                        <h1>Welcome, {currentUser?.name?.split(' ')[0]}</h1>
                        <p className="subtitle">Track your performance and receive tactical briefings.</p>
                    </div>
                    <div className="role-tag player-tag animate-slide-right">Player Hub</div>
                </div>

                {/* Navigation Menu */}
                <nav className="dashboard-nav">
                    <NavLink
                        to="/dashboard/player"
                        end
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Overview
                    </NavLink>
                    <NavLink
                        to="/dashboard/player/profile"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Profile
                    </NavLink>
                    <NavLink
                        to="/dashboard/player/match"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Match
                    </NavLink>
                    <NavLink
                        to="/dashboard/player/report"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Reports
                    </NavLink>
                    <NavLink
                        to="/dashboard/player/tactics"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Tactics
                    </NavLink>
                </nav>
            </div>

            <div className="dashboard-content" style={{ marginTop: '2rem' }}>
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="match" element={<Match />} />
                    <Route path="report" element={<Report />} />
                    <Route path="rapore" element={<Navigate to="report" replace />} />
                    <Route path="tactics" element={<Tactics />} />
                    {/* Handle potential typos or alternative names */}
                </Routes>
            </div>
        </div>
    );
};

export default PlayerDashboard;
