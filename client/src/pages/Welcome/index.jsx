import React from 'react';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import Seasons from './components/Seasons';
import Partners from './components/Partners';
import SocialCentral from './components/SocialCentral';
import Colab from './components/colabe';
import './css/welcome.css';
import './css/social-central.css';

const Welcome = () => {
    return (
        <div className="welcome-page">
            <div className="welcome-bg-glow"></div>
            <Hero />
            <StatsBar />
            <Seasons />
            <SocialCentral />
            <Partners />
            <Colab />
        </div>
    );
};

export default Welcome;
