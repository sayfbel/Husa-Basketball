
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import { Send, User, Users, Shield, CheckCircle, Plus, Activity, Mail, Bell, X, ChevronRight, Clock } from 'lucide-react';
import SelectorCard from '../../../components/SelectorCard/SelectorCard';
import '../../../css/dashboard.css';

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

    return (
        <div className="animate-fade-in report-page-refined">
            <div className="single-col-report-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

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
                                <label style={{ fontSize: '0.7rem', fontWeight: '950', color: '#444', marginBottom: '1rem', display: 'block', letterSpacing: '1px' }}>TARGET RECIPIENTS</label>
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
                                    <div className="form-group-refined full">
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
                                    <div className="form-group-refined full">
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
                ) : (
                    <div className="status-page-v2 animate-slide-up">
                        <div className="section-title-fancy" style={{ marginBottom: '2rem' }}>
                            <Activity size={24} color="var(--dash-primary)" />
                            <h2>Tactical Comms Archive</h2>
                            <button className="back-link-v2" onClick={() => setViewMode('create')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}>
                                BACK TO COMMAND
                            </button>
                        </div>

                        <div className="status-grid-v2">
                            {reports.map(report => (
                                <div key={report.id} className="message-status-card" onClick={() => report.player_id && setSelectedReport(report)}>
                                    <div className={`msg-status-badge ${report.response ? 'replied' : 'pending'}`}>
                                        {report.response ? 'RESPONSE LOGGED' : (report.player_id && report.recipient_role !== 'player' ? 'ACTION REQUIRED' : 'SENT')}
                                    </div>
                                    <div className="msg-info-v2">
                                        <div className="msg-recipient">
                                            {report.sender_name} → {report.recipient_role.toUpperCase()}
                                            <span className="dot">•</span>
                                            {formatDate(report.created_at)}
                                        </div>
                                        <h3>{report.title}</h3>
                                        <div className="msg-body-preview">{report.content}</div>

                                        {report.response && (
                                            <div className="msg-coach-response">
                                                <h5>YOUR RESPONSE</h5>
                                                <p>{report.response}</p>
                                            </div>
                                        )}

                                        {selectedReport?.id === report.id && !report.response && (
                                            <div className="msg-coach-response" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <h5 style={{ color: '#fff' }}>DRAFT RESPONSE</h5>
                                                <textarea
                                                    style={{ width: '100%', background: 'transparent', border: 'none', color: '#eee', padding: '10px 0', fontSize: '0.9rem', minHeight: '80px', outline: 'none' }}
                                                    placeholder="Type your response to the player..."
                                                    value={coachResponse}
                                                    onChange={(e) => setCoachResponse(e.target.value)}
                                                />
                                                <button
                                                    className="notif-see-btn"
                                                    style={{ marginTop: '10px' }}
                                                    onClick={() => handleRespond(report.id)}
                                                >
                                                    COMMIT RESPONSE
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Floating Notification Hub */}
                <div className="comms-fab-hub">
                    {showNotifPopup && (
                        <div className="notification-popup-v2 animate-slide-up">
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#fff', letterSpacing: '1px' }}>BRIEFING QUEUE</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {reports.slice(0, 2).map(report => (
                                    <div key={report.id} className="notif-item-v2">
                                        <p style={{ color: report.response ? '#4cd137' : '#fcd34d' }}>
                                            {report.response ? 'Briefing synced' : 'Pending action'} • {formatDate(report.created_at)}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="notif-date">{report.title.substring(0, 20)}...</span>
                                            <button
                                                className="notif-see-btn"
                                                onClick={() => {
                                                    setViewMode('status');
                                                    setShowNotifPopup(false);
                                                }}
                                            >
                                                OPEN
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button className="fab-circle" onClick={() => setShowNotifPopup(!showNotifPopup)}>
                        <Bell size={28} />
                        {reports.some(r => !r.response && r.player_id) && <div className="fab-badge">!</div>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Report;
