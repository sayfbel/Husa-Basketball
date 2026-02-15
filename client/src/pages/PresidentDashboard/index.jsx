import React from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/dashboard.css'; // Shared premium style
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';

// Import Sub-Pages
import Overview from './pages/Overview';
import Profile from './pages/Profile';
import Match from './pages/Match';
import Report from './pages/Report';


const PresidentDashboard = () => {
    const { currentUser } = useAuth();

    return (
        <div className="dashboard-container container animate-fade-in">
            <div className="dashboard-header">
                <div className="dashboard-header-top">
                    <div className="dashboard-header-info">
                        <h1>Welcome, President {currentUser?.name?.split(' ')[0]}</h1>
                        <p className="subtitle">Club oversight and executive operations center.</p>
                    </div>
                    <div className="role-tag president-tag animate-slide-right">Club President</div>
                </div>

                {/* Navigation Menu */}
                <nav className="dashboard-nav">
                    <NavLink
                        to="/dashboard/president"
                        end
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Overview
                    </NavLink>
                    <NavLink
                        to="/dashboard/president/profile"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Profile
                    </NavLink>
                    <NavLink
                        to="/dashboard/president/match"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Match
                    </NavLink>
                    <NavLink
                        to="/dashboard/president/report"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Reports
                    </NavLink>
                    <NavLink
                        to="/dashboard/president/club"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Club Status
                    </NavLink>
                </nav>
            </div>

            <div className="dashboard-content" style={{ marginTop: '2rem' }}>
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="match" element={<Match />} />
                    <Route path="report" element={<Report />} />
                    {/* Placeholder routes for future expansion */}
                    <Route path="club" element={<div className="glass-card p-4">Club Status Module Coming Soon</div>} />
                    <Route path="financials" element={<div className="glass-card p-4">Financial Oversight Module Coming Soon</div>} />
                </Routes>
            </div>

        </div>
    );
};

export default PresidentDashboard;
