import React, { useState } from 'react';
import axios from 'axios';
import { useNotification } from '../../components/Notification/Notification';
import './css/contact.css';

const Contact = () => {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.message) {
            showNotification('Please fill in all required fields', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/contact', formData);
            showNotification('Message sent successfully!', 'success');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            console.error(error);
            showNotification(error.response?.data?.message || 'Failed to send message', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page container animate-fade-in">
            <div className="contact-layout">
                {/* Visual / Info Panel */}
                <div className="contact-info-panel">
                    <div className="contact-header">
                        <span className="contact-super-title">Get in Touch</span>
                        <h1 className="contact-title">Let's<br />Talk</h1>

                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Headquarters</span>
                                <span className="info-value">Salle Al Inbiâat, Agadir<br />Morocco</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Email</span>
                                <span className="info-value">contact@husabasket.ma</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Phone</span>
                                <span className="info-value">+212 528 22 44 66</span>
                            </div>
                        </div>

                        <div className="social-connect">
                            <span className="info-label" style={{ marginBottom: '1rem', display: 'block' }}>Connect</span>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {/* Social icons can go here */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Light Form Panel */}
                <div className="contact-form-panel">
                    <div className="form-intro">
                        <h3>Send a Message</h3>
                        <p>Have a question or proposal? We'd love to hear from you.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="contact-input"
                            placeholder="Your Name *"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="contact-input"
                            placeholder="Email Address *"
                            required
                        />
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="contact-input"
                            placeholder="Subject"
                        />
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            className="contact-input"
                            placeholder="Message *"
                            rows="4"
                            style={{ resize: 'none' }}
                            required
                        ></textarea>

                        <button
                            type="submit"
                            className="contact-submit"
                            disabled={isSubmitting}
                            style={{ opacity: isSubmitting ? 0.7 : 1 }}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
