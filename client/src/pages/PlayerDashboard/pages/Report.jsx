import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import {
    FileText,
    ChevronRight,
    BarChart2,
    Clock,
    Plus,
    Send,
    AlertCircle,
    X,
    Filter,
    Shield,
    Activity,
    Mail,
    Bell
} from 'lucide-react';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import SelectorCard from '../../../components/SelectorCard/SelectorCard';

const Report = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification?.() || { showNotification: (msg) => console.log(msg) };
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('create'); // 'create' or 'status'
    const [showNotifPopup, setShowNotifPopup] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [playerResponse, setPlayerResponse] = useState('');
    const [newReport, setNewReport] = useState({
        title: '',
        content: '',
        recipient_role: 'coach',
        type: 'technical',
        priority: 'normal'
    });

    useEffect(() => {
        if (currentUser?.id) {
            fetchReports();
        }
    }, [currentUser]);

    const fetchReports = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reports?playerId=${currentUser.id}`);
            setReports(res.data);
        } catch (err) {
            console.error("Error fetching reports:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReport = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/reports/send', {
                ...newReport,
                sender_id: currentUser.id,
                sender_name: currentUser.name,
                player_id: currentUser.id
            });
            setNewReport({ title: '', content: '', recipient_role: 'coach', type: 'technical', priority: 'normal' });
            fetchReports();
            showNotification("Transmission successful!", "success");
            // User requested to see notifications, let's just stay on create and show the notif.
        } catch (err) {
            console.error("Transmission error:", err.response?.data || err.message);
            showNotification("Transmission failed. Check console for details.", "error");
        }
    };

    const handleRespond = async (reportId) => {
        if (!playerResponse.trim()) return;
        try {
            await axios.post('http://localhost:5000/api/reports/respond', {
                reportId,
                response: playerResponse
            });
            showNotification("Response sent successfully.", "success");
            setPlayerResponse('');
            setSelectedReport(null);
            fetchReports();
        } catch (err) {
            console.error("Response error:", err.response?.data || err.message);
            showNotification("Failed to send response.", "error");
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

    const sentByPlayer = reports.filter(r => r.sender_id === currentUser.id);
    const receivedFromStaff = reports.filter(r => r.sender_id !== currentUser.id);
    const pendingAction = receivedFromStaff.filter(r => !r.response).length;
    const awaitingStaff = sentByPlayer.filter(r => !r.response).length;

    return (
        <div className="report-layout-v2 animate-fade-in dashboard-fashion-theme">
            {/* Feed Column - Intel received from Coach/Staff */}
            <div className="report-feed-column">
                <div className="transmission-status-summary-v2">
                    <div className="stat-pill-v2">
                        <div className="stat-label">WAITING FOR ACTION</div>
                        <div className="stat-value" style={{ color: pendingAction > 0 ? 'var(--dash-primary)' : '#444' }}>
                            {pendingAction.toString().padStart(2, '0')}
                        </div>
                    </div>
                    <div className="stat-pill-v2">
                        <div className="stat-label">AWAITING FEEDBACK</div>
                        <div className="stat-value" style={{ color: awaitingStaff > 0 ? '#fcd34d' : '#444' }}>
                            {awaitingStaff.toString().padStart(2, '0')}
                        </div>
                    </div>
                    <div className="stat-pill-v2">
                        <div className="stat-label">TOTAL TRANSMISSIONS</div>
                        <div className="stat-value">{sentByPlayer.length.toString().padStart(2, '0')}</div>
                    </div>
                </div>

                <div className="section-title-fancy">
                    <Mail size={24} color="var(--dash-primary)" />
                    <h2>Intel Feed</h2>
                    <div className="dot-line"></div>
                    <button
                        className={`filter-btn-v2 ${viewMode === 'status' ? 'active' : ''}`}
                        onClick={() => setViewMode(viewMode === 'status' ? 'create' : 'status')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '5px 15px', borderRadius: '30px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {viewMode === 'create' ? 'VIEW LOGS' : 'NEW MESSAGE'}
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
                                    {sentByPlayer.length} messages logged
                                </div>
                            </div>
                        </div>
                    </div>

                    {receivedFromStaff.length === 0 ? (
                        <div className="empty-feed-v2" style={{ marginTop: '1rem' }}>
                            <Activity size={32} />
                            <p>No incoming staff briefings detected.</p>
                        </div>
                    ) : (
                        receivedFromStaff.map(report => (
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
                                            {report.priority === 'urgent' && <div className="urgent-dot"></div>}
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
                                            <Activity size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Briefing / Form Column */}
            <div className="report-briefing-column">
                {viewMode === 'create' ? (
                    <div className="briefing-container-v2 animate-slide-up">
                        <div className="briefing-banner report-bg">
                            <Send size={32} color="var(--dash-primary)" />
                            <div className="banner-text">
                                <h3>COMMAND CENTER</h3>
                                <p>SECURE TRANSMISSION PROTOCOL</p>
                            </div>
                        </div>

                        <div className="briefing-core">
                            <form onSubmit={handleSendReport} className="inline-submission-form">
                                <div className="form-layout-refined">
                                    <div className="form-group-refined">
                                        <label>SUBJECT LINE</label>
                                        <input
                                            type="text"
                                            placeholder="Enter report title..."
                                            value={newReport.title}
                                            onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-row-refined">
                                        <div className="form-group-refined">
                                            <label>RECIPIENT</label>
                                            <SelectorCard
                                                value={newReport.recipient_role}
                                                onChange={val => setNewReport({ ...newReport, recipient_role: val })}
                                                options={[
                                                    { label: 'STAFF COACH', value: 'coach' },
                                                    { label: 'ADMIN OFFICE', value: 'president' },
                                                    { label: 'MEDICAL UNIT', value: 'medical' }
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
                                                    { label: 'URGENT', value: 'urgent' }
                                                ]}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group-refined">
                                        <label>BODY CONTENT</label>
                                        <textarea
                                            rows="8"
                                            placeholder="Describe your situation in detail..."
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
                                {sentByPlayer.length === 0 ? (
                                    <div className="empty-archive-v2">
                                        <p>No outgoing transmissions found.</p>
                                    </div>
                                ) : (
                                    sentByPlayer.map(report => (
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
                                <p>{selectedReport.recipient_role === 'player' ? 'Incoming Intelligence' : 'Outgoing Message'}</p>
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
                                        {selectedReport.response ? 'SYNCED' : 'PENDING'}
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
                                    <h5>{selectedReport.sender_id === currentUser.id ? 'DIRECT RESPONSE' : 'YOUR RESPONSE'}</h5>
                                    <p>{selectedReport.response}</p>
                                </div>
                            )}

                            {!selectedReport.response && selectedReport.sender_id !== currentUser.id && (
                                <div className="msg-coach-response" style={{ marginTop: '0', background: 'rgba(255,255,255,0.02)' }}>
                                    <h5 style={{ color: '#fff' }}>WRITE RESPONSE</h5>
                                    <textarea
                                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#eee', padding: '10px 0', fontSize: '0.9rem', minHeight: '100px', outline: 'none' }}
                                        placeholder="Type your response..."
                                        value={playerResponse}
                                        onChange={(e) => setPlayerResponse(e.target.value)}
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
                        <h3>INTEL SECTOR</h3>
                        <p>Select a transmission from the log to decrypt and view briefing details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Report;
