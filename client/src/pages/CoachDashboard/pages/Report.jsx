import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import { Send, User, Users, Shield, CheckCircle, Plus, Activity, Mail, Bell, X, ChevronRight, Clock } from 'lucide-react';
import SelectorCard from '../../../components/SelectorCard/SelectorCard';
import '../../../css/dashboard.css';
import '../css/report.css';

const Report = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification?.() || { showNotification: (msg) => console.log(msg) };
    const [players, setPlayers] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('create'); // 'create' or 'status'
    const [showNotifPopup, setShowNotifPopup] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [coachResponse, setCoachResponse] = useState('');

    // Selection state for creation
    const [sendToPresident, setSendToPresident] = useState(false);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);

    // Form state
    const [newReport, setNewReport] = useState({
        title: '',
        content: '',
        category: 'performance',
        priority: 'normal'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [playersRes, reportsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/players'),
                axios.get('http://localhost:5000/api/reports') // Fetch all for coach
            ]);
            setPlayers(playersRes.data);
            setReports(reportsRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const togglePlayerSelection = (id) => {
        setSelectedPlayerIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleSendReport = async (e) => {
        e.preventDefault();
        if (!sendToPresident && selectedPlayerIds.length === 0) {
            showNotification("Please select at least one recipient.", "warning");
            return;
        }

        try {
            const recipients = [];
            if (sendToPresident) recipients.push("President");
            selectedPlayerIds.forEach(id => {
                const p = players.find(player => player.id === id);
                if (p) recipients.push({ id: p.id, name: p.name });
            });

            // We send separate reports for each recipient for simplicity in the current schema
            const sendPromises = [];

            if (sendToPresident) {
                sendPromises.push(axios.post('http://localhost:5000/api/reports/send', {
                    sender_id: currentUser?.id || 'coach_id',
                    sender_name: currentUser?.name || 'Staff Coach',
                    recipient_role: 'president',
                    title: newReport.title,
                    content: newReport.content,
                    type: newReport.category,
                    priority: newReport.priority
                }));
            }

            selectedPlayerIds.forEach(id => {
                const p = players.find(player => player.id === id);
                if (p) {
                    sendPromises.push(axios.post('http://localhost:5000/api/reports/send', {
                        sender_id: currentUser?.id || 'coach_id',
                        sender_name: currentUser?.name || 'Staff Coach',
                        recipient_role: 'player',
                        player_id: p.id,
                        title: newReport.title,
                        content: newReport.content,
                        type: newReport.category,
                        priority: newReport.priority
                    }));
                }
            });

            await Promise.all(sendPromises);

            showNotification("Transmission(s) launched successfully!", "success");
            setNewReport({ title: '', content: '', category: 'performance', priority: 'normal' });
            setSendToPresident(false);
            setSelectedPlayerIds([]);
            fetchData();
        } catch (err) {
            console.error("Transmission error:", err.response?.data || err.message);
            showNotification("Failed to send report. Check console for details.", "error");
        }
    };

    const handleRespond = async (reportId) => {
        if (!coachResponse.trim()) return;
        try {
            console.log(`Responding to report ${reportId} with content: ${coachResponse}`);
            await axios.post('http://localhost:5000/api/reports/respond', {
                reportId,
                response: coachResponse
            });
            showNotification("Response sent to player.", "success");
            setCoachResponse('');
            setSelectedReport(null);
            fetchData();
        } catch (err) {
            console.error("Response error:", err.response?.data || err.message);
            showNotification("Failed to send response. Check console.", "error");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) return <div className="loading-spinner">Accessing Tactical Comms...</div>;

    const sentByCoach = reports.filter(r => r.sender_id === currentUser.id);
    const receivedFromPlayers = reports.filter(r => r.sender_id !== currentUser.id);
    const pendingAction = receivedFromPlayers.filter(r => !r.response).length;
    const awaitingPlayers = sentByCoach.filter(r => !r.response).length;

    return (
        <div className="report-layout-v2 animate-fade-in dashboard-fashion-theme">
            {/* Intel Feed Column */}
            <div className="report-feed-column">
                <div className="transmission-status-summary-v2">
                    <div className="stat-pill-v2">
                        <div className="stat-label">ACTION REQUIRED</div>
                        <div className="stat-value" style={{ color: pendingAction > 0 ? 'var(--dash-primary)' : '#444' }}>
                            {pendingAction.toString().padStart(2, '0')}
                        </div>
                    </div>
                    <div className="stat-pill-v2">
                        <div className="stat-label">OPEN BRIEFINGS</div>
                        <div className="stat-value" style={{ color: awaitingPlayers > 0 ? '#fcd34d' : '#444' }}>
                            {awaitingPlayers.toString().padStart(2, '0')}
                        </div>
                    </div>
                    <div className="stat-pill-v2">
                        <div className="stat-label">TOTAL LOGS</div>
                        <div className="stat-value">{reports.length.toString().padStart(2, '0')}</div>
                    </div>
                </div>

                <div className="section-title-fancy">
                    <Mail size={24} color="var(--dash-primary)" />
                    <h2>Communication Log</h2>
                    <div className="dot-line"></div>
                    <button
                        className={`filter-btn-v2 ${viewMode === 'status' ? 'active' : ''}`}
                        onClick={() => setViewMode(viewMode === 'status' ? 'create' : 'status')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '5px 15px', borderRadius: '30px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {viewMode === 'create' ? 'VIEW ARCHIVE' : 'NEW TRANSMISSION'}
                    </button>
                </div>

                <div className="reports-log-v2">
                    {/* Special Aggregated Card for Sent Messages */}
                    <div
                        className={`report-card-v2 archive-card ${viewMode === 'archive' ? 'selected' : ''}`}
                        onClick={() => {
                            setViewMode('archive');
                            setSelectedReport(null);
                        }}
                    >
                        <div className="card-accent" style={{ background: '#fcd34d' }}></div>
                        <div className="report-card-main">
                            <div className="report-card-icon" style={{ color: '#fcd34d' }}>
                                <Send size={18} />
                            </div>
                            <div className="report-card-info">
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span className="type-tag" style={{ color: '#fcd34d', borderColor: 'rgba(252, 211, 77, 0.2)' }}>ARCHIVE</span>
                                </div>
                                <h4>Sent Transmissions</h4>
                                <div className="report-card-meta">
                                    {sentByCoach.length} official briefings logged
                                </div>
                            </div>
                        </div>
                    </div>

                    {receivedFromPlayers.length === 0 ? (
                        <div className="empty-feed-v2">
                            <Activity size={32} />
                            <p>No communications recorded in the tactical log.</p>
                        </div>
                    ) : (
                        receivedFromPlayers.map(report => (
                            <div
                                key={report.id}
                                className={`report-card-v2 ${selectedReport?.id === report.id ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedReport(report);
                                    setViewMode('status');
                                }}
                            >
                                <div className="card-accent"></div>
                                <div className="report-card-main">
                                    <div className="report-card-icon">
                                        <Mail size={18} />
                                    </div>
                                    <div className="report-card-info">
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className="type-tag">{report.type.toUpperCase()}</span>
                                            {report.priority === 'urgent' || report.priority === 'critical' || report.priority === 'high' ? <div className="urgent-dot"></div> : null}
                                        </div>
                                        <h4>{report.title}</h4>
                                        <div className="report-card-meta">
                                            From: {report.sender_name}
                                            <span>•</span>
                                            {formatDate(report.created_at)}
                                        </div>
                                    </div>
                                    {report.response && (
                                        <div style={{ marginLeft: 'auto', color: '#4cd137' }}>
                                            <Shield size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Command Center Column */}
            <div className="report-briefing-column">
                {viewMode === 'create' ? (
                    <div className="briefing-container-v2 animate-slide-up">
                        <div className="briefing-banner report-bg">
                            <Send size={32} color="var(--dash-primary)" />
                            <div className="banner-text">
                                <h3>COMMAND CENTER</h3>
                                <p>OFFICIAL STAFF TRANSMISSION PROTOCOL</p>
                            </div>
                        </div>

                        <div className="briefing-core">
                            <div className="recipient-selector" style={{ marginBottom: '2rem' }}>
                                <label style={{ fontSize: '0.6rem', fontWeight: '950', color: '#444', marginBottom: '1rem', display: 'block', letterSpacing: '2px' }}>TARGET RECIPIENTS</label>
                                <div className="selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                                    <div
                                        className={`selectable-card president-card ${sendToPresident ? 'selected' : ''}`}
                                        onClick={() => setSendToPresident(!sendToPresident)}
                                        style={{ padding: '15px', borderRadius: '12px', background: sendToPresident ? 'rgba(219, 10, 64, 0.1)' : '#111', border: '1px solid', borderColor: sendToPresident ? 'var(--dash-primary)' : 'rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'center', transition: '0.3s' }}
                                    >
                                        <Shield size={24} color={sendToPresident ? 'var(--dash-primary)' : '#444'} style={{ marginBottom: '8px' }} />
                                        <h4 style={{ margin: 0, fontSize: '0.7rem', color: '#eee' }}>PRESIDENT</h4>
                                    </div>

                                    {players.map(player => (
                                        <div
                                            key={player.id}
                                            className={`selectable-card ${selectedPlayerIds.includes(player.id) ? 'selected' : ''}`}
                                            onClick={() => togglePlayerSelection(player.id)}
                                            style={{ padding: '10px', borderRadius: '12px', background: selectedPlayerIds.includes(player.id) ? 'rgba(219, 10, 64, 0.1)' : '#111', border: '1px solid', borderColor: selectedPlayerIds.includes(player.id) ? 'var(--dash-primary)' : 'rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'center', transition: '0.3s' }}
                                        >
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 5px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <img src={player.photo_url || '/assets/players/default.png'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: '0.65rem', color: '#eee' }}>{player.name.split(' ')[0]}</h4>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSendReport} className="inline-submission-form">
                                <div className="form-layout-refined">
                                    <div className="form-group-refined">
                                        <label>SUBJECT LINE</label>
                                        <input
                                            type="text"
                                            placeholder="Enter briefing title..."
                                            value={newReport.title}
                                            onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-row-refined">
                                        <div className="form-group-refined">
                                            <label>CATEGORY</label>
                                            <SelectorCard
                                                value={newReport.category}
                                                onChange={val => setNewReport({ ...newReport, category: val })}
                                                options={[
                                                    { label: 'PERFORMANCE', value: 'performance' },
                                                    { label: 'DISCIPLINARY', value: 'disciplinary' },
                                                    { label: 'TACTICAL', value: 'tactical' },
                                                    { label: 'MEDICAL', value: 'medical' }
                                                ]}
                                            />
                                        </div>
                                        <div className="form-group-refined">
                                            <label>PRIORITY</label>
                                            <SelectorCard
                                                value={newReport.priority}
                                                onChange={val => setNewReport({ ...newReport, priority: val })}
                                                options={[
                                                    { label: 'NORMAL', value: 'normal' },
                                                    { label: 'HIGH', value: 'high' },
                                                    { label: 'CRITICAL', value: 'critical' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group-refined">
                                        <label>BRIEFING CONTENT</label>
                                        <textarea
                                            rows="8"
                                            placeholder="Compose the official briefing content..."
                                            value={newReport.content}
                                            onChange={e => setNewReport({ ...newReport, content: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="form-actions-refined">
                                    <button type="submit" className="submit-launch-btn">
                                        <Send size={18} />
                                        LAUNCH TRANSMISSION
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : viewMode === 'archive' ? (
                    <div className="briefing-container-v2 animate-slide-up">
                        <div className="briefing-banner report-bg">
                            <Send size={32} color="#fcd34d" />
                            <div className="banner-text">
                                <h3>SENT ARCHIVE</h3>
                                <p>OFFICIAL OUTGOING TRANSMISSIONS</p>
                            </div>
                        </div>
                        <div className="briefing-core" style={{ padding: '2rem' }}>
                            <div className="archive-list-v2">
                                {sentByCoach.length === 0 ? (
                                    <div className="empty-archive-v2">
                                        <p>No outgoing transmissions found.</p>
                                    </div>
                                ) : (
                                    sentByCoach.map(report => (
                                        <div
                                            key={report.id}
                                            className="archive-item-v2"
                                            onClick={() => {
                                                setSelectedReport(report);
                                                setViewMode('status');
                                            }}
                                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', transition: '0.3s' }}
                                        >
                                            <div className="archive-item-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="archive-item-info">
                                                    <span className="archive-item-to" style={{ fontSize: '0.6rem', fontWeight: '900', color: 'var(--dash-primary)', letterSpacing: '1px' }}>TO: {report.recipient_role.toUpperCase()}</span>
                                                    <h4 style={{ margin: '5px 0', fontSize: '0.9rem', color: '#fff' }}>{report.title}</h4>
                                                    <span className="archive-item-date" style={{ fontSize: '0.7rem', color: '#666' }}>{formatDate(report.created_at)}</span>
                                                </div>
                                                <ChevronRight size={18} color="#444" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ) : selectedReport ? (
                    <div className="briefing-container-v2 animate-slide-up">
                        <div className="briefing-banner report-bg">
                            <div className="sender-avatar">
                                {selectedReport.sender_name.charAt(0)}
                            </div>
                            <div className="banner-text">
                                <h3>{selectedReport.sender_name}</h3>
                                <p>{selectedReport.sender_id === currentUser.id ? 'Outgoing Transmission' : 'Incoming Report'}</p>
                            </div>
                            <div className={`briefing-priority-badge ${selectedReport.priority}`}>
                                {selectedReport.priority.toUpperCase()}
                            </div>
                        </div>

                        <div className="briefing-core" style={{ padding: '2rem' }}>
                            <h2 className="main-title">{selectedReport.title}</h2>

                            <div className="briefing-meta-grid" style={{ marginBottom: '2rem' }}>
                                <div className="meta-box">
                                    <span className="label">DATE</span>
                                    <span className="value">{formatDate(selectedReport.created_at)}</span>
                                </div>
                                <div className="meta-box">
                                    <span className="label">CATEGORY</span>
                                    <span className="value">{selectedReport.type.toUpperCase()}</span>
                                </div>
                                <div className="meta-box">
                                    <span className="label">STATUS</span>
                                    <span className="value" style={{ color: selectedReport.response ? '#4cd137' : 'var(--dash-primary)' }}>
                                        {selectedReport.response ? 'DECISION LOGGED' : 'ACTION PENDING'}
                                    </span>
                                </div>
                            </div>

                            <div className="report-content-area" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                <div className="content-glow"></div>
                                <div className="content-text">
                                    {selectedReport.content}
                                </div>
                            </div>

                            {selectedReport.response && (
                                <div className="msg-coach-response" style={{ marginTop: '0' }}>
                                    <h5>{selectedReport.sender_id === currentUser.id ? `RESPONSE FROM ${selectedReport.recipient_role.toUpperCase()}` : 'YOUR RESPONSE'}</h5>
                                    <p>{selectedReport.response}</p>
                                </div>
                            )}

                            {!selectedReport.response && selectedReport.sender_id !== currentUser.id && (
                                <div className="msg-coach-response" style={{ marginTop: '0', background: 'rgba(255,255,255,0.02)' }}>
                                    <h5 style={{ color: '#fff' }}>DRAFT OFFICIAL RESPONSE</h5>
                                    <textarea
                                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#eee', padding: '10px 0', fontSize: '0.9rem', minHeight: '100px', outline: 'none' }}
                                        placeholder="Type your official response to the player..."
                                        value={coachResponse}
                                        onChange={(e) => setCoachResponse(e.target.value)}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <button
                                            className="submit-launch-btn"
                                            onClick={() => handleRespond(selectedReport.id)}
                                        >
                                            COMMIT RESPONSE
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="briefing-empty-v2">
                        <Activity size={48} color="#222" />
                        <h3>TACTICAL ARCHIVE</h3>
                        <p>Select a transmission from the log to decrypt and view briefing details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Report;
