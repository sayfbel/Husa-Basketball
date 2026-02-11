import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from '../pages/Welcome';
import History from '../pages/History';
import News from '../pages/News';
import Squad from '../pages/Squad';
import JoinTeam from '../pages/JoinTeam';
import Contact from '../pages/Contact';
import KidsReservation from '../pages/KidsReservation';
import Staff from '../pages/Staff';
import TrainingCenter from '../pages/TrainingCenter';
import FanSupport from '../pages/FanSupport';
// import AdminDashboard from '../pages/AdminDashboard'; // Deleted
import PlayerDashboard from '../pages/PlayerDashboard';
import CoachDashboard from '../pages/CoachDashboard';
import PresidentDashboard from '../pages/PresidentDashboard';
import Login from '../pages/Login';
import Rules from '../pages/Rules';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/history" element={<History />} />
            <Route path="/news" element={<News />} />
            <Route path="/squad" element={<Squad />} />
            <Route path="/join" element={<JoinTeam />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reservation" element={<KidsReservation />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/training" element={<TrainingCenter />} />
            <Route path="/fans" element={<FanSupport />} />
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Role-Based Routes */}
            <Route element={<ProtectedRoute allowedRoles={['Player']} />}>
                <Route path="/dashboard/player/*" element={<PlayerDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['Coach']} />}>
                <Route path="/dashboard/coach/*" element={<CoachDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['President']} />}>
                <Route path="/dashboard/president/*" element={<PresidentDashboard />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
