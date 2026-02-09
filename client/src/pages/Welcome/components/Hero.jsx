import React from 'react';
import Button from '../../../components/UI/Button';
import InstaCarousel from './InstaCarousel';
import '../css/hero.css';

const Hero = () => {
    return (
        <div className="hero-wrapper">
            <h1 className="hero-title animate-fade-in">DIMA HUSA</h1>
            <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>The Club of Identity</p>

            <InstaCarousel />

            <div className="hero-buttons animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button>Latest Matches</Button>
                <Button variant="outline">Join The Accuracy</Button>
            </div>
        </div>
    );
};

export default Hero;
