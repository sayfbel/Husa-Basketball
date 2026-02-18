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
    History,
    Activity,
    Shield,
    Clock,
    Zap,
    Hash,
    MapPin,
    Ruler
} from 'lucide-react';
import '../../../css/dashboard.css';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

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
                if (activeApplicants.length <= 1) {
                    setCurrentIndex(0);
                } else if (currentIndex >= activeApplicants.length - 1) {
                    setCurrentIndex(prev => Math.max(0, prev - 1));
                }
                setSwipeDirection(null);
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
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">RECRUIT</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">ACQUISITION COMMAND</span>
                    <h1 className="hero-dashboard-title">
                        NEW MEMBERS <br />
                        <span className="accent-text">QUEUE</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <Activity size={14} />
                            <span>{activeApplicants.length} PENDING REVIEW</span>
                        </div>
                        <div className="status-item">
                            <Clock size={14} />
                            <span>LAST SCAN: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>

                {/* Header Actions */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    <button
                        className="intel-btn-primary"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        {showHistory ? <ChevronRight size={18} style={{ marginRight: '8px' }} /> : <History size={18} style={{ marginRight: '8px' }} />}
                        {showHistory ? 'BACK TO QUEUE' : 'VIEW LOGS'}
                    </button>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '20px', gridTemplateColumns: showHistory ? '1fr 350px' : '1fr', transition: 'all 0.4s ease' }}>

                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                    {currentApplicant && !showHistory ? (
                        <div className={`intel-card animate-slide-up ${swipeDirection ? `swipe-${swipeDirection}` : ''}`} style={{ width: '100%', maxWidth: '900px', padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {/* Card Header Banner */}
                            <div style={{ background: 'linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        background: 'rgba(219, 10, 64, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '3rem',
                                        fontWeight: '900',
                                        color: '#DB0A40',
                                        border: '1px solid #DB0A40',
                                        position: 'relative'
                                    }}>
                                        {currentApplicant.applicant_name.charAt(0)}
                                        <div style={{ position: 'absolute', top: '-5px', left: '-5px', width: '15px', height: '15px', borderTop: '2px solid #fff', borderLeft: '2px solid #fff' }}></div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <div style={{ width: '30px', height: '2px', background: '#DB0A40' }}></div>
                                            <span style={{ fontSize: '0.7rem', color: '#888', letterSpacing: '3px', fontWeight: '900' }}>CANDIDATE DOSSIER</span>
                                        </div>
                                        <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '-1px' }}>{currentApplicant.applicant_name}</h2>
                                        <div style={{ marginTop: '10px', background: 'rgba(219, 10, 64, 0.2)', color: '#DB0A40', display: 'inline-block', padding: '4px 12px', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', border: '1px solid #DB0A40' }}>
                                            PENDING EVALUATION
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', letterSpacing: '1px' }}>IDENTIFICATION</span>
                                    <span style={{ fontSize: '0.8rem', color: '#fff', fontFamily: 'monospace' }}>#{currentApplicant.id.toString().padStart(6, '0')}</span>
                                    <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', letterSpacing: '1px', marginTop: '10px' }}>SUBMISSION_DATE</span>
                                    <span style={{ fontSize: '0.8rem', color: '#fff' }}>{new Date(currentApplicant.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Card Body - Grid */}
                            <div style={{ padding: '3rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderLeft: '2px solid #DB0A40' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '8px' }}>
                                        <Zap size={14} />
                                        <span style={{ fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px' }}>POSITION</span>
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>{currentApplicant.position?.toUpperCase() || 'N/A'}</span>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderLeft: '2px solid #fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '8px' }}>
                                        <Hash size={14} />
                                        <span style={{ fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px' }}>AGE_RECORD</span>
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>{currentApplicant.age} YRS</span>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderLeft: '2px solid #DB0A40' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '8px' }}>
                                        <Ruler size={14} />
                                        <span style={{ fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px' }}>HEIGHT</span>
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fff' }}>{currentApplicant.height || 'N/A'}</span>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderLeft: '2px solid #fff' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '8px' }}>
                                        <Phone size={14} />
                                        <span style={{ fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px' }}>CONTACT</span>
                                    </div>
                                    <span style={{ fontSize: '1rem', fontWeight: '900', color: '#fff', letterSpacing: '1px' }}>{currentApplicant.phone}</span>
                                </div>
                            </div>

                            {/* Experience Section */}
                            <div style={{ padding: '0 3rem 2rem 3rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem', position: 'relative' }}>
                                    <h3 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', color: '#DB0A40', fontWeight: '900', letterSpacing: '2px' }}>CANDIDATE STATEMENT / EXPERIENCE</h3>
                                    <p style={{ margin: 0, color: '#aaa', lineHeight: '1.8', fontSize: '1.1rem', fontStyle: 'italic' }}>
                                        "{currentApplicant.experience || "No additional information provided."}"
                                    </p>
                                    <div style={{ position: 'absolute', bottom: '10px', right: '15px', color: 'rgba(255,255,255,0.05)', fontWeight: '900', fontSize: '2rem' }}>"</div>
                                </div>
                            </div>

                            {/* Footer Links */}
                            <div style={{ padding: '0 3rem 3rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '20px', color: '#666', fontSize: '0.8rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Mail size={14} color="#DB0A40" />
                                        <span>{currentApplicant.email}</span>
                                    </div>
                                </div>
                                {currentApplicant.file_url && (
                                    <a href={currentApplicant.file_url} target="_blank" rel="noreferrer" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        fontSize: '0.75rem',
                                        fontWeight: '900',
                                        letterSpacing: '1px',
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '10px 20px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <Activity size={14} color="#4cd137" /> VIEW HIGHLIGHT REEL
                                    </a>
                                )}
                            </div>

                            {/* Action Buttons Overlay */}
                            <div style={{ display: 'flex', height: '100px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <button
                                    onClick={() => handleAction(currentApplicant.id, 'rejected')}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        borderRight: '1px solid rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '15px',
                                        transition: 'all 0.3s'
                                    }}
                                    className="action-refuse-btn"
                                >
                                    <X size={24} color="#DB0A40" />
                                    <span style={{ fontSize: '1rem', fontWeight: '900', letterSpacing: '4px' }}>DENY ENTRY</span>
                                </button>
                                <button
                                    onClick={() => handleAction(currentApplicant.id, 'accepted')}
                                    style={{
                                        flex: 1,
                                        background: '#DB0A40',
                                        border: 'none',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '15px',
                                        transition: 'all 0.3s'
                                    }}
                                    className="action-confirm-btn"
                                >
                                    <Check size={24} />
                                    <span style={{ fontSize: '1rem', fontWeight: '900', letterSpacing: '4px' }}>CONFIRM ADMIT</span>
                                </button>
                            </div>
                        </div>
                    ) : showHistory ? (
                        /* History View */
                        <div className="intel-card animate-fade-in" style={{ width: '100%', padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px' }}>RECRUITMENT ARCHIVE</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => setHistoryType('accepted')}
                                        style={{ background: historyType === 'accepted' ? '#DB0A40' : 'transparent', border: '1px solid #DB0A40', color: '#fff', padding: '6px 15px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        ACCEPTED ({acceptedList.length})
                                    </button>
                                    <button
                                        onClick={() => setHistoryType('rejected')}
                                        style={{ background: historyType === 'rejected' ? '#DB0A40' : 'transparent', border: '1px solid #DB0A40', color: '#fff', padding: '6px 15px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        REJECTED ({rejectedList.length})
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {(historyType === 'accepted' ? acceptedList : rejectedList).map(app => (
                                    <div key={app.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{app.applicant_name}</div>
                                            <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '4px' }}>{app.position} • {app.age} YRS</div>
                                        </div>
                                        <button
                                            onClick={() => handleAction(app.id, 'pending')}
                                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontSize: '0.6rem', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold' }}
                                            onMouseOver={(e) => e.target.style.color = '#fff'}
                                            onMouseOut={(e) => e.target.style.color = '#888'}
                                        >
                                            RE-EVALUATE
                                        </button>
                                    </div>
                                ))}
                                {(historyType === 'accepted' ? acceptedList : rejectedList).length === 0 && (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#444', fontStyle: 'italic' }}>No archive records found.</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="intel-card animate-fade-in" style={{ padding: '5rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(0,0,0,0) 100%)' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.03)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px auto',
                                border: '1px dashed rgba(255,255,255,0.1)'
                            }}>
                                <Shield size={32} color="#4cd137" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>QUEUE CLEARED</h2>
                            <p style={{ color: '#666', marginBottom: '30px' }}>No new candidate applications currently require evaluation.</p>
                            <button
                                onClick={fetchApplicants}
                                className="intel-btn-primary"
                            >
                                <Activity size={18} style={{ marginRight: '8px' }} /> RE-SCAN SYSTEMS
                            </button>
                        </div>
                    )}

                    {/* Navigation Controls */}
                    {activeApplicants.length > 1 && !showHistory && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                            <button
                                disabled={currentIndex === 0}
                                onClick={() => setCurrentIndex(prev => prev - 1)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: currentIndex === 0 ? '#333' : '#fff',
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '2px' }}>
                                CANDIDATE <span style={{ color: '#fff' }}>{currentIndex + 1}</span> OF <span style={{ color: '#fff' }}>{activeApplicants.length}</span>
                            </span>
                            <button
                                disabled={currentIndex === activeApplicants.length - 1}
                                onClick={() => setCurrentIndex(prev => prev + 1)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: currentIndex === activeApplicants.length - 1 ? '#333' : '#fff',
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: currentIndex === activeApplicants.length - 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column / Sidebar Info when history is open */}
                {showHistory && (
                    <div className="side-intel-stack animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="intel-card" style={{ padding: '1.5rem', background: 'rgba(219, 10, 64, 0.05)', borderLeft: '3px solid #DB0A40' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#fff', fontWeight: '900' }}>RECRUITMENT LOGS</h4>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#aaa', lineHeight: '1.5' }}>
                                Archive records of all past evaluations. You can re-evaluate candidates to move them back to the active queue.
                            </p>
                        </div>

                        <div className="intel-card" style={{ padding: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '0.8rem', color: '#fff', fontWeight: '900' }}>SQUAD CAPACITY</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#666', marginBottom: '5px' }}>
                                        <span>ACTIVE SQUAD</span>
                                        <span>15/20</span>
                                    </div>
                                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', width: '100%' }}>
                                        <div style={{ height: '100%', background: '#DB0A40', width: '75%' }}></div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#888', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                    System suggests prioritizing defensive positions based on recent match analysis.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .swipe-right { transform: translateX(100px); opacity: 0; }
                .swipe-left { transform: translateX(-100px); opacity: 0; }
                .action-refuse-btn:hover { background: rgba(219, 10, 64, 0.1) !important; }
                .action-confirm-btn:hover { background: #b00833 !important; }
            `}</style>
        </div>
    );
};

export default NewMembers;
