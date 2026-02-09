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
import AdminDashboard from '../pages/AdminDashboard';

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
            <Route path="/staff" element={<Staff />} />
            <Route path="/training" element={<TrainingCenter />} />
            <Route path="/fans" element={<FanSupport />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
    );
};

export default AppRoutes;
