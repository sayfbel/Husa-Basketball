import React from 'react';
import Button from '../../../components/UI/Button';

const TryoutForm = () => {
    return (
        <form className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Apply for Tryouts</h3>

            <div style={{ marginBottom: '1rem' }}>
                <label>Full Name</label>
                <input type="text" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: 'none' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label>Height (cm)</label>
                <input type="number" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: 'none' }} />
            </div>

            <Button type="submit">Submit Application</Button>
        </form>
    );
};

export default TryoutForm;
