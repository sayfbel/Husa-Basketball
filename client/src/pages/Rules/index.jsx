import React from 'react';
import './css/rules.css';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, Book, AlertCircle, TrendingUp, Users } from 'lucide-react';

const Rules = () => {
    const navigate = useNavigate();

    const [shuffledRules, setShuffledRules] = React.useState([]);

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

    React.useEffect(() => {
        const shuffled = [...rules].sort(() => Math.random() - 0.5);
        setShuffledRules(shuffled);
    }, []);

    return (
        <div className="rules-page container animate-fade-in">
            <div className="rules-header">
                <span className="rules-super-title">School Standards</span>
                <h1 className="rules-title">The HUSA<br />Code of Conduct</h1>
                <p className="rules-subtitle">
                    Our basketball school is where future champions are built.
                    Following these rules ensures a safe and productive environment for everyone.
                </p>
            </div>

            <div className="rules-grid">
                {shuffledRules.map((rule, index) => (
                    <div className="rule-card" key={rule.id} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="rule-number">0{rule.id}</div>
                        <div className="rule-icon">{rule.icon}</div>
                        <h3 className="rule-name">{rule.title}</h3>
                        <p className="rule-desc">{rule.description}</p>
                    </div>
                ))}
            </div>

            <div className="rules-footer">
                <button className="back-btn" onClick={() => navigate('/reservation')}>
                    Ready to Join? Back to Reservation
                </button>
            </div>
        </div>
    );
};

export default Rules;
