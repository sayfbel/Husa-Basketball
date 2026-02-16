import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Info,
    Mail,
    Phone,
    Calendar,
    ArrowLeft,
    UserPlus,
    UserMinus,
    History
} from 'lucide-react';
import '../css/new-members.css';

const NewMembers = () => {
    const [applicants, setApplicants] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [historyType, setHistoryType] = useState('accepted'); // 'accepted' or 'rejected'
    const [swipeDirection, setSwipeDirection] = useState(null);

    useEffect(() => {
        fetchApplicants();
    }, []);

    const fetchApplicants = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/tryouts');
            setApplicants(res.data || []);
        } catch (err) {
            console.error("Error fetching tryouts:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        setSwipeDirection(status === 'accepted' ? 'right' : 'left');

        try {
            await axios.patch(`http://localhost:5000/api/tryouts/${id}/status`, { status });

            // Wait for animation
            setTimeout(() => {
                setApplicants(prev => prev.map(a => a.id === id ? { ...a, status } : a));
                setSwipeDirection(null);
                // Move to next pending
                // find next pending index after current
            }, 300);
        } catch (err) {
            console.error("Error updating status:", err);
            setSwipeDirection(null);
        }
    };

    const activeApplicants = applicants.filter(a => a.status === 'pending');
    const currentApplicant = activeApplicants[currentIndex];

    const acceptedList = applicants.filter(a => a.status === 'accepted');
    const rejectedList = applicants.filter(a => a.status === 'rejected');

    if (loading) return <div className="loading-spinner">Synchronizing Recruitment Systems...</div>;

    return (
        <div className="new-members-page">
            <div className={`history-sidebar ${showHistory ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button className="close-sidebar" onClick={() => setShowHistory(false)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h3>RECRUITMENT LOGS</h3>
                </div>

                <div className="history-tabs">
                    <button
                        className={`tab ${historyType === 'accepted' ? 'active' : ''}`}
                        onClick={() => setHistoryType('accepted')}
                    >
                        ACCEPTED ({acceptedList.length})
                    </button>
                    <button
                        className={`tab ${historyType === 'rejected' ? 'active' : ''}`}
                        onClick={() => setHistoryType('rejected')}
                    >
                        REJECTED ({rejectedList.length})
                    </button>
                </div>

                <div className="history-list">
                    {(historyType === 'accepted' ? acceptedList : rejectedList).map(app => (
                        <div key={app.id} className="history-item">
                            <div className="item-info">
                                <strong>{app.applicant_name}</strong>
                                <span>{app.position} • {app.age} yrs</span>
                            </div>
                            <button className="re-eval" onClick={() => handleAction(app.id, 'pending')}>
                                RE-EVALUATE
                            </button>
                        </div>
                    ))}
                    {(historyType === 'accepted' ? acceptedList : rejectedList).length === 0 && (
                        <div className="empty-history">No entries recorded yet.</div>
                    )}
                </div>
            </div>

            <main className="main-recruitment">
                <header className="recruitment-header">
                    <div className="header-left">
                        <UserPlus size={24} className="accent-icon" />
                        <div>
                            <h1>NEW MEMBERS <span className="accent-text">QUEUE</span></h1>
                            <p>{activeApplicants.length} pending review</p>
                        </div>
                    </div>
                    <button className="history-toggle" onClick={() => setShowHistory(true)}>
                        <History size={20} />
                        VIEW HISTORY
                    </button>
                </header>

                <div className="card-stack-container">
                    {currentApplicant ? (
                        <div className={`applicant-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}>
                            <div className="card-top">
                                <div className="applicant-avatar">
                                    {currentApplicant.applicant_name.charAt(0)}
                                </div>
                                <div className="applicant-main">
                                    <h2>{currentApplicant.applicant_name}</h2>
                                    <div className={`status-badge ${currentApplicant.status}`}>
                                        {currentApplicant.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <div className="card-grid">
                                <div className="info-box">
                                    <span className="label">POSITION</span>
                                    <span className="value">{currentApplicant.position || 'N/A'}</span>
                                </div>
                                <div className="info-box">
                                    <span className="label">AGE</span>
                                    <span className="value">{currentApplicant.age} YRS</span>
                                </div>
                                <div className="info-box">
                                    <span className="label">HEIGHT</span>
                                    <span className="value">{currentApplicant.height || 'N/A'}</span>
                                </div>
                                <div className="info-box">
                                    <span className="label">CONTACT</span>
                                    <span className="value">{currentApplicant.phone}</span>
                                </div>
                            </div>

                            <div className="experience-section">
                                <h3>STATEMENT / EXPERIENCE</h3>
                                <p>{currentApplicant.experience || "No additional information provided."}</p>
                            </div>

                            <div className="card-footer">
                                <div className="footer-meta">
                                    <div className="meta-item">
                                        <Mail size={14} /> {currentApplicant.email}
                                    </div>
                                    <div className="meta-item">
                                        <Calendar size={14} /> {new Date(currentApplicant.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {currentApplicant.file_url && (
                                    <a href={currentApplicant.file_url} target="_blank" rel="noreferrer" className="video-link">
                                        <Info size={14} /> VIEW HIGHLIGHT VIDEO
                                    </a>
                                )}
                            </div>

                            <div className="action-buttons">
                                <button
                                    className="action-btn reject"
                                    onClick={() => handleAction(currentApplicant.id, 'rejected')}
                                >
                                    <X size={28} />
                                    <span>REFUSE</span>
                                </button>
                                <button
                                    className="action-btn accept"
                                    onClick={() => handleAction(currentApplicant.id, 'accepted')}
                                >
                                    <Check size={28} />
                                    <span>CONFIRM</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="all-caught-up">
                            <Users size={48} className="empty-icon" />
                            <h2>Queue Cleared</h2>
                            <p>No new member applications pending review.</p>
                            <button className="refresh-btn" onClick={fetchApplicants}>REFRESH SYSTEM</button>
                        </div>
                    )}
                </div>

                {activeApplicants.length > 1 && (
                    <div className="queue-controls">
                        <button
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(prev => prev - 1)}
                            className="nav-btn"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="queue-index">CARD {currentIndex + 1} OF {activeApplicants.length}</span>
                        <button
                            disabled={currentIndex === activeApplicants.length - 1}
                            onClick={() => setCurrentIndex(prev => prev + 1)}
                            className="nav-btn"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NewMembers;
