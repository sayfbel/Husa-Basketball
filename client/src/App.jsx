import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import AppRoutes from './routes/AppRoutes';

function App() {
    return (
        <div className="app">
            <Navbar />
            <main>
                <AppRoutes />
            </main>
            <Footer />
        </div>
    );
}

export default App;
