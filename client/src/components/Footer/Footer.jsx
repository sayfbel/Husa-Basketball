import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Facebook, MapPin, Trophy, Mail, Shield, Zap } from 'lucide-react';
import './Footer.css';

import husaLogo from '../../assets/images/husa_logo.jpg';

const Footer = () => {
    return (
        <footer className="footer dashboard-fashion-theme">
            <div className="watermark-bg" style={{ bottom: '-40px', left: '5%', top: 'auto', right: 'auto', opacity: '0.03', zIndex: 0 }}>HUSA</div>
            <div className="container footer-content" style={{ position: 'relative', zIndex: 1 }}>

                {/* Brand Section */}
                <div className="footer-section brand" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
                    <div className="footer-brand-header">
                        <img src={husaLogo} alt="HUSA Logo" className="footer-logo-img" />
                        <div>
                            <span className="premium-label" style={{ marginBottom: '5px' }}>EXECUTIVE OVERSIGHT</span>
                            <h2 className="footer-logo" style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
                                HUSA <span style={{ color: '#DB0A40' }}>BASKETBALL</span>
                            </h2>
                        </div>
                    </div>
                    <p className="footer-description" style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6', marginTop: '1rem' }}>
                        The pride of Agadir. Associated with Hassania Union Sport d’Agadir.
                        Dedicated to excellence, youth development, and Moroccan basketball spirit.
                    </p>
                    <div className="social-links" style={{ marginTop: '1.5rem' }}>
                        <a href="https://www.instagram.com/husabasketball/" target="_blank" rel="noopener noreferrer" className="social-icon intel-btn-secondary" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: '4px' }}>
                            <Camera size={18} />
                        </a>
                        <a href="https://www.facebook.com/p/HUSA-Basketball-100079564001494/" target="_blank" rel="noopener noreferrer" className="social-icon intel-btn-secondary" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: '4px' }}>
                            <Facebook size={18} />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="footer-section links intel-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.9rem', letterSpacing: '2px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', textTransform: 'uppercase' }}>
                        <Zap size={16} color="#DB0A40" /> SYSTEM ARCHIVES
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 0 0' }}>
                        <li style={{ marginBottom: '12px' }}><Link to="/" className="dash-link" style={{ padding: 0, fontSize: '0.85rem', background: 'transparent', margin: 0 }}>Home</Link></li>
                        <li style={{ marginBottom: '12px' }}><Link to="/news" className="dash-link" style={{ padding: 0, fontSize: '0.85rem', background: 'transparent', margin: 0 }}>Global Intel</Link></li>
                        <li style={{ marginBottom: '12px' }}><Link to="/squad" className="dash-link" style={{ padding: 0, fontSize: '0.85rem', background: 'transparent', margin: 0 }}>Active Personnel</Link></li>
                        <li style={{ marginBottom: '12px' }}><Link to="/join" className="dash-link" style={{ padding: 0, fontSize: '0.85rem', background: 'transparent', margin: 0 }}>Recruitment</Link></li>
                        <li style={{ marginBottom: '12px' }}><Link to="/contact" className="dash-link" style={{ padding: 0, fontSize: '0.85rem', background: 'transparent', margin: 0 }}>Comms Hub</Link></li>
                    </ul>
                </div>

                {/* Official Info */}
                <div className="footer-section info intel-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.9rem', letterSpacing: '2px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', textTransform: 'uppercase' }}>
                        <Shield size={16} color="#DB0A40" /> COMMAND INFO
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 0 0' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontSize: '0.85rem', color: '#aaa' }}>
                            <MapPin size={16} color="#DB0A40" /> Agadir Base, Morocco
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontSize: '0.85rem', color: '#aaa' }}>
                            <Trophy size={16} color="#DB0A40" /> FRMBB Sanctioned
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontSize: '0.85rem', color: '#aaa' }}>
                            <Mail size={16} color="#DB0A40" /> contact@husabasketball.ma
                        </li>
                    </ul>
                    <div style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(219, 10, 64, 0.1)', border: '1px solid rgba(219, 10, 64, 0.3)', padding: '10px 15px', color: '#DB0A40', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                        <Shield size={14} /> OFFICIAL FRMBB MEMBER
                    </div>
                </div>

            </div>

            <div className="footer-bottom" style={{ marginTop: '4rem', padding: '2rem', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <p style={{ margin: 0, color: '#666', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 'bold' }}>
                    &copy; {new Date().getFullYear()} HUSA COMMAND. ALL OPERATIONS SECURED.
                </p>
                <p className="credits" style={{ margin: '8px 0 0 0', color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Infrastructure by Cybernetics Division
                </p>
            </div>
        </footer>
    );
};

export default Footer;
