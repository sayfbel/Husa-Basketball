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
import SelectorCard from '../../../components/SelectorCard/SelectorCard';

const Report = () => {
    const { currentUser } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('create'); // 'create' or 'status'
    const [showNotifPopup, setShowNotifPopup] = useState(false);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="animate-fade-in report-page-refined">
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Accessing Tactical Comms...</p>
                </div>
            ) : (
                <div className="single-col-report-container" style={{ maxWidth: '800px', margin: '0 auto' }}>

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
                                        <div className="form-group-refined full">
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
                                        <div className="form-group-refined full">
                                            <label>BODY CONTENT</label>
                                            <textarea
                                                rows="10"
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
                    ) : (
                        <div className="status-page-v2 animate-slide-up">
                            <div className="section-title-fancy" style={{ marginBottom: '2rem' }}>
                                <Activity size={24} color="var(--dash-primary)" />
                                <h2>Transmission Status</h2>
                                <button className="back-link-v2" onClick={() => setViewMode('create')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontWeight: 'bold' }}>
                                    BACK TO COMMAND
                                </button>
                            </div>

                            <div className="status-grid-v2">
                                {reports.map(report => (
                                    <div key={report.id} className="message-status-card">
                                        <div className={`msg-status-badge ${report.response ? 'replied' : 'pending'}`}>
                                            {report.response ? 'RESPONSE RECEIVED' : 'PANDING REVIEW'}
                                        </div>
                                        <div className="msg-info-v2">
                                            <div className="msg-recipient">
                                                TO: {report.recipient_role.toUpperCase()}
                                                <span className="dot">•</span>
                                                {formatDate(report.created_at)}
                                            </div>
                                            <h3>{report.title}</h3>
                                            <div className="msg-body-preview">{report.content}</div>

                                            {report.response && (
                                                <div className="msg-coach-response">
                                                    <h5>DIRECT RESPONSE</h5>
                                                    <p>{report.response}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {reports.length === 0 && (
                                    <div className="empty-state">
                                        <Mail size={48} color="#222" />
                                        <p>No transmissions in current queue.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Floating Notification Hub */}
                    <div className="comms-fab-hub">
                        {showNotifPopup && (
                            <div className="notification-popup-v2 animate-slide-up">
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#fff' }}>TRANSIMISSION LOGS</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {reports.slice(0, 2).map(report => (
                                        <div key={report.id} className="notif-item-v2">
                                            <p>Your message send {formatDate(report.created_at)}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span className="notif-date">{report.title.substring(0, 20)}...</span>
                                                <button
                                                    className="notif-see-btn"
                                                    onClick={() => {
                                                        setViewMode('status');
                                                        setShowNotifPopup(false);
                                                    }}
                                                >
                                                    SEE
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {reports.length === 0 && <p style={{ fontSize: '0.8rem', color: '#444' }}>No recent activity.</p>}
                                </div>
                            </div>
                        )}
                        <button className="fab-circle" onClick={() => setShowNotifPopup(!showNotifPopup)}>
                            <Bell size={28} />
                            {reports.length > 0 && <div className="fab-badge">!</div>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Report;
