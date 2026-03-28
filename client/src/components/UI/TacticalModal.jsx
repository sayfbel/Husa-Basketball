import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

const TacticalModal = ({ isOpen, onClose, children, style = {} }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay animate-fade-in" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(2, 2, 2, 0.98)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
            <div className="match-paper-card animate-scale-in" style={{
                background: '#080808', width: '100%', maxWidth: '1000px', height: '90vh',
                borderRadius: '0', boxShadow: '0 0 150px rgba(219, 10, 64, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'relative', overflow: 'hidden', padding: '0',
                display: 'flex', flexDirection: 'column', color: '#fff',
                minHeight: '600px',
                ...style
            }}>
                {/* Designer Accents - Cyber Corner Marks */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px', borderTop: '2px solid #DB0A40', borderLeft: '2px solid #DB0A40' }}></div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '30px', borderTop: '2px solid #DB0A40', borderRight: '2px solid #DB0A40' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '30px', borderBottom: '2px solid #DB0A40', borderLeft: '2px solid #DB0A40' }}></div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', borderBottom: '2px solid #DB0A40', borderRight: '2px solid #DB0A40' }}></div>

                {/* Top Scanning Line Animation Effect */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, #DB0A40, transparent)', opacity: 0.5 }}></div>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', flex: 1, height: '100%', overflow: 'hidden', gap: 0 }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TacticalModal;
