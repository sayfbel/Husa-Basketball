import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FileText,
    Shield,
    Activity,
    CheckCircle,
    AlertCircle,
    Download,
    FileDown,
    ChevronLeft,
    Clock,
    MapPin,
    Trophy
} from 'lucide-react';
import '../../../css/dashboard.css';

const MatchSheetPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.state?.matchData) {
            setData(location.state.matchData);
            setLoading(false);
        } else {
            // If no data, redirect back
            // navigate('/dashboard/coach/match');
            // For development, let's use some mock data if empty
            const mockData = {
                matchInfo: {
                    competition: "DIVISION EXCELLENCE",
                    category: "SENIOR MASCULIN",
                    date: "23/02/2026",
                    venue: "SALLE OLYMPIC, AGADIR",
                    teamA: "HUSA AGADIR",
                    teamB: "FUS RABAT",
                    referees: "A. BENANI, M. TAZI",
                    sheetNumber: "FRMBB-2026-042"
                },
                teamA: {
                    name: "HUSA AGADIR",
                    players: [
                        { license: "123456", name: "CHOUA M'BAREK", number: "4", fouls: 2, inGame: true },
                        { license: "123457", name: "ABDERRAHIM", number: "5", fouls: 5, inGame: true },
                        { license: "123458", name: "EL GHAZI", number: "7", fouls: 1, inGame: true },
                        { license: "123459", name: "ZOUITA", number: "10", fouls: 3, inGame: true },
                        { license: "123460", name: "BENAICHA", number: "12", fouls: 4, inGame: true },
                        { license: "123461", name: "SAOUD", number: "15", fouls: 0, inGame: false }
                    ],
                    coach: "M. BENKHADRA",
                    assistantCoach: "S. LAMRANI",
                    totalPoints: 82
                },
                teamB: {
                    name: "FUS RABAT",
                    players: [
                        { license: "223456", name: "JAHAD", number: "6", fouls: 3, inGame: true },
                        { license: "223457", name: "KHALFI", number: "8", fouls: 2, inGame: true },
                        { license: "223458", name: "NAJAH", number: "9", fouls: 4, inGame: true },
                        { license: "223459", name: "WILKINS", number: "13", fouls: 1, inGame: true },
                        { license: "223460", name: "EL MAKRINI", number: "14", fouls: 5, inGame: true },
                        { license: "223461", name: "HARRAS", number: "11", fouls: 2, inGame: false }
                    ],
                    coach: "S. EL KASMI",
                    assistantCoach: "N. BELAIDI",
                    totalPoints: 78
                },
                quarters: [
                    { q: "Q1", a: 22, b: 18 },
                    { q: "Q2", a: 20, b: 22 },
                    { q: "Q3", a: 18, b: 15 },
                    { q: "Q4", a: 22, b: 23 }
                ],
                finalResult: {
                    teamA: 82,
                    teamB: 78,
                    winner: "HUSA AGADIR"
                },
                validation: {
                    isValid: true,
                    errors: []
                },
                confidenceScore: 92
            };
            setData(mockData);
            setLoading(false);
        }
    }, [location, navigate]);

    const exportToJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `match_sheet_${data.matchInfo.sheetNumber}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    if (loading) return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loader"></div>
        </div>
    );

    return (
        <div className="match-sheet-container" style={{
            padding: '2rem',
            background: '#050505',
            minHeight: '100vh',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Navigation & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <button
                        onClick={() => navigate('/dashboard/coach/match')}
                        style={{ background: 'transparent', border: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        <ChevronLeft size={20} /> BACK TO COMMAND
                    </button>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={exportToJSON} className="intel-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem' }}>
                            <FileDown size={16} /> DOWNLOAD JSON
                        </button>
                        <button className="intel-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem' }}>
                            <Download size={16} /> EXPORT PDF
                        </button>
                    </div>
                </div>

                {/* Header Section */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '3rem',
                    padding: '2rem',
                    background: 'linear-gradient(90deg, rgba(219, 10, 64, 0.1) 0%, transparent 100%)',
                    borderLeft: '4px solid #DB0A40'
                }}>
                    <div style={{ background: '#DB0A40', padding: '15px', borderRadius: '0' }}>
                        <FileText size={32} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#DB0A40', letterSpacing: '3px' }}>FRMBB MISSION REPORT</span>
                                <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-1px', textTransform: 'uppercase' }}>
                                    {data.matchInfo.teamA} <span style={{ color: '#444' }}>VS</span> {data.matchInfo.teamB}
                                </h1>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    background: data.validation.isValid ? 'rgba(12, 184, 96, 0.1)' : 'rgba(219, 10, 64, 0.1)',
                                    border: `1px solid ${data.validation.isValid ? '#0CB860' : '#DB0A40'}`,
                                    padding: '8px 15px',
                                    borderRadius: '0',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {data.validation.isValid ? <CheckCircle size={16} color="#0CB860" /> : <AlertCircle size={16} color="#DB0A40" />}
                                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: data.validation.isValid ? '#0CB860' : '#DB0A40', letterSpacing: '1px' }}>
                                        {data.validation.isValid ? 'VALIDATED_BATTLE_DATA' : 'VALIDATION_ERROR'}
                                    </span>
                                </div>
                                <div style={{ marginTop: '10px', fontSize: '0.6rem', color: '#666', fontWeight: '900', letterSpacing: '1px' }}>
                                    CONFIDENCE_SCORE: <span style={{ color: '#fff' }}>{data.confidenceScore}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="intel-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: '900', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>COMPETITION</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Trophy size={16} color="#DB0A40" />
                            <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{data.matchInfo.competition}</span>
                        </div>
                    </div>
                    <div className="intel-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: '900', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>DATE / TIME</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Clock size={16} color="#DB0A40" />
                            <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{data.matchInfo.date}</span>
                        </div>
                    </div>
                    <div className="intel-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: '900', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>VENUE</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <MapPin size={16} color="#DB0A40" />
                            <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{data.matchInfo.venue}</span>
                        </div>
                    </div>
                    <div className="intel-card" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: '900', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>SHEET_ID</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={16} color="#DB0A40" />
                            <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{data.matchInfo.sheetNumber}</span>
                        </div>
                    </div>
                </div>

                {/* Tables Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                    {/* Team A */}
                    <div className="intel-card" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(219, 10, 64, 0.05)' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', letterSpacing: '1px' }}>{data.teamA.name}</h3>
                            <span style={{ background: '#DB0A40', color: '#fff', padding: '4px 10px', fontSize: '0.8rem', fontWeight: '900' }}>{data.teamA.totalPoints} PTS</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', background: 'rgba(255,255,255,0.01)' }}>
                                    <th style={{ padding: '1rem', color: '#666', fontWeight: '900', fontSize: '0.65rem' }}>#</th>
                                    <th style={{ padding: '1rem', color: '#666', fontWeight: '900', fontSize: '0.65rem' }}>PLAYER</th>
                                    <th style={{ padding: '1rem', color: '#666', fontWeight: '900', fontSize: '0.65rem' }}>LICENSE</th>
                                    <th style={{ padding: '1rem', color: '#666', fontWeight: '900', fontSize: '0.65rem' }}>FOULS</th>
                                    <th style={{ padding: '1rem', color: '#666', fontWeight: '900', fontSize: '0.65rem' }}>GP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.teamA.players.map((p, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: '#DB0A40' }}>{p.number}</td>
                                        <td style={{ padding: '1rem', fontWeight: '700' }}>{p.name}</td>
                                        <td style={{ padding: '1rem', color: '#555', fontFamily: 'monospace' }}>{p.license}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '3px' }}>
                                                {[1, 2, 3, 4, 5].map(f => (
                                                    <div key={f} style={{ width: '10px', height: '10px', border: '1px solid #333', background: f <= p.fouls ? (f === 5 ? '#DB0A40' : '#fff') : 'transparent' }}></div>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{p.inGame ? <CheckCircle size={14} color="#0CB860" /> : <i style={{ color: '#444' }}>-</i>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', fontSize: '0.7rem', color: '#666', display: 'flex', gap: '20px' }}>
                            <div>COACH: <span style={{ color: '#fff', fontWeight: 'bold' }}>{data.teamA.coach}</span></div>
                            <div>ASST: <span style={{ color: '#fff', fontWeight: 'bold' }}>{data.teamA.assistantCoach}</span></div>
                        </div>
                    </div>

                    {/* Team B */}
                    <div className="intel-card" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', letterSpacing: '1px' }}>{data.teamB.name}</h3>
                            <span style={{ background: '#fff', color: '#000', padding: '4px 10px', fontSize: '0.8rem', fontWeight: '900' }}>{data.teamB.totalPoints} PTS</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', background: 'rgba(255,255,255,0.01)' }}>
                                    <th style={{ padding: '1rem', color: '#666', fontWeight: '900', fontSize: '0.65rem' }}>#</th>
                                    <th style={{ padding: '1rem', color: '#666', fontWeight: '900', fontSize: '0.65rem' }}>PLAYER</th>
                                    <th style={{ padding: '1rem', color: '#666', fontWeight: '900', fontSize: '0.65rem' }}>LICENSE</th>
                                    <th style={{ padding: '1rem', color: '#666', fontWeight: '900', fontSize: '0.65rem' }}>FOULS</th>
                                    <th style={{ padding: '1rem', color: '#666', fontWeight: '900', fontSize: '0.65rem' }}>GP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.teamB.players.map((p, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '800' }}>{p.number}</td>
                                        <td style={{ padding: '1rem', fontWeight: '700' }}>{p.name}</td>
                                        <td style={{ padding: '1rem', color: '#555', fontFamily: 'monospace' }}>{p.license}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '3px' }}>
                                                {[1, 2, 3, 4, 5].map(f => (
                                                    <div key={f} style={{ width: '10px', height: '10px', border: '1px solid #333', background: f <= p.fouls ? (f === 5 ? '#DB0A40' : '#fff') : 'transparent' }}></div>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{p.inGame ? <CheckCircle size={14} color="#0CB860" /> : <i style={{ color: '#444' }}>-</i>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', fontSize: '0.7rem', color: '#666', display: 'flex', gap: '20px' }}>
                            <div>COACH: <span style={{ color: '#fff', fontWeight: 'bold' }}>{data.teamB.coach}</span></div>
                            <div>ASST: <span style={{ color: '#fff', fontWeight: 'bold' }}>{data.teamB.assistantCoach}</span></div>
                        </div>
                    </div>
                </div>

                {/* Score Summary Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                    {/* Quarter Table */}
                    <div className="intel-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
                            <Activity size={20} color="#DB0A40" />
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', letterSpacing: '2px' }}>QUARTER_PERFORMANCE</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            {data.quarters.map((q, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: '900', letterSpacing: '2px', marginBottom: '10px' }}>{q.q}</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '950', letterSpacing: '-1px' }}>
                                        <span style={{ color: '#DB0A40' }}>{q.a}</span> : <span>{q.b}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final Card */}
                    <div className="intel-card" style={{
                        padding: '2rem',
                        border: '1px solid #DB0A40',
                        background: 'linear-gradient(135deg, rgba(219, 10, 64, 0.2) 0%, transparent 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}>
                        <Shield size={32} color="#DB0A40" style={{ marginBottom: '1rem' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#DB0A40', letterSpacing: '4px' }}>VERIFIED FINAL BATTLE RESULT</span>
                        <div style={{ fontSize: '4rem', fontWeight: '950', letterSpacing: '-4px', margin: '0.5rem 0' }}>
                            {data.finalResult.teamA} <span style={{ color: '#444' }}>:</span> {data.finalResult.teamB}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            WINNER: <span style={{ color: '#DB0A40' }}>{data.finalResult.winner}</span>
                        </div>
                    </div>
                </div>

                {/* Validation Errors if any */}
                {!data.validation.isValid && (
                    <div style={{ marginTop: '2rem', background: 'rgba(219, 10, 64, 0.1)', border: '1px solid #DB0A40', padding: '1.5rem' }}>
                        <div style={{ color: '#DB0A40', fontWeight: '900', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '10px' }}>VALIDATION_ISSUES_DETECTED</div>
                        {data.validation.errors.map((err, i) => (
                            <div key={i} style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '5px' }}>• {err}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchSheetPage;
