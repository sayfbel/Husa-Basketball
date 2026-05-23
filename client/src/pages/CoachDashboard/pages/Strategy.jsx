import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../../../components/Notification/Notification';
import TacticalWorkspace from './TacticalWorkspace.jsx';
import '../../../css/dashboard.css';
import '../css/strategy.css';
import {
    Trash2,
    Clock,
    Zap,
    Layout,
    Shield,
    Activity
} from 'lucide-react';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const MiniCourtPreview = ({ tactic }) => {
    const firstFrame = tactic.data[0] || { tokens: [], paths: [] };
    const type = tactic.type || 'full';
    const viewBoxH = type === 'full' ? 560 : 470;
    const viewBoxW = type === 'full' ? 1000 : 500;

    return (
        <div className="mini-court-preview">
            <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                <defs>
                    <filter id="premium-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="15" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <radialGradient id="token-radial" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#DB0A40" />
                        <stop offset="100%" stopColor="#7a0624" />
                    </radialGradient>
                </defs>

                {/* Court Outline Subtle */}
                <rect width={viewBoxW} height={viewBoxH} fill="#0a0a0a" />

                {/* HUSA Background Logo */}
                <image
                    href={husaLogo}
                    x={viewBoxW / 2 - 180}
                    y={viewBoxH / 2 - 180}
                    width="360"
                    height="360"
                    opacity="0.05"
                    style={{ filter: 'grayscale(1) brightness(0.3)' }}
                />

                {/* Court Lines - Tactical Grey */}
                <rect width={viewBoxW} height={viewBoxH} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                {type === 'full' ? (
                    <>
                        <line x1="500" y1="0" x2="500" y2="560" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <circle cx="500" cy="280" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <rect x="0" y="205" width="190" height="150" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <rect x="810" y="205" width="190" height="150" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <g stroke="#DB0A40" strokeWidth="3" fill="none" opacity="0.15">
                            <line x1="190" y1="205" x2="190" y2="355" />
                            <path d="M 190,205 A 75,75 0 0 1 190,355" />
                            <line x1="810" y1="205" x2="810" y2="355" />
                            <path d="M 810,205 A 75,75 0 0 0 810,355" />
                        </g>
                        <path d="M 0 450 Q 300 280 0 110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <path d="M 1000 450 Q 700 280 1000 110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />

                        {/* Rims for Mini Preview */}
                        <g stroke="#DB0A40" strokeWidth="3" fill="none" opacity="0.2">
                            <line x1="25" y1="250" x2="25" y2="310" />
                            <circle cx="45" cy="280" r="10" />
                            <line x1="975" y1="250" x2="975" y2="310" />
                            <circle cx="955" cy="280" r="10" />
                        </g>
                    </>
                ) : (
                    <>
                        <path d="M 0 350 Q 250 205 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <rect x="0" y="150" width="160" height="100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                        <g stroke="#DB0A40" strokeWidth="3" fill="none" opacity="0.2">
                            <line x1="15" y1="180" x2="15" y2="220" />
                            <circle cx="35" cy="200" r="8" />
                        </g>
                    </>
                )}

                {/* Tokens with High-Quality Glow */}
                {firstFrame.tokens.map((token, idx) => (
                    <g key={idx}>
                        {token.type === 'offense' ? (
                            <>
                                <circle
                                    cx={`${token.x * (viewBoxW / 100)}`}
                                    cy={`${token.y * (viewBoxH / 100)}`}
                                    r="28"
                                    fill="none"
                                    stroke="#DB0A40"
                                    strokeWidth="2"
                                    opacity="0.5"
                                    filter="url(#premium-glow)"
                                />
                                <circle
                                    cx={`${token.x * (viewBoxW / 100)}`}
                                    cy={`${token.y * (viewBoxH / 100)}`}
                                    r="14"
                                    fill="url(#token-radial)"
                                    filter="url(#premium-glow)"
                                />
                                <circle
                                    cx={`${token.x * (viewBoxW / 100)}`}
                                    cy={`${token.y * (viewBoxH / 100)}`}
                                    r="8"
                                    fill="#fff"
                                    opacity="0.2"
                                />
                            </>
                        ) : (
                            <circle
                                cx={`${token.x * (viewBoxW / 100)}`}
                                cy={`${token.y * (viewBoxH / 100)}`}
                                r="12"
                                fill="#222"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="1"
                            />
                        )}
                    </g>
                ))}

                {/* Connected Lines (Dashed Network) */}
                {firstFrame.paths.map((d, idx) => (
                    <path key={idx} d={d} fill="none" stroke="#DB0A40" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
                ))}
            </svg>
            <div className="preview-gradient-overlay" />
        </div>
    );
};

