import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Clock, ArrowRight, Shield, Book, AlertCircle, TrendingUp } from 'lucide-react';
import { useNotification } from '../../components/Notification/Notification';
import '../Rules/css/rules.css';
import './css/kidsReservation.css';

const KidsReservation = () => {
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    
    // Static Data
    const settings = {
        about_text: 'Welcome to HUSA Kids Academy! We are dedicated to providing the best basketball training for the next generation of champions. Our state-of-the-art facilities and experienced coaching staff ensure your child develops both athletic skills and sportsmanship.',
        timetable: 'Monday & Wednesday: 17:00 - 19:00\nSaturday: 09:00 - 12:00',
        image_url_1: ''
    };

    const offers = [
        {
            id: 1,
            title: 'Monthly Pass',
            description: 'Perfect for beginners to try out our academy.',
            price: '400 MAD / month',
            features: '2 Sessions per week, Access to basic facilities, Free Academy T-shirt'
        },
        {
            id: 2,
            title: 'Quarterly Elite',
            description: 'Intensive training for dedicated players.',
            price: '1000 MAD / 3 months',
            features: '3 Sessions per week, Access to all facilities, Personalized coaching plan'
        },
        {
            id: 3,
            title: 'Annual Champion',
            description: 'The ultimate package for aspiring pros.',
            price: '3500 MAD / year',
            features: 'Unlimited sessions, Full kit included, Priority tournament selection, Sports nutrition plan'
        }
    ];

    const [shuffledRules, setShuffledRules] = useState([]);

    const rules = [
        {
            id: 1,
            title: "Discipline & Respect",
            description: "Respect your coaches, teammates, and staff at all times. Discipline is the foundation of excellence.",
            icon: <Shield size={32} />
        },
        {
            id: 2,
            title: "Punctuality",
            description: "Arrive at least 15 minutes before practice. Late arrivals disrupt the flow of the team.",
            icon: <Clock size={32} />
        },
        {
            id: 3,
            title: "Equipment",
            description: "Players must wear the official HUSA basketball kit. Bring your own water bottle and ensure your shoes are clean.",
            icon: <Book size={32} />
        },
        {
            id: 4,
            title: "Safety",
            description: "No jewelry, watches, or sharp objects allowed during practice. Safety is our priority.",
            icon: <AlertCircle size={32} />
        },
        {
            id: 5,
            title: "Growth Mindset",
            description: "Be ready to learn and give 100% effort in every drill. Mistakes are opportunities to grow.",
            icon: <TrendingUp size={32} />
        },
        {
            id: 6,
            title: "Teamwork",
            description: "Basketball is a team sport. Support your teammates and maintain a positive attitude.",
            icon: <Users size={32} />
        }
    ];

    useEffect(() => {
        const shuffled = [...rules].sort(() => Math.random() - 0.5);
        setShuffledRules(shuffled);
    }, []);
    
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
        <div className="reservation-page container animate-fade-in" style={{ padding: '0 2rem' }}>
            
            {/* 1. Academy Info Section (Top) */}
            <div className="reservation-info-panel" style={{ borderRadius: '40px', marginBottom: '6rem' }}>
                <div className="reservation-content">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <span className="reservation-super-title">Future Generation</span>
                        <h1 className="reservation-title">HUSA<br />KIDS ACADEMY</h1>
                        
                        {settings?.about_text && (
                            <p className="academy-about-text" style={{ color: '#eee', lineHeight: '1.6', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
                                {settings.about_text}
                            </p>
                        )}

                        {settings?.image_url_1 && (
                            <div className="academy-hero-image" style={{ width: '100%', height: '400px', borderRadius: '24px', overflow: 'hidden', marginBottom: '4rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                                <img src={settings.image_url_1} alt="Academy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>

                    <div className="academy-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                        <div className="info-block" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 1.5rem 0', color: 'var(--primary-color)' }}>
                                <Trophy size={24} /> Features
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'white' }}>Professional Training</h4>
                                    <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Guided by HUSA certified coaches.</p>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'white' }}>Team Spirit</h4>
                                    <p style={{ color: '#aaa', fontSize: '0.95rem' }}>Building character through basketball.</p>
                                </div>
                            </div>
                        </div>

                        {settings?.timetable && (
                            <div className="info-block" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 1.5rem 0', color: 'var(--primary-color)' }}>
                                    <Calendar size={24} /> Timetable
                                </h3>
                                <div style={{ whiteSpace: 'pre-wrap', color: '#ccc', lineHeight: '1.8' }}>
                                    {settings.timetable}
                                </div>
                            </div>
                        )}
                    </div>

                    {offers.length > 0 && (
                        <div className="academy-offers-section">
                            <h3 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: 'white' }}>Budgets & Offers</h3>
                            <div className="offers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                {offers.map(offer => (
                                    <div key={offer.id} className="academy-offer-card" style={{ background: 'linear-gradient(145deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '24px', transition: 'transform 0.3s' }}>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: 'white' }}>{offer.title}</h4>
                                        <div style={{ color: 'var(--primary-color)', fontSize: '2rem', fontWeight: '900', marginBottom: '15px' }}>{offer.price}</div>
                                        <p style={{ margin: '0 0 20px 0', color: '#aaa', fontSize: '1rem', lineHeight: '1.6' }}>{offer.description}</p>
                                        {offer.features && (
                                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc', fontSize: '0.95rem', lineHeight: '1.8' }}>
                                                {offer.features.split(',').map((feat, i) => <li key={i}>{feat.trim()}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Rules Section (Bento Box Style) */}
            <div className="rules-bento-section" style={{ marginBottom: '6rem' }}>
                <div className="rules-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span className="rules-super-title">School Standards</span>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1rem', textTransform: 'uppercase', color: 'white' }}>The HUSA<br />Code of Conduct</h2>
                    <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Our basketball school is where future champions are built. Following these rules ensures a safe and productive environment for everyone.
                    </p>
                </div>

                <div className="bento-grid">
                    {shuffledRules.map((rule, index) => {
                        let cardClass = "bento-card";
                        if (index === 0) cardClass += " bento-wide bento-dark";
                        else if (index === 3) cardClass += " bento-wide bento-primary";
                        else if (index === 1 || index === 2) cardClass += " bento-tall";
                        else cardClass += " bento-standard";

                        return (
                            <div className={cardClass} key={rule.id}>
                                <div className="bento-icon">{rule.icon}</div>
                                <h3>{rule.title}</h3>
                                <p>{rule.description}</p>
                                <div className="bento-number">0{rule.id}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 3. Form Section (Bottom) */}
            <div className="reservation-form-panel" style={{ borderRadius: '40px', maxWidth: '800px', margin: '0 auto 6rem auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <div className="form-intro" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: '#000' }}>Reserve a Spot</h3>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>Ready to join the Future Generation? Fill out the form below.</p>
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
                        style={{ marginTop: '2rem' }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Register Now'}
                    </button>
                </form>
            </div>
            
        </div>
    );
};

export default KidsReservation;
