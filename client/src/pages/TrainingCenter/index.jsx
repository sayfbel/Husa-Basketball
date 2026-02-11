import React from 'react';
import { Compass, Navigation, Info } from 'lucide-react';
import husaLogo from '../../assets/images/husa_logo.jpg';
import './css/training.css';

const TrainingCenter = () => {
    return (
        <div className="training-page container animate-fade-in">
            <div className="training-hero">
                <span className="training-super-title">Elite Academy</span>
                <h1 className="training-title">TRAINING<br />CENTER</h1>
                <p className="training-subtitle">
                    Our state-of-the-art facilities are where precision meets passion.
                    Join the next generation of Moroccan basketball stars.
                </p>
            </div>

            <div className="location-section">
                <div className="location-grid">
                    {/* Visual Panel: Interactive Map */}
                    <div className="map-container">
                        <div className="morocco-map-wrapper">
                            <svg className="morocco-map-svg" viewBox="0 0 500 600" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    className="morocco-path"
                                    d="M333,52 L345,58 L370,55 L382,65 L375,80 L385,95 L372,120 L380,145 L365,180 L340,210 L310,240 L280,270 L250,320 L220,380 L195,440 L170,500 L145,560 L120,580 L90,560 L105,500 L125,440 L150,380 L170,320 L185,260 L200,200 L220,150 L245,110 L275,80 L300,60 Z"
                                    fill="rgba(var(--primary-rgb), 0.05)"
                                    stroke="rgba(var(--primary-rgb), 0.3)"
                                    strokeWidth="1.5"
                                />
                                {/* Pin Positioning for Agadir (roughly 195, 240 in this viewBox) */}
                                <g className="map-pin-group" transform="translate(205, 235)">
                                    <circle cx="0" cy="0" r="15" className="pin-pulse" />
                                    <circle cx="0" cy="0" r="6" fill="#facc15" />
                                    <path d="M0 -35 L10 -15 L-10 -15 Z" fill="#facc15" />
                                    <text x="25" y="5" className="pin-label">HUSA HQ</text>
                                </g>
                            </svg>
                        </div>
                        <div className="map-overlay-title">
                            <h3>National Footprint</h3>
                            <p>Home of Agadir's Champion</p>
                        </div>
                    </div>

                    {/* Content Panel: Details */}
                    <div className="location-details">
                        <div className="details-header">
                            <img src={husaLogo} alt="HUSA" className="inline-logo" />
                            <h3>Centre de Formation</h3>
                        </div>

                        <div className="info-card">
                            <h4 className="venue-name">Salle Al Inbiâat</h4>
                            <p className="venue-address">Boulevard Mohammed V, Agadir 80000, Morocco</p>

                            <div className="guide-box">
                                <div className="guide-item">
                                    <div className="guide-dot"></div>
                                    <p>Located in the heart of Agadir's sports complex.</p>
                                </div>
                                <div className="guide-item">
                                    <div className="guide-dot"></div>
                                    <p>Near the main commercial district and tourism hub.</p>
                                </div>
                            </div>
                        </div>

                        <div className="transport-guides">
                            <div className="transport-item">
                                <div className="transport-icon">🚗</div>
                                <div className="transport-info">
                                    <h5>By Car</h5>
                                    <p>Parking available at Salle Al Inbiâat side entrance.</p>
                                </div>
                            </div>
                            <div className="transport-item">
                                <div className="transport-icon">🚌</div>
                                <div className="transport-info">
                                    <h5>By Bus</h5>
                                    <p>Lines 1, 3, and 5 stop directly at Station Al Inbiâat.</p>
                                </div>
                            </div>
                        </div>

                        <div className="facilities-glance">
                            <div className="facility-item">
                                <span className="facility-val">3</span>
                                <span className="facility-label">Pro Courts</span>
                            </div>
                            <div className="facility-item">
                                <span className="facility-val">12</span>
                                <span className="facility-label">Elite Coaches</span>
                            </div>
                            <div className="facility-item">
                                <span className="facility-val">GYM</span>
                                <span className="facility-label">Fitness Hub</span>
                            </div>
                        </div>

                        <button className="directions-btn" onClick={() => window.open('https://maps.app.goo.gl/3X5f8R7y5Q5Z7j8A6', '_blank')}>
                            Open in Google Maps
                        </button>
                    </div>
                </div>
            </div>

            <div className="training-cta">
                <div className="cta-content">
                    <Info size={40} className="cta-icon" />
                    <div className="cta-text">
                        <h3>Ready to train?</h3>
                        <p>Our facility is open for registrations every Monday and Thursday afternoon.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingCenter;
