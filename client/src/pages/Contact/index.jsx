import React from 'react';
import './css/contact.css';

const Contact = () => {
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

                    <form>
                        <input type="text" className="contact-input" placeholder="Your Name" />
                        <input type="email" className="contact-input" placeholder="Email Address" />
                        <input type="text" className="contact-input" placeholder="Subject" />
                        <textarea className="contact-input" placeholder="Message" rows="4" style={{ resize: 'none' }}></textarea>

                        <button type="submit" className="contact-submit">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
