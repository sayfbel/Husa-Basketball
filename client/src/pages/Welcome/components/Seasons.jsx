import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../css/seasons.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Seasons = () => {
    // Chart Data
    const chartData = {
        labels: ['2022-2023', '2023-2024', '2024-2025'],
        datasets: [
            {
                label: 'Points Scored per Season',
                data: [630, 650, 905],
                borderColor: '#E31837',
                backgroundColor: 'rgba(227, 24, 55, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#E31837',
                pointRadius: 6,
                pointHoverRadius: 8
            },
            {
                label: 'Wins per Season',
                data: [9, 10, 11],
                borderColor: '#FFD700', // Gold
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                tension: 0.4,
                yAxisID: 'y1',
                borderDash: [5, 5],
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#fff',
                    font: {
                        family: 'Poppins'
                    }
                }
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#888'
                }
            },
            y1: {
                position: 'right',
                grid: {
                    display: false
                },
                ticks: {
                    color: '#FFD700'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#fff'
                }
            }
        }
    };

    return (
        <section className="seasons-section">
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '3rem', color: 'white', marginBottom: '1rem', textTransform: 'uppercase' }}>Season History</h2>
                    <p style={{ color: '#888' }}>Tracking our journey to the top of Moroccan basketball.</p>
                </div>

                <div className="seasons-container">
                    {/* 2024-2025 Card */}
                    <div className="season-card">
                        <div className="season-header">
                            <span className="season-year">2024-2025</span>
                            <span className="season-badge" style={{ background: 'rgba(227, 24, 55, 0.2)', color: '#E31837' }}>Current Season</span>
                        </div>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <h4>League Rank</h4>
                                <div className="stat-value">1st</div>
                                <div className="stat-trend trend-up">
                                    <span className="material-icons-outlined" style={{ fontSize: '14px' }}>arrow_upward</span> Group 4
                                </div>
                            </div>
                            <div className="stat-item">
                                <h4>Record</h4>
                                <div className="stat-value">11-3</div>
                                <div className="stat-trend trend-up">25 Pts</div>
                            </div>
                            <div className="stat-item">
                                <h4>Points Scored</h4>
                                <div className="stat-value">905</div>
                                <div className="stat-trend trend-up">+109 Diff</div>
                            </div>
                            <div className="stat-item">
                                <h4>Points Per Game</h4>
                                <div className="stat-value">64.6</div>
                                <div className="stat-trend">High Offense</div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="chart-wrapper">
                        <div className="chart-header">
                            <h3>Performance Trajectory</h3>
                            <p>Consistent growth in scoring efficiency and win percentage over the last 3 years.</p>
                        </div>
                        <div style={{ height: '400px' }}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Previous Seasons Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2rem', gridArea: '2 / 1 / 4 / 3' }}>
                        <div className="season-card">
                            <div className="season-header">
                                <span className="season-year" style={{ fontSize: '2rem' }}>2023-2024</span>
                            </div>
                            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="stat-item">
                                    <h4>Rank</h4>
                                    <div className="stat-value">1st</div>
                                    <div className="stat-trend">Group 5</div>
                                </div>
                                <div className="stat-item">
                                    <h4>Record</h4>
                                    <div className="stat-value">10-0</div>
                                    <div className="stat-trend trend-up">Undefeated</div>
                                </div>
                            </div>
                        </div>

                        <div className="season-card">
                            <div className="season-header">
                                <span className="season-year" style={{ fontSize: '2rem' }}>2022-2023</span>
                            </div>
                            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="stat-item">
                                    <h4>Rank</h4>
                                    <div className="stat-value">1st</div>
                                    <div className="stat-trend">Group 11</div>
                                </div>
                                <div className="stat-item">
                                    <h4>Record</h4>
                                    <div className="stat-value">9-3</div>
                                    <div className="stat-trend">21 Pts</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section >
    );
};

export default Seasons;
