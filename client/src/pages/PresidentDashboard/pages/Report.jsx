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

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const Report = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification?.() || { showNotification: (msg) => { } };
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

    if (loading) return <div className="animate-fade-in" style={{ padding: '2rem', color: '#fff' }}>Synchronizing executive transmissions...</div>;

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">REPORTS</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">EXECUTIVE INTEL</span>
                    <h1 className="hero-dashboard-title">
                        CLUB <br />
                        <span className="accent-text">COMMUNICATIONS</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <Activity size={14} />
                            <span>{receivedReports.length} INCOMING</span>
                        </div>
                        <div className="status-item">
                            <Send size={14} />
                            <span>{sentDirectives.length} DIRECTIVES</span>
                        </div>
                    </div>
                </div>

                {/* Header Actions */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    <button
                        className="intel-btn-primary"
                        onClick={() => setViewMode(viewMode === 'create' ? 'status' : 'create')}
                    >
                        {viewMode === 'create' ? <Activity size={18} style={{ marginRight: '8px' }} /> : <Plus size={18} style={{ marginRight: '8px' }} />}
                        {viewMode === 'create' ? 'VIEW LOGS' : 'NEW DIRECTIVE'}
                    </button>
                </div>
            </div>

            <div className="report-layout-v2" style={{ marginTop: '20px' }}>
                {/* Feed Column */}
                <div className="report-feed-column">
                    <div className="transmission-status-summary-v2">
                        <div className="stat-pill-v2">
                            <div className="stat-label">INCOMING REQUESTS</div>
                            <div className="stat-value" style={{ color: receivedReports.length > 0 ? '#DB0A40' : '#444' }}>
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
                                    <div className="card-accent" style={{ background: report.sender_id === currentUser.id ? '#4cd137' : '#DB0A40' }}></div>
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
                        <div className="intel-card animate-slide-up" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="briefing-banner report-bg" style={{ background: 'linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ background: '#DB0A40', padding: '15px', borderRadius: '4px' }}>
                                        <Shield size={32} color="#fff" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px' }}>EXECUTIVE COMMAND</h3>
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#DB0A40', fontWeight: 'bold' }}>OFFICIAL CLUB DIRECTIVE</p>
                                    </div>
                                </div>
                            </div>

                            <div className="briefing-core" style={{ padding: '2rem' }}>
                                <form onSubmit={handleSendReport} className="inline-submission-form">
                                    <div className="form-layout-refined">
                                        <div className="form-group-refined">
                                            <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>DIRECTIVE SUBJECT</label>
                                            <input
                                                type="text"
                                                placeholder="Enter directive title..."
                                                value={newReport.title}
                                                onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                                                required
                                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '15px', width: '100%', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div className="form-row-refined" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                            <div className="form-group-refined">
                                                <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>TARGET CADRE</label>
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
                                                <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>AUTH LEVEL</label>
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
                                        <div className="form-group-refined" style={{ marginTop: '20px' }}>
                                            <label style={{ fontSize: '0.66rem', color: '#666', fontWeight: 'bold', letterSpacing: '2px', display: 'block', marginBottom: '10px' }}>DIRECTIVE CONTENT</label>
                                            <textarea
                                                rows="8"
                                                placeholder="Specify executive instructions..."
                                                value={newReport.content}
                                                onChange={e => setNewReport({ ...newReport, content: e.target.value })}
                                                required
                                                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '20px', width: '100%', fontSize: '1rem', resize: 'none' }}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="form-actions-refined" style={{ marginTop: '30px' }}>
                                        <button type="submit" className="intel-btn-primary" style={{ width: '100%', justifyContent: 'center', height: '50px' }}>
                                            <Send size={18} style={{ marginRight: '10px' }} />
                                            LAUNCH DIRECTIVE
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : selectedReport ? (
                        <div className="intel-card animate-slide-up" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="briefing-banner report-bg" style={{ background: 'linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#DB0A40', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
                                        {selectedReport.sender_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px' }}>{selectedReport.sender_name}</h3>
                                        <p style={{ margin: 0, fontSize: '0.7rem', color: selectedReport.sender_id === currentUser.id ? '#4cd137' : '#DB0A40', fontWeight: 'bold' }}>
                                            {selectedReport.sender_id === currentUser.id ? 'OUTGOING DIRECTIVE' : 'INCOMING TRANSMISSION'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="briefing-core" style={{ padding: '2.5rem' }}>
                                <div style={{ borderLeft: '4px solid #DB0A40', paddingLeft: '20px', marginBottom: '2.5rem' }}>
                                    <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.5px' }}>{selectedReport.title}</h2>
                                    <span style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '2px' }}>{formatDate(selectedReport.created_at)}</span>
                                </div>

                                <div className="report-content-area" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '4px', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="content-text" style={{ color: '#aaa', lineHeight: '1.8', fontSize: '1rem' }}>{selectedReport.content}</div>
                                </div>

                                {selectedReport.response ? (
                                    <div className="msg-coach-response" style={{ background: 'rgba(76, 209, 55, 0.05)', border: '1px solid rgba(76, 209, 55, 0.1)', padding: '2rem', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4cd137', marginBottom: '10px' }}>
                                            <Activity size={16} />
                                            <h5 style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px' }}>OFFICIAL RESPONSE</h5>
                                        </div>
                                        <p style={{ margin: 0, color: '#eee', fontSize: '0.95rem', lineHeight: '1.6' }}>{selectedReport.response}</p>
                                    </div>
                                ) : selectedReport.recipient_role === 'president' && (
                                    <div className="msg-coach-response" style={{ background: 'rgba(219, 10, 64, 0.05)', border: '1px dashed #DB0A40', padding: '2rem', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DB0A40', marginBottom: '15px' }}>
                                            <Shield size={16} />
                                            <h5 style={{ margin: 0, fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px' }}>EXECUTIVE RESPONSE REQUIRED</h5>
                                        </div>
                                        <textarea
                                            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#eee', padding: '15px', borderRadius: '4px', resize: 'none', minHeight: '120px' }}
                                            placeholder="Record official executive response..."
                                            value={executiveResponse}
                                            onChange={(e) => setExecutiveResponse(e.target.value)}
                                        />
                                        <button className="intel-btn-primary" style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }} onClick={() => handleRespond(selectedReport.id)}>
                                            <Check size={18} style={{ marginRight: '10px' }} />
                                            COMMIT RESPONSE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="intel-card briefing-empty-v2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                <FileText size={40} color="#333" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px' }}>EXECUTIVE INTEL CENTER</h3>
                            <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#666' }}>Select a transmission to view club-wide communications and launch directives.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Report;
