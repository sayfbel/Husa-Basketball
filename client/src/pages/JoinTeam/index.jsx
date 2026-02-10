import React, { useState } from 'react';
import axios from 'axios';
import { useNotification } from '../../components/Notification/Notification';
import SelectorCard from '../../components/SelectorCard/SelectorCard';
import DateCard from '../../components/DateCard/DateCard';
import './css/joinTeam.css';

const JoinTeam = () => {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        height: '',
        experience: '',
        videoUrl: ''
    });

    const [position, setPosition] = useState(null);
    const [birthDate, setBirthDate] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const positionOptions = [
        'Point Guard (1)',
        'Shooting Guard (2)',
        'Small Forward (3)',
        'Power Forward (4)',
        'Center (5)'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.height || !position || !birthDate) {
            showNotification('Please fill in all required fields', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }

        const phoneRegex = /^\+?[\d\s-]{8,}$/;
        if (!phoneRegex.test(formData.phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return false;
        }

        // Prevent all zeros
        const cleanPhone = formData.phone.replace(/[\s\-\+]/g, '');
        if (/^0+$/.test(cleanPhone)) {
            showNotification('Phone number cannot be all zeros', 'error');
            return false;
        }

        if (isNaN(formData.height) || formData.height < 100 || formData.height > 250) {
            showNotification('Please enter a valid height (100-250cm)', 'error');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSubmitting(true);
            try {
                await axios.post('http://localhost:5000/api/tryouts', {
                    ...formData,
                    position,
                    birthDate
                });

                showNotification('Application submitted successfully!', 'success');

                // Reset form
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    height: '',
                    experience: '',
                    videoUrl: ''
                });
                setPosition(null);
                setBirthDate(null);

            } catch (error) {
                console.error(error);
                showNotification(error.response?.data?.message || 'Failed to submit application', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

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

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter first name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter last name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="+212 6..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ zIndex: 20 }}>
                                <DateCard
                                    label="Date of Birth *"
                                    value={birthDate}
                                    onChange={setBirthDate}
                                    placeholder="Select Date"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Height (cm) *</label>
                                <input
                                    type="number"
                                    name="height"
                                    value={formData.height}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="e.g. 195"
                                    min="100"
                                    max="250"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ zIndex: 10 }}>
                            <SelectorCard
                                label="Preferred Position *"
                                options={positionOptions}
                                value={position}
                                onChange={setPosition}
                                placeholder="Select Position"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Previous Club(s)</label>
                            <input
                                type="text"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="List your last clubs..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Video Highlights (URL)</label>
                            <input
                                type="url"
                                name="videoUrl"
                                value={formData.videoUrl}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="YouTube/Instagram link..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting}
                            style={{ opacity: isSubmitting ? 0.7 : 1 }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JoinTeam;
