import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

import husaLogo from '../../assets/images/husa_logo.jpg';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

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

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-content">
                <Link to="/" className="logo">
                    <img src={husaLogo} alt="HUSA Logo" className="navbar-logo-img" />
                    HUSA <span>Basketball</span>
                </Link>
                <ul className="nav-links">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/history">History</Link></li>
                    <li><Link to="/news">News</Link></li>
                    <li><Link to="/squad">Squad</Link></li>
                    <li className="dropdown-wrapper">
                        <Link to="/contact" className="contact-btn">Contact</Link>
                        <div className="dropdown-card">
                            <Link to="/reservation">Kids Reservation</Link>
                            <Link to="/training">Training Center</Link>
                            <Link to="/join">Join Team</Link>
                            <Link to="/fans">Fan Support</Link>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
