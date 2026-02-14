import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/ScrollToTop';

import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <ScrollToTop />
            <div className="app">
                <Navbar />
                <main>
                    <AppRoutes />
                </main>
                <Footer />
            </div>
        </AuthProvider>
    );
}

export default App;
