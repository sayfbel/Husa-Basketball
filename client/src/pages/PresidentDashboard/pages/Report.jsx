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
    Bell,
    TrendingUp
} from 'lucide-react';
import { useNotification } from '../../../components/Notification/Notification.jsx';
import SelectorCard from '../../../components/SelectorCard/SelectorCard';
import '../css/Reports.css';

const Report = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification?.() || { showNotification: (msg) => console.log(msg) };
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('status'); // 'create' or 'status'
    const [selectedReport, setSelectedReport] = useState(null);
    const [executiveResponse, setExecutiveResponse] = useState('');
    const [newReport, setNewReport] = useState({
        title: '',
        content: '',
        recipient_role: 'coach',
        type: 'directive',
        priority: 'normal'
    });

    useEffect(() => {
        if (currentUser?.id) {
            fetchReports();
        }
    }, [currentUser]);

    const fetchReports = async () => {
        try {
            // President sees all reports mentioning 'president' or sent by them
            const res = await axios.get(`http://localhost:5000/api/reports`);
            // Filter: where recipient is president OR sender is president
            const allReports = res.data;
            const filtered = allReports.filter(r =>
                r.recipient_role === 'president' ||
                r.sender_id === currentUser.id
            );
            setReports(filtered);
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
                sender_name: currentUser.name
            });
            setNewReport({ title: '', content: '', recipient_role: 'coach', type: 'directive', priority: 'normal' });
            fetchReports();
            showNotification("Directive launched successfully!", "success");
            setViewMode('status');
        } catch (err) {
            console.error("Transmission error:", err);
            showNotification("Failed to launch directive.", "error");
        }
    };

    const handleRespond = async (reportId) => {
        if (!executiveResponse.trim()) return;
        try {
            await axios.post('http://localhost:5000/api/reports/respond', {
                reportId,
                response: executiveResponse
            });
            showNotification("Official response recorded.", "success");
            setExecutiveResponse('');
            setSelectedReport(null);
            fetchReports();
        } catch (err) {
            console.error("Response error:", err);
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

    const receivedReports = reports.filter(r => r.recipient_role === 'president' && r.sender_id !== currentUser.id);
    const sentDirectives = reports.filter(r => r.sender_id === currentUser.id);

    return (
        <div className="report-layout-v2 animate-fade-in dashboard-fashion-theme">
            {/* Feed Column */}
            <div className="report-feed-column">
                <div className="transmission-status-summary-v2">
                    <div className="stat-pill-v2">
                        <div className="stat-label">INCOMING REQUESTS</div>
                        <div className="stat-value" style={{ color: receivedReports.length > 0 ? 'var(--dash-primary)' : '#444' }}>
                            {receivedReports.length.toString().padStart(2, '0')}
                        </div>
                    </div>
                    <div className="stat-pill-v2">
                        <div className="stat-label">ACTIVE DIRECTIVES</div>
                        <div className="stat-value" style={{ color: sentDirectives.length > 0 ? '#4cd137' : '#444' }}>
                            {sentDirectives.length.toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>

                <div className="section-title-fancy">
                    <TrendingUp size={24} color="var(--dash-primary)" />
                    <h2>Executive Intel</h2>
                    <div className="dot-line"></div>
                    <button
                        className="filter-btn-v2"
                        onClick={() => setViewMode(viewMode === 'create' ? 'status' : 'create')}
                    >
                        {viewMode === 'create' ? <Activity size={14} /> : <Plus size={14} />}
                        {viewMode === 'create' ? 'VIEW LOGS' : 'NEW DIRECTIVE'}
                    </button>
                </div>

                <div className="reports-log-v2">
                    {reports.length === 0 ? (
                        <div className="empty-feed-v2" style={{ marginTop: '1rem' }}>
                            <Activity size={32} />
                            <p>No club transmissions detected.</p>
                        </div>
                    ) : (
                        reports.map(report => (
                            <div
                                key={report.id}
                                className={`report-card-v2 ${selectedReport?.id === report.id ? 'selected' : ''} ${report.sender_id === currentUser.id ? 'sent' : 'received'}`}
                                onClick={() => {
                                    setSelectedReport(report);
                                    setViewMode('status');
                                }}
                            >
                                <div className="card-accent" style={{ background: report.sender_id === currentUser.id ? '#4cd137' : 'var(--dash-primary)' }}></div>
                                <div className="report-card-main">
                                    <div className="report-card-icon">
                                        {report.sender_id === currentUser.id ? <Send size={18} /> : <Mail size={18} />}
                                    </div>
                                    <div className="report-card-info">
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className="type-tag">{report.type.toUpperCase()}</span>
                                            {report.priority === 'urgent' && <div className="urgent-dot"></div>}
                                        </div>
                                        <h4>{report.title}</h4>
                                        <div className="report-card-meta">
                                            {report.sender_id === currentUser.id ? `To: ${report.recipient_role}` : `From: ${report.sender_name}`}
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

            {/* Briefing Column */}
            <div className="report-briefing-column">
                {viewMode === 'create' ? (
                    <div className="briefing-container-v2 animate-slide-up">
                        <div className="briefing-banner report-bg">
                            <Shield size={32} color="var(--dash-primary)" />
                            <div className="banner-text">
                                <h3>EXECUTIVE COMMAND</h3>
                                <p>OFFICIAL CLUB DIRECTIVE</p>
                            </div>
                        </div>

                        <div className="briefing-core">
                            <form onSubmit={handleSendReport} className="inline-submission-form">
                                <div className="form-layout-refined">
                                    <div className="form-group-refined">
                                        <label>DIRECTIVE SUBJECT</label>
                                        <input
                                            type="text"
                                            placeholder="Enter directive title..."
                                            value={newReport.title}
                                            onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-row-refined">
                                        <div className="form-group-refined">
                                            <label>TARGET CADRE</label>
                                            <SelectorCard
                                                value={newReport.recipient_role}
                                                onChange={val => setNewReport({ ...newReport, recipient_role: val })}
                                                options={[
                                                    { label: 'COACHING STAFF', value: 'coach' },
                                                    { label: 'ATHLETE SQUAD', value: 'player' },
                                                    { label: 'MEDICAL UNIT', value: 'medical' }
                                                ]}
                                            />
                                        </div>
                                        <div className="form-group-refined">
                                            <label>AUTH LEVEL</label>
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
                                        <label>DIRECTIVE CONTENT</label>
                                        <textarea
                                            rows="8"
                                            placeholder="Specify executive instructions..."
                                            value={newReport.content}
                                            onChange={e => setNewReport({ ...newReport, content: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="form-actions-refined">
                                    <button type="submit" className="submit-launch-btn">
                                        <Send size={18} />
                                        LAUNCH DIRECTIVE
                                    </button>
                                </div>
                            </form>
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
                                <p>{selectedReport.sender_id === currentUser.id ? 'Outgoing Directive' : 'Incoming Report'}</p>
                            </div>
                        </div>

                        <div className="briefing-core" style={{ padding: '2rem' }}>
                            <h2 className="main-title">{selectedReport.title}</h2>
                            <div className="report-content-area" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                <div className="content-text">{selectedReport.content}</div>
                            </div>

                            {selectedReport.response ? (
                                <div className="msg-coach-response">
                                    <h5>OFFICIAL RESPONSE</h5>
                                    <p>{selectedReport.response}</p>
                                </div>
                            ) : selectedReport.recipient_role === 'president' && (
                                <div className="msg-coach-response">
                                    <h5>EXECUTIVE RESPONSE</h5>
                                    <textarea
                                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#eee', padding: '10px 0' }}
                                        placeholder="Record official response..."
                                        value={executiveResponse}
                                        onChange={(e) => setExecutiveResponse(e.target.value)}
                                    />
                                    <button className="submit-launch-btn" onClick={() => handleRespond(selectedReport.id)}>COMMIT RESPONSE</button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="briefing-empty-v2">
                        <FileText size={48} color="#222" />
                        <h3>EXECUTIVE INTEL</h3>
                        <p>Select a transmission to view club-wide communications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Report;
