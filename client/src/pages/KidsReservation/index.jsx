import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users } from 'lucide-react';
import { useNotification } from '../../components/Notification/Notification';
import './css/kidsReservation.css';

const KidsReservation = () => {
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        parentFullName: '',
        kidName: '',
        kidAge: '',
        kidSex: '',
        parentPhone: '',
        preferredDay: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const { parentFullName, kidName, kidAge, kidSex, parentPhone, preferredDay } = formData;
        if (!parentFullName || !kidName || !kidAge || !kidSex || !parentPhone || !preferredDay) {
            showNotification('Please fill in all required fields', 'error');
            return false;
        }

        const phoneRegex = /^(\+212|0)([ \-_/]*)(\d[ \-_/]*){9}$/;
        if (!phoneRegex.test(parentPhone)) {
            showNotification('Please enter a valid Moroccan phone number', 'error');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // Assuming there's a backend endpoint for kids reservation or reuse contact
            // For now, let's assume we use a specific one
            await axios.post('http://localhost:5000/api/reservations/kids', formData);
            showNotification('Reservation request sent successfully!', 'success');
            setFormData({
                parentFullName: '',
                kidName: '',
                kidAge: '',
                kidSex: '',
                parentPhone: '',
                preferredDay: ''
            });
        } catch (error) {
            console.error(error);
            showNotification(error.response?.data?.message || 'Failed to send reservation', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="reservation-page container animate-fade-in">
            <div className="reservation-layout">
                {/* Visual / Info Panel */}
                <div className="reservation-info-panel">
                    <div className="reservation-content">
                        <span className="reservation-super-title">Future Generation</span>
                        <h1 className="reservation-title">HUSA<br />KIDS ACADEMY</h1>

                        <div className="reservation-features">
                            <div className="feature-item">
                                <div className="feature-icon-wrapper">
                                    <Trophy size={28} strokeWidth={1.5} color="var(--primary-color)" />
                                </div>
                                <div className="feature-text">
                                    <h4>Professional Training</h4>
                                    <p>Guided by HUSA certified coaches.</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon-wrapper">
                                    <Users size={28} strokeWidth={1.5} color="var(--primary-color)" />
                                </div>
                                <div className="feature-text">
                                    <h4>Team Spirit</h4>
                                    <p>Building character through basketball.</p>
                                </div>
                            </div>
                        </div>

                        <div className="rules-teaser">
                            <p>Before registering, please review our school rules.</p>
                            <button
                                className="view-rules-btn"
                                onClick={() => navigate('/rules')}
                            >
                                View School Rules
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="reservation-form-panel">
                    <div className="form-intro">
                        <h3>Reserve a Spot</h3>
                        <p>Fill out the form below to register your child.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group-custom">
                            <input
                                type="text"
                                name="parentFullName"
                                value={formData.parentFullName}
                                onChange={handleChange}
                                className="reservation-input"
                                placeholder="Parent Full Name *"
                                required
                            />
                        </div>

                        <div className="form-row-custom">
                            <input
                                type="text"
                                name="kidName"
                                value={formData.kidName}
                                onChange={handleChange}
                                className="reservation-input"
                                placeholder="Kid's Full Name *"
                                required
                            />
                        </div>

                        <div className="form-row-custom half">
                            <input
                                type="number"
                                name="kidAge"
                                value={formData.kidAge}
                                onChange={handleChange}
                                className="reservation-input"
                                placeholder="Kid's Age *"
                                min="5"
                                max="18"
                                required
                            />
                            <select
                                name="kidSex"
                                value={formData.kidSex}
                                onChange={handleChange}
                                className="reservation-input"
                                required
                            >
                                <option value="" disabled>Sex *</option>
                                <option value="Male">Boy</option>
                                <option value="Female">Girl</option>
                            </select>
                        </div>

                        <div className="form-group-custom">
                            <input
                                type="tel"
                                name="parentPhone"
                                value={formData.parentPhone}
                                onChange={handleChange}
                                className="reservation-input"
                                placeholder="Parent Phone Number (06...) *"
                                required
                            />
                        </div>

                        <div className="form-group-custom">
                            <select
                                name="preferredDay"
                                value={formData.preferredDay}
                                onChange={handleChange}
                                className="reservation-input"
                                required
                            >
                                <option value="" disabled>Preferred Training Day *</option>
                                <option value="Wednesday">Wednesday Afternoon</option>
                                <option value="Saturday">Saturday Morning</option>
                                <option value="Sunday">Sunday Morning</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="reservation-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Register Now'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default KidsReservation;
