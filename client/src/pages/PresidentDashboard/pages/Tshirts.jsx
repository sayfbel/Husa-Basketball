import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../components/Notification/Notification';
import { Plus, Trash2, Shield, Hash, Check, X, AlertTriangle, User } from 'lucide-react';
import '../../../css/dashboard.css';
import '../css/overview.css';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const Tshirts = () => {
    const { showNotification, showConfirm } = useNotification();
    const [tshirts, setTshirts] = useState([]);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newNumber, setNewNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tshirtsRes, playersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/tshirts'),
                axios.get('http://localhost:5000/api/players')
            ]);
            setTshirts(tshirtsRes.data || []);
            setPlayers(playersRes.data || []);
        } catch (err) {
            console.error("Error loading data:", err);
            showNotification("Failed to load jersey numbers and player data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTshirt = async (e) => {
        e.preventDefault();
        
        if (!newNumber || isNaN(parseInt(newNumber))) {
            showNotification("Please enter a valid jersey number", "error");
            return;
        }

        const numberVal = parseInt(newNumber);
        if (numberVal < 0 || numberVal > 99) {
            showNotification("Jersey number must be between 0 and 99", "error");
            return;
        }

        try {
            setSubmitting(true);
            await axios.post('http://localhost:5000/api/tshirts', { number: numberVal });
            showNotification(`Jersey number #${numberVal} added successfully`, "success");
            setNewNumber('');
            await fetchData();
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.message || "Failed to add jersey number";
            showNotification(errorMsg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTshirt = (number) => {
        showConfirm(`Are you sure you want to retire jersey number #${number}?`, async () => {
            try {
                await axios.delete(`http://localhost:5000/api/tshirts/${number}`);
                showNotification(`Jersey number #${number} successfully retired`, "success");
                await fetchData();
            } catch (err) {
                console.error(err);
                const errorMsg = err.response?.data?.message || "Failed to delete jersey number";
                showNotification(errorMsg, "error");
            }
        });
    };

    // Helper to find which player owns a jersey number
    const getPlayerByJerseyNumber = (number) => {
        return players.find(p => p.jersey_number === number || parseInt(p.jersey_number) === number);
    };

    if (loading) return <div className="loading-spinner">Decrypting Jersey Registry...</div>;

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Cinematic Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">SHIRTS</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">ATHLETE GEAR REGISTRY</span>
                    <h1 className="hero-dashboard-title">
                        JERSEY <br />
                        <span className="accent-text">NUMBERS</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <Shield size={14} color="#DB0A40" />
                            <span>OFFICIAL INVENTORY CONTROL</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Layout: Left is Add Form, Right is List Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem', marginTop: '2rem' }}>
                
                {/* Form Module */}
                <div className="intel-card" style={{ height: 'fit-content', position: 'sticky', top: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <div style={{ width: '8px', height: '8px', background: '#DB0A40' }}></div>
                        <span style={{ fontSize: '0.7rem', letterSpacing: '2px', fontWeight: '900', color: '#DB0A40', textTransform: 'uppercase' }}>REGISTER SHIRT</span>
                    </div>

                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>ADD NEW NUMBER</h3>
                    <p style={{ color: '#888', fontSize: '0.8rem', margin: '0 0 1.5rem 0', lineHeight: '1.4' }}>
                        Introduce a new jersey number into the club's active pool. Players will then be able to select it from their profile dashboards.
                    </p>

                    <form onSubmit={handleAddTshirt} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', color: '#666', fontWeight: '900', marginBottom: '8px', letterSpacing: '1px' }}>JERSEY NUMBER (0-99)</label>
                            <div style={{ position: 'relative' }}>
                                <Hash size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#DB0A40' }} />
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={newNumber}
                                    onChange={(e) => setNewNumber(e.target.value)}
                                    placeholder="Enter number"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 36px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0',
                                        color: '#fff',
                                        fontWeight: '800',
                                        fontSize: '1.1rem',
                                        borderLeft: '2px solid #DB0A40',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                background: '#DB0A40',
                                color: '#fff',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '0',
                                fontWeight: '900',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                clipPath: 'polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%)',
                                opacity: submitting ? 0.7 : 1,
                                transition: '0.2s'
                            }}
                        >
                            <Plus size={16} />
                            {submitting ? 'Registering...' : 'Add Jersey'}
                        </button>
                    </form>
                </div>

                {/* Jersey Numbers Active Inventory */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ margin: '0', fontSize: '1.4rem', fontWeight: '800', textTransform: 'uppercase' }}>Active Pool</h2>
                            <p style={{ color: '#666', fontSize: '0.8rem', margin: '4px 0 0 0' }}>Current listing of registered club jersey numbers.</p>
                        </div>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#aaa', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {tshirts.length} TOTAL REGISTERED
                        </span>
                    </div>

                    {tshirts.length === 0 ? (
                        <div className="intel-card" style={{ padding: '3rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <AlertTriangle size={36} color="#DB0A40" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>No jersey numbers registered yet.</h3>
                            <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Use the form to the left to initialize the club's jersey inventory.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            {tshirts.map((shirt) => {
                                const player = getPlayerByJerseyNumber(shirt.number);
                                return (
                                    <div
                                        key={shirt.number}
                                        className="intel-card jersey-card-premium"
                                        style={{
                                            padding: '1.2rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            minHeight: '170px',
                                            border: player ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(219, 10, 64, 0.15)',
                                            background: player ? 'rgba(18, 18, 18, 0.95)' : 'rgba(219, 10, 64, 0.02)',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Player photo aligned to the right in the background */}
                                        {player && player.photo_url && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '0',
                                                bottom: '0',
                                                top: '0',
                                                width: '50%',
                                                zIndex: 0,
                                                pointerEvents: 'none',
                                                overflow: 'hidden'
                                            }}>
                                                <img 
                                                    src={player.photo_url} 
                                                    alt={player.name}
                                                    className="player-bg-image"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        objectPosition: 'top center',
                                                        opacity: 0.35,
                                                        filter: 'grayscale(50%) contrast(110%)',
                                                        transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                                                    }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'linear-gradient(90deg, rgba(18, 18, 18, 1) 0%, rgba(18, 18, 18, 0.8) 30%, rgba(18, 18, 18, 0) 100%)',
                                                }}></div>
                                            </div>
                                        )}

                                        {/* Jersey Visual Badge */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                                            <div 
                                                className="jersey-number-watermark"
                                                style={{
                                                    fontSize: '3.5rem',
                                                    fontWeight: '950',
                                                    lineHeight: '1',
                                                    letterSpacing: '-3px',
                                                    color: player ? 'rgba(255,255,255,0.08)' : 'rgba(219, 10, 64, 0.25)',
                                                    fontFamily: 'monospace',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                #{shirt.number}
                                            </div>

                                            {/* Delete Button (Only active if not assigned to any player) */}
                                            {player ? (
                                                <span
                                                    title="Cannot delete active player jersey"
                                                    style={{
                                                        color: '#444',
                                                        padding: '4px',
                                                        cursor: 'not-allowed'
                                                    }}
                                                >
                                                    <Trash2 size={16} style={{ opacity: 0.3 }} />
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteTshirt(shirt.number)}
                                                    title="Retire Jersey Number"
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#aaa',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        transition: '0.2s',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#DB0A40'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Assigned Player / Status Info */}
                                        <div style={{ marginTop: '1.5rem', zIndex: 1 }}>
                                            {player ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <User size={12} color="#DB0A40" />
                                                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff', textTransform: 'uppercase' }}>
                                                            {player.name}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: '0.65rem', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', paddingLeft: '18px' }}>
                                                        {player.position}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {/* Glowing Pulse Indicator */}
                                                    <div style={{ position: 'relative', width: '8px', height: '8px' }}>
                                                        <div style={{
                                                            position: 'absolute',
                                                            width: '100%',
                                                            height: '100%',
                                                            borderRadius: '50%',
                                                            background: '#00E676',
                                                            animation: 'pulse 1.8s infinite'
                                                        }}></div>
                                                        <div style={{
                                                            position: 'absolute',
                                                            width: '100%',
                                                            height: '100%',
                                                            borderRadius: '50%',
                                                            background: '#00E676'
                                                        }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#00E676', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                                        AVAILABLE
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Adding Pulse Keyframes and Hover Styles dynamically */}
            <style dangerouslySetInnerHTML={{__html: `
                .jersey-card-premium {
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                }
                .jersey-card-premium:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
                    border-color: rgba(219, 10, 64, 0.4) !important;
                }
                .jersey-card-premium:hover .player-bg-image {
                    opacity: 0.65 !important;
                    transform: scale(1.08) !important;
                    filter: grayscale(0%) contrast(110%) !important;
                }
                .jersey-card-premium:hover .jersey-number-watermark {
                    color: rgba(255, 255, 255, 0.16) !important;
                }
                @keyframes pulse {
                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.7);
                        opacity: 1;
                    }
                    70% {
                        transform: scale(2);
                        box-shadow: 0 0 0 6px rgba(0, 230, 118, 0);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(0, 230, 118, 0);
                        opacity: 0;
                    }
                }
            `}} />
        </div>
    );
};

export default Tshirts;
