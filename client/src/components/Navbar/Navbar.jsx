import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

import husaLogo from '../../assets/images/husa_logo.jpg';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'unset';
    };

    const getProfileRoute = (role) => {
        switch (role) {
            case 'Player': return '/dashboard/player/profile';
            case 'Coach': return '/dashboard/coach/profile';
            case 'President': return '/dashboard/president/profile';
            case 'SocialMedia': return '/dashboard/socialmedia/profile';
            default: return '/dashboard/player/profile';
        }
    };

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
                <div className="container nav-content">
                    <Link to="/" className="logo" onClick={closeMenu}>
                        <img src={husaLogo} alt="HUSA Logo" className="navbar-logo-img" />
                        HUSA <span className="basketball-text">
                            {"Basketball".split("").map((letter, i) => (
                                <span key={i} className="basketball-letter">{letter}</span>
                            ))}
                        </span>
                    </Link>

                    <button className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle Menu">
                        <span className="material-icons-outlined">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
                        <li><Link to="/history" onClick={closeMenu}>History</Link></li>
                        <li><Link to="/news" onClick={closeMenu}>News</Link></li>
                        <li><Link to="/squad" onClick={closeMenu}>Squad</Link></li>
                        <li className="dropdown-wrapper">
                            <Link to="/contact" className="contact-btn" onClick={closeMenu}>Contact</Link>
                            <div className="dropdown-card">
                                <Link to="/reservation" onClick={closeMenu}>Kids Reservation</Link>
                                <Link to="/join" onClick={closeMenu}>Join Team</Link>
                                <Link to="/fans" onClick={closeMenu}>Fan Support</Link>
                            </div>
                        </li>
                        {currentUser && (
                            <li className="dropdown-wrapper account-dropdown-wrapper">
                                <Link to={getProfileRoute(currentUser.role)} onClick={closeMenu} className="account-link">
                                    <div className="account-avatar-container">
                                        <img 
                                            src={currentUser.image || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHzmMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg=="} 
                                            alt={currentUser.name} 
                                            className="account-avatar-img"
                                            onError={(e) => {
                                                e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHzmMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";
                                            }}
                                        />
                                        <span className="account-status-dot"></span>
                                    </div>
                                    <span className="account-name-text">{currentUser.name?.split(' ')[0]}</span>
                                    <span className="material-icons-outlined account-chevron">keyboard_arrow_down</span>
                                </Link>
                                <div className="dropdown-card account-dropdown-card">
                                    <div className="account-dropdown-header">
                                        <span className="account-dropdown-name">{currentUser.name}</span>
                                        <span className={`account-role-badge ${currentUser.role?.toLowerCase()}-badge`}>
                                            {currentUser.role}
                                        </span>
                                    </div>
                                    <div className="account-dropdown-divider"></div>
                                    <Link to={`/dashboard/${currentUser.role?.toLowerCase()}`} onClick={closeMenu}>
                                        <span className="material-icons-outlined">dashboard</span>
                                        Dashboard
                                    </Link>
                                    <Link to={getProfileRoute(currentUser.role)} onClick={closeMenu}>
                                        <span className="material-icons-outlined">person</span>
                                        Profile Dossier
                                    </Link>
                                    <div className="account-dropdown-divider"></div>
                                    <button 
                                        onClick={() => { logout(); closeMenu(); }} 
                                        className="account-logout-btn"
                                    >
                                        <span className="material-icons-outlined">logout</span>
                                        Log Out
                                    </button>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
            {isMenuOpen && <div className="nav-overlay active" onClick={closeMenu}></div>}
        </>
    );
};

export default Navbar;
