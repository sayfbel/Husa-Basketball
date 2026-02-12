import React from 'react';
import { useNavigate } from 'react-router-dom';
import './css/thanks.css';

const Thanks = () => {
    const navigate = useNavigate();

    return (
        <div className="thanks-page fashion-theme">
            <div className="watermark-text">HUSA</div>

            <div className="thanks-content">
                <div className="header-badge">
                    <span>SUCCESSFULLY RECORDED</span>
                </div>

                <h1 className="main-title">
                    WELCOME TO <br />
                    <span className="accent">THE TRIBE</span>
                </h1>

                <p className="description">
                    YOUR ORDER HAS BEEN CONFIRMED. <br />
                    EXPECT A CALL FROM OUR TEAM WITHIN 24H.
                </p>

                <div className="actions-section">
                    <button className="fashion-btn primary" onClick={() => navigate('/fans')}>
                        RETURN TO STORE
                    </button>
                    <button className="fashion-btn secondary" onClick={() => navigate('/')}>
                        BACK TO HOME
                    </button>
                </div>
            </div>

            <div className="page-footer">
                <div className="footer-line"></div>
                <div className="footer-info">
                    <span>© 2025 HUSA BASKETBALL CLUB</span>
                    <span className="tag">OFFICIAL GEAR</span>
                </div>
            </div>
        </div>
    );
};

export default Thanks;
