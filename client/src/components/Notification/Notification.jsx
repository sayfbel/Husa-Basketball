import React, { createContext, useContext, useState, useCallback } from 'react';
import './Notification.css';
import { CheckCircle, XCircle, AlertCircle, X, HelpCircle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);

    const showNotification = useCallback((message, type = 'success', duration = 3000) => {
        setNotification({ message, type });
        if (duration !== Infinity) {
            setTimeout(() => {
                setNotification(null);
            }, duration);
        }
    }, []);

    const showConfirm = useCallback((message, onConfirm, onCancel) => {
        setConfirmDialog({ message, onConfirm, onCancel });
    }, []);

    const handleConfirm = () => {
        if (confirmDialog?.onConfirm) confirmDialog.onConfirm();
        setConfirmDialog(null);
    };

    const handleCancel = () => {
        if (confirmDialog?.onCancel) confirmDialog.onCancel();
        setConfirmDialog(null);
    };

    return (
        <NotificationContext.Provider value={{ showNotification, showConfirm }}>
            {children}

            {/* Toast Notification */}
            {notification && (
                <div className={`notification-toast ${notification.type} animate-slide-in`}>
                    <div className="notification-icon">
                        {notification.type === 'success' && <CheckCircle size={20} />}
                        {notification.type === 'error' && <XCircle size={20} />}
                        {notification.type === 'info' && <AlertCircle size={20} />}
                    </div>
                    <div className="notification-content">
                        {notification.message}
                    </div>
                    <button className="notification-close" onClick={() => setNotification(null)}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <div className="confirm-overlay animate-fade-in">
                    <div className="confirm-modal animate-scale-up">
                        <div className="confirm-icon">
                            <HelpCircle size={48} color="#DB0A40" />
                        </div>
                        <h3>Confirm Action</h3>
                        <p>{confirmDialog.message}</p>
                        <div className="confirm-actions">
                            <button className="confirm-btn cancel" onClick={handleCancel}>Cancel</button>
                            <button className="confirm-btn proceed" onClick={handleConfirm}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
