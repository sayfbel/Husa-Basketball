import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

import husaLogo from '../../assets/images/husa_logo.jpg';

const Footer = () => {
    return (
        <footer className="footer glass-card">
            <div className="container footer-content">

                {/* Brand Section */}
                <div className="footer-section brand">
                    <div className="footer-brand-header">
                        <img src={husaLogo} alt="HUSA Logo" className="footer-logo-img" />
                        <h2 className="footer-logo">HUSA <span>Basketball</span></h2>
                    </div>
                    <p className="footer-description">
                        The pride of Agadir. Associated with Hassania Union Sport d’Agadir.
                        Dedicated to excellence, youth development, and Moroccan basketball spirit.
                    </p>
                    <div className="social-links">
                        <a href="https://www.instagram.com/husabasketball/" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <span className="material-icons-outlined">photo_camera</span>
                        </a>
                        <a href="https://www.facebook.com/p/HUSA-Basketball-100079564001494/" target="_blank" rel="noopener noreferrer" className="social-icon">
                            <span className="material-icons-outlined">facebook</span>
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="footer-section links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/news">News & Media</Link></li>
                        <li><Link to="/squad">The Squad</Link></li>
                        <li><Link to="/join">Join the Team</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                </div>

                {/* Official Info */}
                <div className="footer-section info">
                    <h3>Club Info</h3>
                    <ul>
                        <li><span className="material-icons-outlined">location_on</span> Agadir, Morocco</li>
                        <li><span className="material-icons-outlined">sports_basketball</span> FRMBB Affiliated</li>
                        <li><span className="material-icons-outlined">email</span> contact@husabasketball.ma</li>
                    </ul>
                    <div className="partner-badge">
                        <p>Official Member of FRMBB</p>
                    </div>
                </div>

            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} HUSA Basketball. All rights reserved.</p>
                <p className="credits">Designed for the Champions of Agadir</p>
            </div>
        </footer>
    );
};

export default Footer;
