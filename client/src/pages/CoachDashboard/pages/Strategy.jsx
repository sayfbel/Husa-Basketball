import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import TacticalWorkspace from './TacticalWorkspace.jsx';
import '../../../css/dashboard.css';
import {
    Trash2
} from 'lucide-react';

const MiniCourtPreview = ({ tactic }) => {
    const firstFrame = tactic.data[0] || { tokens: [], paths: [] };
    const type = tactic.type || 'full';
    const viewBoxH = type === 'full' ? 560 : 470;
    const viewBoxW = type === 'full' ? 1000 : 500;
    const themeColor = '#DB0A40';

    return (
        <div className="mini-court-preview" style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            opacity: 0.5,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
        }}>
            <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} style={{ width: '100%', height: '100%' }}>
                {/* Court Outline Tinted */}
                <rect width={viewBoxW} height={viewBoxH} fill="none" stroke={themeColor} strokeWidth="3" opacity="0.3" />

                {/* Center Line for Full Court */}
                {viewBoxW === 1000 && <line x1="500" y1="0" x2="500" y2="560" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />}

                {/* Center Circle Tinted */}
                <circle cx={viewBoxW / 2} cy={viewBoxW === 1000 ? 280 : 205} r={viewBoxW === 1000 ? 70 : 60} fill="none" stroke={themeColor} strokeWidth="3" opacity="0.3" />

                {firstFrame.tokens.map((token, idx) => (
                    <circle
                        key={idx}
                        cx={`${token.x * (viewBoxW / 100)}`}
                        cy={`${token.y * (viewBoxH / 100)}`}
                        r="18"
                        fill={token.type === 'offense' ? '#DB0A40' : token.type === 'defense' ? '#111' : '#f97316'}
                        stroke={token.type === 'defense' ? 'rgba(255,255,255,0.5)' : 'none'}
                        strokeWidth="2"
                    />
                ))}
                {firstFrame.paths.map((d, idx) => (
                    <path key={idx} d={d} fill="none" stroke="#fcd34d" strokeWidth="5" opacity="0.7" />
                ))}
            </svg>
            {/* Bottom Gradient Overlay */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '70%',
                background: `linear-gradient(to top, rgba(10,10,10,0.95), rgba(10,10,10,0.4), transparent)`,
                zIndex: 0
            }} />
        </div>
    );
};

const Strategy = () => {
    const [savedTactics, setSavedTactics] = useState([]);
    const { showNotification, showConfirm } = useNotification();

    useEffect(() => {
        fetchTactics();
    }, []);

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

    const loadTactic = (tactic) => {
        const targetType = tactic.type || 'full';
        const displayType = targetType === 'full' ? 'Full Court' : 'Half Court';

        showConfirm(`Load "${tactic.name}" into ${displayType} workspace?`, () => {
            const event = new CustomEvent(`load-tactic-${targetType}`, {
                detail: { data: tactic.data }
            });
            window.dispatchEvent(event);
            showNotification(`System "${tactic.name}" loaded to ${displayType}`, 'success');
        });
    };

    const fullCourtTactics = savedTactics.filter(t => (t.type || 'full') === 'full');
    const halfCourtTactics = savedTactics.filter(t => t.type === 'half');

    return (
        <div className="strategy-container">
            <div className="section-header-row">
                <div className="role-tag coach-tag">Performance Lab</div>
                <h1>Tactical Strategy</h1>
                <p>Design, archive, and simulate professional systems.</p>
            </div>

            {/* Full Court Registry */}
            <div className="strategy-card" style={{ background: 'rgba(20, 20, 20, 0.4)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem' }}>
                <div className="card-header-flex" style={{ marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', letterSpacing: '1px', color: '#fff', border: 'none', margin: 0 }}>Full Court Systems</h2>
                        <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0 0 0' }}>Archive of 5v5 transition and offensive systems.</p>
                    </div>
                    <span className="live-indicator" style={{ background: 'rgba(219, 10, 64, 0.1)', color: '#DB0A40', borderColor: 'rgba(219, 10, 64, 0.2)' }}>REGISTRY</span>
                </div>

                {fullCourtTactics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: '#555', fontStyle: 'italic', margin: 0 }}>No full court systems saved yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {fullCourtTactics.map(tactic => (
                            <div key={tactic.id} className="tactic-item-premium"
                                onClick={() => loadTactic(tactic)}
                                style={{
                                    position: 'relative',
                                    background: 'linear-gradient(145deg, rgba(30,30,30,0.9), rgba(15,15,15,0.95))',
                                    padding: '1.2rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    minHeight: '160px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                                    e.currentTarget.style.borderColor = 'var(--dash-primary)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(219, 10, 64, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <MiniCourtPreview tactic={tactic} />
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0', color: '#fff', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tactic.name}</h4>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--dash-primary)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>Click to Load</span>
                                    </div>
                                    <button
                                        onClick={(e) => deleteTactic(tactic.id, e)}
                                        style={{
                                            background: 'rgba(255,77,77,0.15)',
                                            border: 'none',
                                            color: '#ff4d4d',
                                            cursor: 'pointer',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#ff4d4d'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,77,77,0.15)'; e.currentTarget.style.color = '#ff4d4d'; }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Workspaces */}
            <TacticalWorkspace
                title="Design Lab"
                type="full"
                showNotification={showNotification}
                showConfirm={showConfirm}
                savedTactics={savedTactics}
                fetchTactics={fetchTactics}
            />

            {/* Half Court Registry */}
            <div className="strategy-card" style={{ background: 'rgba(20, 20, 20, 0.4)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem', marginTop: '3rem' }}>
                <div className="card-header-flex" style={{ marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', letterSpacing: '1px', color: '#fff', border: 'none', margin: 0 }}>Half Court Drills</h2>
                        <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0 0 0' }}>Collection of specialized 3v3 sets and training drills.</p>
                    </div>
                    <span className="live-indicator" style={{ background: 'rgba(219, 10, 64, 0.1)', color: '#DB0A40', borderColor: 'rgba(219, 10, 64, 0.2)' }}>DRILLS</span>
                </div>

                {halfCourtTactics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: '#555', fontStyle: 'italic', margin: 0 }}>No half court drills saved yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {halfCourtTactics.map(tactic => (
                            <div key={tactic.id} className="tactic-item-premium"
                                onClick={() => loadTactic(tactic)}
                                style={{
                                    position: 'relative',
                                    background: 'linear-gradient(145deg, rgba(30,30,30,0.9), rgba(15,15,15,0.95))',
                                    padding: '1.2rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    minHeight: '160px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                                    e.currentTarget.style.borderColor = '#DB0A40';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(219, 10, 64, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <MiniCourtPreview tactic={tactic} />
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0', color: '#fff', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tactic.name}</h4>
                                        <span style={{ fontSize: '0.65rem', color: '#DB0A40', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>Click to Load</span>
                                    </div>
                                    <button
                                        onClick={(e) => deleteTactic(tactic.id, e)}
                                        style={{
                                            background: 'rgba(255,77,77,0.15)',
                                            border: 'none',
                                            color: '#ff4d4d',
                                            cursor: 'pointer',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#ff4d4d'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,77,77,0.15)'; e.currentTarget.style.color = '#ff4d4d'; }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TacticalWorkspace
                title="Half Court Drill"
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
