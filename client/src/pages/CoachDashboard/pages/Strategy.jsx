import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import TacticalWorkspace from './TacticalWorkspace.jsx';
import '../../../css/dashboard.css';
import '../css/strategy.css';
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
        <div className="mini-court-preview">
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
            <div className="preview-gradient-overlay" />
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
            <div className="strategy-registry-card">
                <div className="card-header-flex">
                    <div>
                        <h2 className="prep-title-box">Full Court Systems</h2>
                        <p className="archive-subtitle">Archive of 5v5 transition and offensive systems.</p>
                    </div>
                    <span className="live-indicator">REGISTRY</span>
                </div>

                {fullCourtTactics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: '#555', fontStyle: 'italic', margin: 0 }}>No full court systems saved yet.</p>
                    </div>
                ) : (
                    <div className="strategy-grid">
                        {fullCourtTactics.map(tactic => (
                            <div key={tactic.id} className="tactic-item-premium" onClick={() => loadTactic(tactic)}>
                                <MiniCourtPreview tactic={tactic} />
                                <div className="tactic-info-box">
                                    <div style={{ flex: 1 }}>
                                        <h4 className="tactic-name-label">{tactic.name}</h4>
                                        <span className="tactic-action-hint">Click to Load</span>
                                    </div>
                                    <button onClick={(e) => deleteTactic(tactic.id, e)} className="delete-tactic-btn">
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
            <div className="strategy-registry-card" style={{ marginTop: '3rem' }}>
                <div className="card-header-flex">
                    <div>
                        <h2 className="prep-title-box">Half Court Drills</h2>
                        <p className="archive-subtitle">Collection of specialized 3v3 sets and training drills.</p>
                    </div>
                    <span className="live-indicator">DRILLS</span>
                </div>

                {halfCourtTactics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: '#555', fontStyle: 'italic', margin: 0 }}>No half court drills saved yet.</p>
                    </div>
                ) : (
                    <div className="strategy-grid">
                        {halfCourtTactics.map(tactic => (
                            <div key={tactic.id} className="tactic-item-premium" onClick={() => loadTactic(tactic)}>
                                <MiniCourtPreview tactic={tactic} />
                                <div className="tactic-info-box">
                                    <div style={{ flex: 1 }}>
                                        <h4 className="tactic-name-label">{tactic.name}</h4>
                                        <span className="tactic-action-hint">Click to Load</span>
                                    </div>
                                    <button onClick={(e) => deleteTactic(tactic.id, e)} className="delete-tactic-btn">
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
