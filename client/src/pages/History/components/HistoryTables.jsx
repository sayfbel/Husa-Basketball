import React, { useState, useEffect } from 'react';

const HistoryTables = () => {
    const [dynamicRankings, setDynamicRankings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/rankings');
                if (response.ok) {
                    const data = await response.json();
                    setDynamicRankings(data);
                }
            } catch (error) {
                console.error('Failed to fetch rankings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, []);

    const seasons = {
        '2025-2026': {
            title: '1DNH (Division 1 Nationale) - Groupe 3',
            standings: {
                headers: ['Pos', 'Club', 'PTS', 'P', 'W', 'L', 'PF', 'PA', 'Diff'],
                rows: dynamicRankings || []
            },
            notes: dynamicRankings ? "Live Data from FRMBB" : "Offline / Historical Data"
        },
        '2024-2025': {
            title: '1DNH (Division 1 Nationale) - Groupe 4',
            standings: {
                headers: ['Pos', 'Club', 'PTS', 'P', 'W', 'L', 'PF', 'PA', 'Diff'],
                rows: [
                    { pos: 1, club: 'HUSA', pts: 25, p: 14, w: 11, l: 3, pf: 905, pa: 796, diff: 109 },
                    { pos: 2, club: 'AJBGB', pts: 23, p: 14, w: 9, l: 5, pf: 833, pa: 817, diff: 16 },
                    { pos: 3, club: 'OCK', pts: 21, p: 14, w: 7, l: 7, pf: 888, pa: 872, diff: 16 },
                    { pos: 4, club: 'ACSMM', pts: 21, p: 14, w: 7, l: 7, pf: 867, pa: 867, diff: 0 },
                    { pos: 5, club: 'OCY', pts: 20, p: 14, w: 6, l: 8, pf: 851, pa: 890, diff: -39 },
                    { pos: 6, club: 'AABB', pts: 20, p: 14, w: 6, l: 8, pf: 799, pa: 805, diff: -6 },
                    { pos: 7, club: 'RCOZ', pts: 19, p: 14, w: 5, l: 9, pf: 795, pa: 830, diff: -35 },
                    { pos: 8, club: 'CSBA', pts: 19, p: 14, w: 5, l: 9, pf: 797, pa: 858, diff: -61 },
                ]
            },
            playoffs: [
                {
                    stage: 'Regular Season Key Matches',
                    matches: [
                        { date: '27/10/2024', home: 'HUSA', away: 'CSBA', score: '64 - 41', result: 'W' },
                        { date: '02/11/2024', home: 'HUSA', away: 'ACSMM', score: '61 - 52', result: 'W' },
                    ]
                }
            ],
            notes: "Leading Group 4 with 11 Victories"
        },
        '2023-2024': {
            title: '2DNH (Division 2) - Groupe 5',
            standings: {
                headers: ['Pos', 'Club', 'PTS', 'P', 'W', 'L', 'PF', 'PA', 'Diff'],
                rows: [
                    { pos: 1, club: 'HUSA', pts: 20, p: 10, w: 10, l: 0, pf: 650, pa: 366, diff: 284 },
                    { pos: 2, club: 'ASGBB', pts: 17, p: 10, w: 7, l: 3, pf: 666, pa: 551, diff: 115 },
                    { pos: 3, club: 'IBA', pts: 16, p: 10, w: 6, l: 4, pf: 529, pa: 471, diff: 58 },
                    { pos: 4, club: 'CSOO', pts: 15, p: 10, w: 5, l: 5, pf: 535, pa: 525, diff: 10 },
                    { pos: 5, club: 'ASBS', pts: 12, p: 10, w: 2, l: 8, pf: 477, pa: 609, diff: -132 },
                    { pos: 6, club: 'MES', pts: 9, p: 10, w: 0, l: 10, pf: 343, pa: 678, diff: -335 },
                ]
            },
            playoffs: [
                {
                    stage: 'Play Off - Journée 1 & 2 & 3',
                    matches: [
                        { date: '26/05/2024', home: 'WSC', away: 'HUSA', score: '46 - 73', result: 'W' },
                        { date: '01/06/2024', home: 'RCOZ', away: 'HUSA', score: '49 - 45', result: 'L' },
                    ]
                }
            ]
        },
        '2022-2023': {
            title: '3DNH (Division 3) - Groupe 11',
            standings: {
                headers: ['Pos', 'Club', 'PTS', 'P', 'W', 'L', 'PF', 'PA', 'Diff'],
                rows: [
                    { pos: 1, club: 'HUSA', pts: 21, p: 12, w: 9, l: 3, pf: 630, pa: 491, diff: 139 },
                    { pos: 2, club: 'ASTT', pts: 21, p: 12, w: 9, l: 3, pf: 672, pa: 574, diff: 98 },
                    { pos: 3, club: 'ASHA', pts: 20, p: 12, w: 8, l: 4, pf: 484, pa: 383, diff: 101 },
                    { pos: 4, club: 'ASCT', pts: 17, p: 11, w: 6, l: 5, pf: 551, pa: 522, diff: 29 },
                    { pos: 5, club: 'AGSB', pts: 16, p: 12, w: 4, l: 8, pf: 496, pa: 637, diff: -141 },
                    { pos: 6, club: 'ASCHBB2', pts: 13, p: 10, w: 3, l: 7, pf: 486, pa: 468, diff: 18 },
                    { pos: 7, club: 'ACRHBB', pts: 12, p: 11, w: 1, l: 10, pf: 327, pa: 571, diff: -244 },
                ]
            },
            playoffs: [
                {
                    stage: 'Phase Finale - 1/8 & 1/4 Finale',
                    matches: [
                        { date: '21/05/2023', home: 'ASMM', away: 'HUSA', score: '72 - 64', result: 'L' },
                        { date: '04/06/2023', home: 'HUSA', away: 'ASMM', score: '46 - 35', result: 'W' },
                        { date: '10/06/2023', home: 'ASTT', away: 'HUSA', score: '61 - 67', result: 'W' },
                        { date: '17/06/2023', home: 'HUSA', away: 'ASTT', score: '66 - 49', result: 'W' },
                        { date: '08/07/2023', home: 'EJSC', away: 'HUSA', score: '47 - 54', result: 'W' },
                        { date: '09/07/2023', home: 'ABS', away: 'HUSA', score: '59 - 55', result: 'L' },
                    ]
                }
            ]
        }
    };

    return (
        <div className="history-tables-section">
            {loading && !dynamicRankings && (
                <div className="loading-spinner">Fetching live standings...</div>
            )}

            {Object.keys(seasons).reverse().map(season => {
                const seasonData = seasons[season];
                return (
                    <div key={season} className="history-content-card animate-fade-in" style={{ marginBottom: '4rem' }}>
                        <div className="history-header">
                            <div className="season-title-group">
                                <h2 className="season-year-display">{season}</h2>
                                <h3 className="season-league-title">{seasonData.title}</h3>
                            </div>
                            {seasonData.notes && <span className="season-note">{seasonData.notes}</span>}
                        </div>

                        <div className="table-wrapper">
                            <h4>Regular Season Standings</h4>
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        {seasonData.standings.headers.map((h, i) => <th key={i}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {seasonData.standings.rows.map((row, i) => (
                                        <tr key={i} className={row.club.includes('HUSA') ? 'husa-row' : ''}>
                                            <td>{row.pos}</td>
                                            <td>{row.club}</td>
                                            <td>{row.pts}</td>
                                            <td>{row.p}</td>
                                            <td>{row.w}</td>
                                            <td>{row.l}</td>
                                            <td>{row.pf}</td>
                                            <td>{row.pa}</td>
                                            <td>{row.diff}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Playoffs / Matches */}
                        {seasonData.playoffs && (
                            <div className="playoffs-section">
                                <h4>Season Match Highlights</h4>
                                <div className="matches-grid">
                                    {seasonData.playoffs.map((stage, i) => (
                                        <div key={i} className="stage-group">
                                            <h5 className="stage-title">{stage.stage}</h5>
                                            {stage.matches.map((match, j) => (
                                                <div key={j} className={`match-row ${match.result === 'W' ? 'win' : match.result === 'L' ? 'loss' : ''}`}>
                                                    <div className="match-date">{match.date}</div>
                                                    <div className="match-teams">
                                                        <span className={match.home === 'HUSA' ? 'team-husa' : ''}>{match.home}</span>
                                                        <span className="vs">vs</span>
                                                        <span className={match.away === 'HUSA' ? 'team-husa' : ''}>{match.away}</span>
                                                    </div>
                                                    <div className="match-score">{match.score}</div>
                                                    <div className="match-result">{match.result}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default HistoryTables;
