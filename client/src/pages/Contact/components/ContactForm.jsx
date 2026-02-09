import React from 'react';
import Button from '../../../components/UI/Button';

const ContactForm = () => {
    return (
        <form className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1rem' }}>
                <label>Name</label>
                <input type="text" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: 'none' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label>Email</label>
                <input type="email" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: 'none' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label>Message</label>
                <textarea rows="5" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', border: 'none' }}></textarea>
            </div>

            <Button type="submit">Send Message</Button>
        </form>
    );
};

export default ContactForm;
