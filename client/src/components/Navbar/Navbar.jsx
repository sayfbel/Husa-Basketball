import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

import husaLogo from '../../assets/images/husa_logo.jpg';

const Navbar = () => {
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
                    </ul>
                </div>
            </nav>
            {isMenuOpen && <div className="nav-overlay active" onClick={closeMenu}></div>}
        </>
    );
};

export default Navbar;
