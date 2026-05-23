import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import {
    ShoppingBag,
    FileText,
    TrendingUp,
    Clock,
    ChevronRight,
    Megaphone,
    Package,
    ShieldAlert
} from 'lucide-react';
import '../../../css/dashboard.css';
import '../../PresidentDashboard/css/Overview.css';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const Overview = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [newsCount, setNewsCount] = useState(0);
    const [productsCount, setProductsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [newsRes, productsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/news'),
                    axios.get('http://localhost:5000/api/store')
                ]);
                setNewsCount((newsRes.data || []).length);
                setProductsCount((productsRes.data || []).length);
            } catch (err) {
                console.error("Error fetching social media stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-spinner">Accessing Operations Systems...</div>;

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* 1. Cinematic Header */}
            <div className="section-header-modern" style={{ borderBottom: '1px solid rgba(219, 10, 64, 0.2)' }}>
                <div className="watermark-bg" style={{ color: 'rgba(219, 10, 64, 0.05)' }}>MEDIA</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA Logo" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">MEDIA & MERCHANDISING PORTAL</span>
                    <h1 className="hero-dashboard-title">
                        OPERATIONS <br />
                        <span className="accent-text">CENTER</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <div className="pulse-dot"></div>
                            <span>STATUS: ACTIVE CONNECTION</span>
                        </div>
                        <div className="divider"></div>
                        <div className="status-item">
                            <Clock size={14} />
                            <span>SYSTEM TIME: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Media & Merch Stats Modules */}
            <div className="dashboard-grid matrix-grid">
                <div className="status-module glow-red" style={{ borderColor: 'rgba(219, 10, 64, 0.2)', boxShadow: '0 4px 30px rgba(219, 10, 64, 0.05)' }} onClick={() => navigate('/dashboard/socialmedia/news')}>
                    <div className="module-inner">
                        <FileText className="module-icon" />
                        <span className="module-label">OFFICIAL NEWS BULLETINS</span>
                        <h2 className="module-value" style={{ color: '#fff' }}>{newsCount}</h2>
                        <div className="module-progress">
                            <div className="progress-fill" style={{ width: '100%', background: 'var(--accent)' }}></div>
                        </div>
                        <span className="module-sub">PUBLISHED NEWS ARTICLES</span>
                    </div>
                </div>

                <div className="status-module glow-red" style={{ borderColor: 'rgba(219, 10, 64, 0.2)', boxShadow: '0 4px 30px rgba(219, 10, 64, 0.05)' }} onClick={() => navigate('/dashboard/socialmedia/store')}>
                    <div className="module-inner">
                        <ShoppingBag className="module-icon" />
                        <span className="module-label">STORE CATALOG</span>
                        <h2 className="module-value" style={{ color: '#fff' }}>{productsCount}</h2>
                        <div className="module-progress">
                            <div className="progress-fill" style={{ width: '100%', background: 'var(--accent)' }}></div>
                        </div>
                        <span className="module-sub">ACTIVE INVENTORY PRODUCTS</span>
                    </div>
                </div>

                <div className="status-module glow-white" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="module-inner">
                        <TrendingUp className="module-icon" style={{ color: '#10b981' }} />
                        <span className="module-label">SYSTEM HEALTH</span>
                        <h2 className="module-value" style={{ color: '#10b981' }}>100%</h2>
                        <div className="module-progress">
                            <div className="progress-fill" style={{ width: '100%', background: '#10b981' }}></div>
                        </div>
                        <span className="module-sub">ALL UPLINKS ONLINE</span>
                    </div>
                </div>
            </div>

            {/* 3. Operational Quick Actions */}
            <div className="operational-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="intel-card engagement-card" style={{ background: 'rgba(10, 10, 10, 0.6)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="card-glitch-header">OPERATIONAL DIRECTIVES</div>
                    <div className="engagement-content" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        
                        {/* News quick card */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '2rem', border: '1px solid rgba(219, 10, 64, 0.15)', display: 'flex', flexDirection: 'column', gap: '1.2rem', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Megaphone color="var(--accent)" size={24} />
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>News Publication</h3>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: '1.6', marginTop: '1rem' }}>
                                    Draft and distribute news bulletins, match reviews, or standard updates straight to the club's command bulletins.
                                </p>
                            </div>
                            <button
                                className="intel-btn-primary"
                                style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', alignSelf: 'flex-start', padding: '10px 20px', fontSize: '0.75rem', width: 'auto' }}
                                onClick={() => navigate('/dashboard/socialmedia/news')}
                            >
                                MANAGE BULLETINS <ChevronRight size={14} />
                            </button>
                        </div>

                        {/* Store quick card */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '2rem', border: '1px solid rgba(219, 10, 64, 0.15)', display: 'flex', flexDirection: 'column', gap: '1.2rem', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Package color="var(--accent)" size={24} />
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Store Catalog</h3>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#888', lineHeight: '1.6', marginTop: '1rem' }}>
                                    Add, update, or clear items in the official HUSA Basketball merchandise store, including images and price guidelines.
                                </p>
                            </div>
                            <button
                                className="intel-btn-primary"
                                style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', alignSelf: 'flex-start', padding: '10px 20px', fontSize: '0.75rem', width: 'auto' }}
                                onClick={() => navigate('/dashboard/socialmedia/store')}
                            >
                                MANAGE STORE <ChevronRight size={14} />
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* 4. Operations Banner */}
            <div className="intel-card transmission-uplink" style={{ background: 'rgba(10,10,10,0.8)', borderColor: 'rgba(219, 10, 64, 0.2)' }}>
                <div className="transmission-uplink-inner">
                    <div className="transmission-uplink-content">
                        <div className="transmission-icon-box" style={{ background: 'rgba(219, 10, 64, 0.1)', border: '1px solid rgba(219, 10, 64, 0.3)' }}>
                            <ShieldAlert size={24} color="var(--accent)" />
                        </div>
                        <div>
                            <div className="transmission-uplink-title" style={{ color: '#fff' }}>MEDIA HUB PRIVILEGES ACTIVE</div>
                            <div className="transmission-uplink-sub" style={{ color: '#aaa' }}>Authorized to compose, modify, or delete high-importance club broadcasts.</div>
                        </div>
                    </div>
                    <button
                        className="intel-btn-primary uplink-btn"
                        style={{ background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }}
                        onClick={() => navigate('/news')}
                    >
                        GO TO PUBLIC NEWS FEED
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Overview;
