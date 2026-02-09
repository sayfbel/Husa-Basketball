import React from 'react';

const MilestoneCard = ({ year, title, description }) => {
    return (
        <div className="milestone-card glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--accent-color)' }}>{year}</h3>
            <h4>{title}</h4>
            <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
        </div>
    );
};

export default MilestoneCard;
