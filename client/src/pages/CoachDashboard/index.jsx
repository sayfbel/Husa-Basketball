
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/dashboard.css'; // Shared premium style
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';

// Import Sub-Pages
import Overview from './pages/Overview';
import Players from './pages/Players';
import Strategy from './pages/Strategy';
import Report from './pages/Report';
import Match from './pages/Match';

const CoachDashboard = () => {
    const { currentUser } = useAuth();

    return (
        <div className="dashboard-container container animate-fade-in">
            <div className="dashboard-header">
                <div className="dashboard-header-top">
                    <div className="dashboard-header-info">
                        <h1>Welcome, Coach {currentUser?.name}</h1>
                    </div>
                    <p className="role-tag coach-tag">Team Strategy</p>
                </div>

                {/* Navigation Menu */}
                <nav className="dashboard-nav">
                    <NavLink to="/dashboard/coach" end className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}>Overview</NavLink>
                    <NavLink to="/dashboard/coach/players" className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}>Players</NavLink>
                    <NavLink to="/dashboard/coach/strategy" className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}>Strategy</NavLink>
                    <NavLink to="/dashboard/coach/report" className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}>Report</NavLink>
                    <NavLink to="/dashboard/coach/match" className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}>Match</NavLink>
                </nav>
            </div>

            <div className="dashboard-content">
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="players" element={<Players />} />
                    <Route path="strategy" element={<Strategy />} />
                    <Route path="stratygy" element={<Navigate to="strategy" replace />} /> {/* Typo redirect */}
                    <Route path="report" element={<Report />} />
                    <Route path="raport" element={<Navigate to="report" replace />} /> {/* Typo redirect */}
                    <Route path="match" element={<Match />} />
                </Routes>
            </div>
        </div>
    );
};

export default CoachDashboard;
