import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../components/Notification/Notification';
import {
    Send,
    User,
    Users,
    Shield,
    CheckCircle,
    Plus,
    Activity,
    Mail,
    Bell,
    X,
    ChevronRight,
    Clock,
    History,
    TrendingUp,
    AlertCircle,
    FileText
} from 'lucide-react';
import SelectorCard from '../../../components/SelectorCard/SelectorCard';
import '../../../css/dashboard.css';
import '../../PresidentDashboard/css/Reports.css';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const Report = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification?.() || { showNotification: (msg) => { } };
    const [players, setPlayers] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('create'); // 'create' or 'status'
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
            console.error("Transmission sync failure:", err);
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
            showNotification("Please select at least one destination uplink.", "warning");
            return;
        }

        try {
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
            showNotification("Failed to launch transmission.", "error");
        }
    };

    const handleRespond = async (reportId) => {
        if (!coachResponse.trim()) return;
        try {
            await axios.post('http://localhost:5000/api/reports/respond', {
                reportId,
                response: coachResponse
            });
            showNotification("Response recorded in logs.", "success");
            setCoachResponse('');
            setSelectedReport(null);
            fetchData();
        } catch (err) {
            showNotification("Failed to record response.", "error");
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

    if (loading) return <div className="loading-spinner">Decrypting Command Comms...</div>;

    const sentByCoach = reports.filter(r => r.sender_id === currentUser.id);
    const receivedFromPlayers = reports.filter(r => r.sender_id !== currentUser.id);
    const pendingAction = receivedFromPlayers.filter(r => !r.response).length;
    const awaitingFeedback = sentByCoach.filter(r => !r.response).length;

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">COMMS</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">TACTICAL COMMUNICATIONS</span>
                    <h1 className="hero-dashboard-title">
                        STAFF <br />
                        <span className="accent-text">COMMAND CENTER</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <AlertCircle size={14} color={pendingAction > 0 ? '#DB0A40' : '#444'} />
                            <span>{pendingAction} ACTION REQUIRED</span>
                        </div>
                        <div className="status-item">
                            <Clock size={14} />
                            <span>SYSTEM READY</span>
                        </div>
                    </div>
                </div>

                {/* Header Actions */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    <button
                        className="intel-btn-primary"
                        onClick={() => setViewMode(viewMode === 'create' ? 'status' : 'create')}
                    >
                        {viewMode === 'create' ? <History size={18} style={{ marginRight: '8px' }} /> : <Plus size={18} style={{ marginRight: '8px' }} />}
                        {viewMode === 'create' ? 'VIEW LOGS' : 'NEW TRANSMISSION'}
                    </button>
                </div>
            </div>

            <div className="report-layout-v2" style={{ marginTop: '20px' }}>
                {/* Feed Column */}
                <div className="report-feed-column">
                    <div className="transmission-status-summary-v2" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                        <div className="stat-pill-v2" style={{ width: '100%', background: 'rgba(219, 10, 64, 0.03)', border: '1px solid rgba(219, 10, 64, 0.1)', padding: '20px', borderRadius: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="stat-label" style={{ fontSize: '0.7rem', fontWeight: '900', color: '#DB0A40', letterSpacing: '2px' }}>PENDING REVIEW</div>
                            <div className="stat-value" style={{ fontSize: '2rem', fontWeight: '900', color: pendingAction > 0 ? '#DB0A40' : '#444', lineHeight: '1' }}>
                                {pendingAction.toString().padStart(2, '0')}
                            </div>
                        </div>
                        <div className="stat-pill-v2" style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="stat-label" style={{ fontSize: '0.7rem', fontWeight: '900', color: '#666', letterSpacing: '2px' }}>TOTAL TRANSMISSIONS</div>
                            <div className="stat-value" style={{ fontSize: '2rem', fontWeight: '900', color: '#fff', lineHeight: '1' }}>
                                {reports.length.toString().padStart(2, '0')}
                            </div>
                        </div>
                    </div>

                    <div className="reports-log-v2">
                        {/* Sent History Aggregate Card */}
                        <div
                            className={`report-card-v2 archive-card ${viewMode === 'archive' ? 'selected' : ''}`}
                            onClick={() => {
                                setViewMode('archive');
                                setSelectedReport(null);
                            }}
                            style={{ padding: '1.5rem', borderLeft: '3px solid #fcd34d', borderRadius: '0' }}
                        >
                            <div className="report-card-main" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                                <span className="type-tag" style={{ color: '#fcd34d', borderColor: 'rgba(252, 211, 77, 0.2)', marginBottom: '5px' }}>ARCHIVE</span>
                                <h4 style={{ fontSize: '1.1rem', margin: '0' }}>SENT REGISTRY</h4>
                                <div className="report-card-meta" style={{ color: '#888' }}>
                                    {sentByCoach.length} transmissions logged
                                </div>
                            </div>
                        </div>

                        {receivedFromPlayers.length === 0 ? (
                            <div className="empty-feed-v2" style={{ marginTop: '1rem', textAlign: 'center', padding: '3rem', background: 'rgba(0,0,0,0.1)', borderRadius: '0', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                <Activity size={32} color="#333" />
                                <p style={{ color: '#666', marginTop: '1rem' }}>No incoming intelligence reports.</p>
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
                                    style={{ padding: '1.5rem', borderLeft: `3px solid ${report.priority === 'urgent' ? '#DB0A40' : 'rgba(255,255,255,0.1)'}`, borderRadius: '0' }}
                                >
                                    <div className="report-card-main" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span className="type-tag" style={{ color: report.priority === 'urgent' ? '#DB0A40' : '#888' }}>{report.type.toUpperCase()}</span>
                                            {report.priority === 'urgent' && <div className="urgent-dot" style={{ width: '6px', height: '6px', background: '#DB0A40', borderRadius: '50%' }}></div>}
                                        </div>
                                        <h4 style={{ fontSize: '1.1rem', margin: '0', color: '#fff' }}>{report.title}</h4>
                                        <div className="report-card-meta">
                                            From: {report.sender_name}
                                            <span style={{ margin: '0 8px' }}>•</span>
                                            {formatDate(report.created_at)}
                                        </div>
                                    </div>
                                    {report.response && (
                                        <div style={{ position: 'absolute', top: '20px', right: '20px', color: '#4cd137' }}>
                                            <Shield size={16} />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Command briefing Column */}
                <div className="report-briefing-column">
                    {viewMode === 'create' ? (
                        <div className="intel-card animate-slide-up" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0' }}>
                            <div className="briefing-banner" style={{ background: 'linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '0' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '2px' }}>OUTGOING COMMAND</h3>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#DB0A40', fontWeight: 'bold', letterSpacing: '3px' }}>TRANSMISSION PROTOCOL</p>
                                </div>
                            </div>

                            <div className="briefing-core" style={{ padding: '2.5rem' }}>
                                <div className="recipient-selector" style={{ marginBottom: '3rem' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '900', color: '#444', marginBottom: '1.5rem', display: 'block', letterSpacing: '3px' }}>TARGET UPLINKS</label>

                                    <div className="uplink-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* President Option */}
                                        <div
                                            className={`uplink-row ${sendToPresident ? 'selected' : ''}`}
                                            onClick={() => setSendToPresident(!sendToPresident)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '20px',
                                                padding: '15px 25px',
                                                background: sendToPresident ? 'rgba(219, 10, 64, 0.1)' : 'rgba(255,255,255,0.02)',
                                                border: '1px solid',
                                                borderColor: sendToPresident ? '#DB0A40' : 'rgba(255,255,255,0.05)',
                                                borderRadius: '0',
                                                cursor: 'pointer',
                                                transition: '0.3s'
                                            }}
                                        >
                                            <div style={{ width: '45px', height: '45px', background: sendToPresident ? '#DB0A40' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '900', color: sendToPresident ? '#fff' : '#444', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0' }}>
                                                P
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '900', color: sendToPresident ? '#fff' : '#888', letterSpacing: '1px' }}>PRESIDENT</span>
                                                <span style={{ fontSize: '0.65rem', color: sendToPresident ? '#DB0A40' : '#444', fontWeight: 'bold' }}>COMMAND UPLINK</span>
                                            </div>
                                        </div>

                                        {/* Players Options in a 2-column list but more vertical */}
                                        <div className="players-uplink-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                            {players.map(player => (
                                                <div
                                                    key={player.id}
                                                    className={`uplink-row ${selectedPlayerIds.includes(player.id) ? 'selected' : ''}`}
                                                    onClick={() => togglePlayerSelection(player.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '15px',
                                                        padding: '12px 18px',
                                                        background: selectedPlayerIds.includes(player.id) ? 'rgba(219, 10, 64, 0.1)' : 'rgba(255,255,255,0.02)',
                                                        border: '1px solid',
                                                        borderColor: selectedPlayerIds.includes(player.id) ? '#DB0A40' : 'rgba(255,255,255,0.05)',
                                                        borderRadius: '0',
                                                        cursor: 'pointer',
                                                        transition: '0.3s'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        background: selectedPlayerIds.includes(player.id) ? '#DB0A40' : 'rgba(255,255,255,0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '900',
                                                        color: selectedPlayerIds.includes(player.id) ? '#fff' : '#444',
                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                        borderRadius: '0'
                                                    }}>
                                                        {player.name.charAt(0)}
                                                    </div>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: selectedPlayerIds.includes(player.id) ? '#fff' : '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSendReport} className="inline-submission-form">
                                    <div className="form-layout-refined" style={{ padding: '0', gap: '30px' }}>
                                        <div className="form-group-refined">
                                            <label style={{ fontSize: '0.65rem', color: '#444' }}>SUBJECT</label>
                                            <input
                                                type="text"
                                                placeholder="Briefing title..."
                                                value={newReport.title}
                                                onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                                                style={{ padding: '18px', fontSize: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0' }}
                                                required
                                            />
                                        </div>

                                        <div className="form-row-refined">
                                            <div className="form-group-refined">
                                                <label style={{ fontSize: '0.65rem', color: '#444' }}>CATEGORY</label>
                                                <SelectorCard
                                                    value={newReport.category}
                                                    onChange={val => setNewReport({ ...newReport, category: val })}
                                                    options={[
                                                        { label: 'PERFORMANCE', value: 'performance' },
                                                        { label: 'TACTICAL', value: 'tactical' },
                                                        { label: 'MEDICAL', value: 'medical' }
                                                    ]}
                                                />
                                            </div>
                                            <div className="form-group-refined">
                                                <label style={{ fontSize: '0.65rem', color: '#444' }}>PRIORITY</label>
                                                <SelectorCard
                                                    value={newReport.priority}
                                                    onChange={val => setNewReport({ ...newReport, priority: val })}
                                                    options={[
                                                        { label: 'STANDARD', value: 'normal' },
                                                        { label: 'URGENT', value: 'urgent' }
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group-refined">
                                            <label style={{ fontSize: '0.65rem', color: '#444' }}>CONTENT</label>
                                            <textarea
                                                rows="8"
                                                placeholder="Specify transmission details..."
                                                value={newReport.content}
                                                onChange={e => setNewReport({ ...newReport, content: e.target.value })}
                                                style={{ padding: '18px', fontSize: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', resize: 'none', borderRadius: '0' }}
                                                required
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="form-actions-refined" style={{ marginTop: '40px' }}>
                                        <button type="submit" className="submit-launch-btn" style={{ padding: '22px', fontSize: '1rem', borderRadius: '0' }}>
                                            <Send size={20} />
                                            LAUNCH TRANSMISSION
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : viewMode === 'archive' ? (
                        <div className="intel-card animate-slide-up" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0' }}>
                            <div className="briefing-banner" style={{ background: 'linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ background: '#fcd34d', padding: '15px', borderRadius: '0' }}>
                                        <History size={32} color="#000" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '1px' }}>SENT REGISTRY</h3>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#fcd34d', fontWeight: 'bold' }}>OUTGOING ARCHIVE</p>
                                    </div>
                                </div>
                            </div>
                            <div className="briefing-core" style={{ padding: '2rem' }}>
                                <div className="archive-list-v2" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {sentByCoach.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '5rem', color: '#222' }}>
                                            <History size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
                                            <p style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px' }}>NO ARCHIVE RECORDS FOUND</p>
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
                                                style={{
                                                    background: 'rgba(255,255,255,0.01)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    padding: '20px',
                                                    borderRadius: '0',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: '0.3s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(252, 211, 77, 0.05)';
                                                    e.currentTarget.style.borderColor = 'rgba(252, 211, 77, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{
                                                        width: '45px',
                                                        height: '45px',
                                                        background: 'rgba(252, 211, 77, 0.1)',
                                                        borderRadius: '0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1rem',
                                                        fontWeight: '900',
                                                        color: '#fcd34d'
                                                    }}>
                                                        {report.recipient_role === 'president' ? 'P' : 'A'}
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#fcd34d', letterSpacing: '2px' }}>TO: {report.recipient_role.toUpperCase()}</span>
                                                        <h4 style={{ margin: '5px 0', fontSize: '1rem', color: '#fff', fontWeight: '800' }}>{report.title}</h4>
                                                        <span style={{ fontSize: '0.7rem', color: '#444', fontWeight: '700' }}>{formatDate(report.created_at)}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={18} color="#222" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : selectedReport ? (
                        <div className="intel-card animate-slide-up" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0' }}>
                            <div className="briefing-banner" style={{ background: 'linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#DB0A40', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
                                        {selectedReport.sender_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px' }}>{selectedReport.sender_name}</h3>
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: selectedReport.sender_id === currentUser.id ? '#4cd137' : '#DB0A40', fontWeight: 'bold' }}>
                                            {selectedReport.sender_id === currentUser.id ? 'OUTGOING' : 'INCOMING'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="briefing-core" style={{ padding: '2.5rem' }}>
                                <div style={{ borderLeft: '4px solid #DB0A40', paddingLeft: '20px', marginBottom: '2rem' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900' }}>{selectedReport.title}</h2>
                                    <span style={{ fontSize: '0.7rem', color: '#666' }}>{formatDate(selectedReport.created_at)}</span>
                                </div>

                                <div className="report-content-area" style={{ background: 'rgba(255,255,255,0.01)', padding: '2rem', borderRadius: '0', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="content-text" style={{ color: '#aaa', lineHeight: '1.8' }}>{selectedReport.content}</div>
                                </div>

                                {selectedReport.response ? (
                                    <div className="msg-coach-response" style={{ background: 'rgba(76, 209, 55, 0.05)', border: '1px solid rgba(76, 209, 55, 0.1)', padding: '2rem', borderRadius: '0' }}>
                                        <h5 style={{ margin: '0 0 10px 0', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px', color: '#4cd137' }}>{selectedReport.sender_id === currentUser.id ? 'UPLINK RESPONSE' : 'YOUR RECORDED RESPONSE'}</h5>
                                        <p style={{ margin: 0, color: '#eee' }}>{selectedReport.response}</p>
                                    </div>
                                ) : selectedReport.sender_id !== currentUser.id && (
                                    <div className="msg-coach-response" style={{ background: 'rgba(219, 10, 64, 0.05)', border: '1px dashed #DB0A40', padding: '2rem', borderRadius: '0' }}>
                                        <h5 style={{ margin: '0 0 15px 0', fontSize: '0.7rem', fontWeight: '900', color: '#fff' }}>DRAFT OFFICIAL RESPONSE</h5>
                                        <textarea
                                            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', color: '#eee', padding: '15px', borderRadius: '0', resize: 'none' }}
                                            placeholder="Specify response..."
                                            value={coachResponse}
                                            onChange={(e) => setCoachResponse(e.target.value)}
                                            rows="4"
                                        />
                                        <button className="intel-btn-primary" style={{ marginTop: '20px', width: '100%', justifyContent: 'center', borderRadius: '0' }} onClick={() => handleRespond(selectedReport.id)}>
                                            COMMIT RESPONSE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="intel-card briefing-empty-v2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '0' }}>
                            <FileText size={48} color="#222" style={{ marginBottom: '20px' }} />
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900' }}>INTELLIGENCE FEED</h3>
                            <p style={{ color: '#666', fontSize: '0.85rem' }}>Select a transmission to decrypt details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Report;
