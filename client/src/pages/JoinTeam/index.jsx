import React, { useState } from 'react';
import SelectorCard from '../../components/SelectorCard/SelectorCard';
import DateCard from '../../components/DateCard/DateCard';
import './css/joinTeam.css';

const JoinTeam = () => {
    const [position, setPosition] = useState(null);
    const [birthDate, setBirthDate] = useState(null);

    const positionOptions = [
        'Point Guard (1)',
        'Shooting Guard (2)',
        'Small Forward (3)',
        'Power Forward (4)',
        'Center (5)'
    ];
    return (
        <div className="join-page container animate-fade-in">
            <div className="join-hero">
                <span className="join-subtitle">Career</span>
                <h1 className="join-title">Become<br />A Legend</h1>
            </div>

            <div className="join-content-grid">
                {/* Left: Requirements */}
                <div className="requirements-card">
                    <div className="req-header">
                        <span className="material-icons-outlined req-icon">assignment_late</span>
                        <span className="req-title">Core Requirements</span>
                    </div>
                    <ul className="req-list">
                        <li className="req-item">
                            <span className="check-icon">✓</span>
                            <span>Age between 16 and 24 years old</span>
                        </li>
                        <li className="req-item">
                            <span className="check-icon">✓</span>
                            <span>Previous club experience (Minimum 2 years)</span>
                        </li>
                        <li className="req-item">
                            <span className="check-icon">✓</span>
                            <span>Clean medical record & physical clearance</span>
                        </li>
                        <li className="req-item">
                            <span className="check-icon">✓</span>
                            <span>Residency in Agadir or Souss-Massa region</span>
                        </li>
                        <li className="req-item">
                            <span className="check-icon">✓</span>
                            <span>Commitment to 4 training sessions per week</span>
                        </li>
                    </ul>
                </div>

                {/* Right: Form */}
                <div className="tryout-form-wrapper">
                    <div className="form-header">
                        <h2>Tryout Application</h2>
                        <p>Fill out the details below to request a trial session with our scouts.</p>
                    </div>

                    <form>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input type="text" className="form-input" placeholder="Enter first name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input type="text" className="form-input" placeholder="Enter last name" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ zIndex: 20 }}>
                                <DateCard
                                    label="Date of Birth"
                                    value={birthDate}
                                    onChange={setBirthDate}
                                    placeholder="Select Date"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Height (cm)</label>
                                <input type="number" className="form-input" placeholder="e.g. 195" />
                            </div>
                        </div>

                        <div className="form-group" style={{ zIndex: 10 }}>
                            <SelectorCard
                                label="Preferred Position"
                                options={positionOptions}
                                value={position}
                                onChange={setPosition}
                                placeholder="Select Position"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Previous Club(s)</label>
                            <input type="text" className="form-input" placeholder="List your last clubs..." />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Video Highlights (URL)</label>
                            <input type="url" className="form-input" placeholder="YouTube/Instagram link..." />
                        </div>

                        <button type="submit" className="submit-btn">Submit Application</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JoinTeam;
