
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import { Send, User, Users, Shield, CheckCircle } from 'lucide-react';
import '../../../css/dashboard.css';

const Report = () => {
    const { showNotification } = useNotification?.() || { showNotification: (msg) => console.log(msg) };
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Selection state
    const [sendToPresident, setSendToPresident] = useState(false);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);

    // Form state
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('normal');
    const [category, setCategory] = useState('performance');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null); // 'category' | 'urgency' | null

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.custom-category-select')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/players');
                setPlayers(res.data);
            } catch (err) {
                console.error("Failed to fetch players", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    const togglePlayerSelection = (id) => {
        setSelectedPlayerIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
        // Deselect president if player is selected (or allow both? User said "to president OR can select every player")
        // Usually, these are separate reports, but let's allow both if they want.
    };

    const handleSendReport = async (e) => {
        e.preventDefault();

        if (!sendToPresident && selectedPlayerIds.length === 0) {
            showNotification("Please select at least one recipient.", "warning");
            return;
        }

        if (!subject.trim() || !message.trim()) {
            showNotification("Please fill in the subject and message.", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            const recipients = [];
            if (sendToPresident) recipients.push("President");
            selectedPlayerIds.forEach(id => {
                const p = players.find(player => player.id === id);
                if (p) recipients.push(p.name);
            });

            await axios.post('http://localhost:5000/api/reports/send', {
                recipients,
                subject,
                message,
                priority,
                category
            });

            showNotification("Report sent successfully!", "success");

            // Reset form
            setSubject('');
            setMessage('');
            setSendToPresident(false);
            setSelectedPlayerIds([]);
        } catch (err) {
            showNotification("Failed to send report.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-spinner">Initializing Communication Hub...</div>;

    return (
        <div className="report-layout animate-fade-in">
            <div className="main-reporting-area">
                <div className="recipient-selector">
                    <div className="section-header-row" style={{ marginBottom: '1.5rem' }}>
                        <div className="role-tag coach-tag">Targeting</div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, textTransform: 'uppercase', color: '#fff' }}>Choose Recipients</h2>
                        <p>Select the President or specific players for this official communication.</p>
                    </div>

                    <div className="selection-grid">
                        {/* President Card */}
                        <div
                            className={`selectable-card president-card ${sendToPresident ? 'selected' : ''}`}
                            onClick={() => setSendToPresident(!sendToPresident)}
                        >
                            <Shield size={32} style={{ color: sendToPresident ? '#ffd700' : '#888', marginBottom: '10px' }} />
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: sendToPresident ? '#ffd700' : '#fff' }}>HUSA President</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#666' }}>OFFICIAL CLUB CHANNEL</p>
                            {sendToPresident && <CheckCircle size={20} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ffd700' }} />}
                        </div>

                        {/* Player Cards */}
                        {players.map(player => (
                            <div
                                key={player.id}
                                className={`selectable-card ${selectedPlayerIds.includes(player.id) ? 'selected' : ''}`}
                                onClick={() => togglePlayerSelection(player.id)}
                            >
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', border: '2px solid rgba(255,255,255,0.1)' }}>
                                    <img
                                        src={player.photo_url || '/assets/players/default.png'}
                                        alt={player.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name.split(' ')[0]}</h4>
                                <span style={{ fontSize: '0.7rem', color: '#888' }}>#{player.jersey_number} - {player.position}</span>
                                {selectedPlayerIds.includes(player.id) && <CheckCircle size={16} style={{ position: 'absolute', top: '10px', right: '10px', color: '#ff3131' }} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="report-form-container shadow-premium">
                <div className="form-header" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0, color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '1px' }}>Compose Official Report</h3>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
                        Selected: {sendToPresident ? "President + " : ""}{selectedPlayerIds.length} Player(s)
                    </div>
                </div>

                <form onSubmit={handleSendReport}>
                    <div className="form-group">
                        <label>Report Subject</label>
                        <input
                            type="text"
                            placeholder="e.g. Disciplinary Action, Weekly Review..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {/* Custom Category Selector */}
                        <div className={`custom-category-select ${activeDropdown === 'category' ? 'active' : ''}`}>
                            <label>Category</label>
                            <div className="custom-select-box" onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}>
                                <div>{category.charAt(0).toUpperCase() + category.slice(1)}</div>
                                <span className="arrow">⌄</span>
                            </div>
                            <div className="custom-options">
                                {['performance', 'disciplinary', 'tactical', 'medical', 'other'].map(opt => (
                                    <div
                                        key={opt}
                                        className={`custom-option ${category === opt ? 'active' : ''}`}
                                        onClick={() => { setCategory(opt); setActiveDropdown(null); }}
                                    >
                                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Custom Urgency Selector */}
                        <div className={`custom-category-select ${activeDropdown === 'urgency' ? 'active' : ''}`}>
                            <label>Urgency</label>
                            <div className="custom-select-box" onClick={() => setActiveDropdown(activeDropdown === 'urgency' ? null : 'urgency')}>
                                <div>
                                    {priority === 'normal' ? '🟢 Normal' : priority === 'high' ? '🟠 High' : '🔴 Critical'}
                                </div>
                                <span className="arrow">⌄</span>
                            </div>
                            <div className="custom-options">
                                <div className={`custom-option ${priority === 'normal' ? 'active' : ''}`} onClick={() => { setPriority('normal'); setActiveDropdown(null); }}>🟢 Normal</div>
                                <div className={`custom-option ${priority === 'high' ? 'active' : ''}`} onClick={() => { setPriority('high'); setActiveDropdown(null); }}>🟠 High</div>
                                <div className={`custom-option ${priority === 'critical' ? 'active' : ''}`} onClick={() => { setPriority('critical'); setActiveDropdown(null); }}>🔴 Critical</div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Message Content</label>
                        <textarea
                            rows="8"
                            placeholder="Draft your report details here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={2000}
                            required
                        ></textarea>
                        <div style={{ textAlign: 'right', fontSize: '0.7rem', color: message.length >= 1900 ? '#ff4d4d' : '#555', marginTop: '5px' }}>
                            {message.length} / 2000 characters
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-send-report"
                        disabled={isSubmitting || (!sendToPresident && selectedPlayerIds.length === 0)}
                    >
                        {isSubmitting ? "TRANSMITTING..." : (
                            <>
                                <Send size={18} />
                                SEND OFFICIAL REPORT
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(252, 211, 77, 0.05)', borderRadius: '8px', border: '1px solid rgba(252, 211, 77, 0.1)' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#fcd34d', opacity: 0.8 }}>
                        <strong>Note:</strong> Reports sent via this portal are logged in the club's permanent archive and cannot be deleted.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Report;
