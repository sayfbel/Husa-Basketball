import React, { createContext, useContext, useState, useCallback } from 'react';
import './Notification.css';
import { CheckCircle, XCircle, AlertCircle, X, ShieldAlert, AlertTriangle } from 'lucide-react';

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
    const [toastDuration, setToastDuration] = useState(3000);

    const showNotification = useCallback((message, type = 'success', duration = 3000) => {
        setNotification({ message, type });
        setToastDuration(duration);
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
                        {notification.type === 'success' && <CheckCircle size={18} />}
                        {notification.type === 'error' && <XCircle size={18} />}
                        {notification.type === 'info' && <AlertCircle size={18} />}
                    </div>
                    <div className="notification-content">
                        {notification.message}
                    </div>
                    <button className="notification-close" onClick={() => setNotification(null)}>
                        <X size={14} />
                    </button>
                    {toastDuration !== Infinity && (
                        <div 
                            className="notification-progress" 
                            style={{ animationDuration: `${toastDuration}ms` }}
                        ></div>
                    )}
                </div>
            )}

            {/* Confirmation Dialog */}
            {confirmDialog && (
                <div className="confirm-overlay animate-fade-in">
                    <div className="confirm-modal animate-scale-up">
                        {/* High-tech Holographic Corner Brackets */}
                        <div className="confirm-bracket tl"></div>
                        <div className="confirm-bracket tr"></div>
                        <div className="confirm-bracket bl"></div>
                        <div className="confirm-bracket br"></div>

                        {/* Top Security Clearance Subtitle */}
                        <div className="confirm-top-bar">
                            <div className="tactical-pulse-dot"></div>
                            <span className="confirm-security-label">SECURE AUTHORIZATION INTERFACE</span>
                        </div>

                        {/* Warning Header */}
                        <div className="confirm-header-section">
                            <div className="confirm-icon-box">
                                <ShieldAlert size={36} className="pulsing-warning-icon" />
                            </div>
                            <h3>CRITICAL ACTION</h3>
                        </div>

                        {/* Alert Message Card */}
                        <div className="confirm-message-card">
                            <div className="message-side-indicator"></div>
                            <p>{confirmDialog.message}</p>
                        </div>

                        {/* Additional Database Warnings */}
                        <div className="confirm-db-meta">
                            <AlertTriangle size={12} color="#ff3333" />
                            <span>WARNING: THIS WILL MODIFY THE ACTIVE CLUB REGISTRY DATABASE PERMANENTLY</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="confirm-actions">
                            <button className="confirm-btn cancel" onClick={handleCancel}>
                                Cancel Override
                            </button>
                            <button className="confirm-btn proceed" onClick={handleConfirm}>
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};