const Strategy = () => {
    const [savedTactics, setSavedTactics] = useState([]);
    const { showNotification, showConfirm } = useNotification();
    const location = useLocation();

    useEffect(() => {
        fetchTactics();
    }, []);

    // Handle auto-load from Overview
    useEffect(() => {
        if (savedTactics.length > 0 && location.state?.loadTacticId) {
            const tactic = savedTactics.find(t => t.id === location.state.loadTacticId);
            if (tactic) {
                // Short timeout to ensure workspace components are fully ready to receive events
                setTimeout(() => {
                    loadTactic(tactic, false); // Skip confirmation for auto-load

                    const workspaceId = `workspace-${tactic.type || 'full'}`;
                    const element = document.getElementById(workspaceId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);
            }
        }
    }, [savedTactics, location.state]);

    const fetchTactics = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/strategies');
            setSavedTactics(res.data);
        } catch (err) {
            console.error("Error fetching tactics:", err);
        }
    };

    const deleteTactic = async (id, e) => {
        e.stopPropagation();
        showConfirm('Are you sure you want to delete this strategy?', async () => {
            try {
                await axios.delete(`http://localhost:5000/api/strategies/${id}`);
                fetchTactics();
                showNotification('Strategy deleted', 'info');
            } catch (err) {
                console.error(err);
                showNotification('Failed to delete strategy', 'error');
            }
        });
    };

    const loadTactic = (tactic, askConfirm = true) => {
        const targetType = tactic.type || 'full';
        const displayType = targetType === 'full' ? 'Full Court' : 'Half Court';

        const doLoad = () => {
            const event = new CustomEvent(`load-tactic-${targetType}`, {
                detail: { data: tactic.data }
            });
            window.dispatchEvent(event);
            showNotification(`System "${tactic.name}" loaded to ${displayType}`, 'success');
        };

        if (askConfirm) {
            showConfirm(`Load "${tactic.name}" into ${displayType} workspace?`, doLoad);
        } else {
            doLoad();
        }
    };

    const fullCourtTactics = savedTactics.filter(t => (t.type || 'full') === 'full');
    const halfCourtTactics = savedTactics.filter(t => t.type === 'half');

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Cinematic Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">STRATEGY</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">PERFORMANCE LAB</span>
                    <h1 className="hero-dashboard-title">
                        TACTICAL <br />
                        <span className="accent-text">COMMAND</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <div className="pulse-dot"></div>
                            <span>SYSTEM READY: ARCHIVE SYNCED</span>
                        </div>
                        <div className="divider"></div>
                        <div className="status-item">
                            <Clock size={14} />
                            <span>LIVE OPS: ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Court Registry */}
            <div className="" style={{ marginBottom: '2rem', padding: '2rem', borderRadius: '0' }}>
                <div className="feed-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Zap size={20} className="icon-red" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '2px' }}>FULL COURT SYSTEMS</h3>
                    </div>
                    <span className="premium-label" style={{ margin: 0 }}>REGISTRY</span>
                </div>

                {fullCourtTactics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: '#555', fontStyle: 'italic', margin: 0 }}>No full court systems saved yet.</p>
                    </div>
                ) : (
                    <div className="strategy-grid" style={{ overflowY: 'visible', maxHeight: 'none' }}>
                        {fullCourtTactics.map(tactic => (
                            <div key={tactic.id} className="tactic-item-premium" onClick={() => loadTactic(tactic)}>
                                <div className="tactic-header-premium">
                                    <h4 className="tactic-name-label">{tactic.name}</h4>
                                    <span className="tactic-action-hint">READY TO LOAD</span>
                                </div>
                                <MiniCourtPreview tactic={tactic} />
                                <button onClick={(e) => deleteTactic(tactic.id, e)} className="delete-tactic-btn">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Workspaces */}
            <TacticalWorkspace
                title="TACTICAL PROJECTION BOARD"
                type="full"
                showNotification={showNotification}
                showConfirm={showConfirm}
                savedTactics={savedTactics}
                fetchTactics={fetchTactics}
            />

            {/* Half Court Registry */}
            <div className="" style={{ marginTop: '3rem', marginBottom: '2rem', padding: '2rem', borderRadius: '0' }}>
                <div className="feed-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Layout size={20} className="icon-red" />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '2px' }}>HALF COURT DRILLS</h3>
                    </div>
                    <span className="premium-label" style={{ margin: 0 }}>DRILLS</span>
                </div>

                {halfCourtTactics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: '#555', fontStyle: 'italic', margin: 0 }}>No half court drills saved yet.</p>
                    </div>
                ) : (
                    <div className="strategy-grid" style={{ overflowY: 'visible', maxHeight: 'none' }}>
                        {halfCourtTactics.map(tactic => (
                            <div key={tactic.id} className="tactic-item-premium" onClick={() => loadTactic(tactic)}>
                                <div className="tactic-header-premium">
                                    <h4 className="tactic-name-label">{tactic.name}</h4>
                                    <span className="tactic-action-hint">READY TO LOAD</span>
                                </div>
                                <MiniCourtPreview tactic={tactic} />
                                <button onClick={(e) => deleteTactic(tactic.id, e)} className="delete-tactic-btn">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TacticalWorkspace
                title="TACTICAL PROJECTION BOARD [HALF]"
                type="half"
                showNotification={showNotification}
                showConfirm={showConfirm}
                savedTactics={savedTactics}
                fetchTactics={fetchTactics}
            />
        </div>
    );
};

export default Strategy;
