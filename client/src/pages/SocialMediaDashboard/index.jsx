import React from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../css/dashboard.css'; // Shared premium style
import { Routes, Route, NavLink } from 'react-router-dom';

// Import Sub-Pages
import Overview from './pages/Overview';
import StoreManager from '../PresidentDashboard/pages/StoreManager';
import NewsManager from './pages/NewsManager';
import Profile from './pages/Profile';

const SocialMediaDashboard = () => {
    const { currentUser, logout } = useAuth();

    return (
        <div className="dashboard-container container animate-fade-in">
            <div className="dashboard-header">
                <div className="dashboard-header-top">
                    <div className="dashboard-header-info">
                        <h1>Welcome, {currentUser?.name?.split(' ')[0]}</h1>
                        <p className="subtitle">Club media operations and inventory management terminal.</p>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="dashboard-nav">
                    <NavLink
                        to="/dashboard/socialmedia"
                        end
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Overview
                    </NavLink>
                    <NavLink
                        to="/dashboard/socialmedia/store"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Store Catalog
                    </NavLink>
                    <NavLink
                        to="/dashboard/socialmedia/news"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        News Bulletins
                    </NavLink>
                    <NavLink
                        to="/dashboard/socialmedia/profile"
                        className={({ isActive }) => isActive ? "dash-link active" : "dash-link"}
                    >
                        Profile Dossier
                    </NavLink>
                </nav>
            </div>

            <div className="dashboard-content" style={{ marginTop: '2rem' }}>
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="store" element={<StoreManager />} />
                    <Route path="news" element={<NewsManager />} />
                    <Route path="profile" element={<Profile />} />
                </Routes>
            </div>
        </div>
    );
};

export default SocialMediaDashboard;
