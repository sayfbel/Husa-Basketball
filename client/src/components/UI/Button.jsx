import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', onClick, type = 'button', className = '' }) => {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            onClick={onClick}
            type={type}
        >
            {children}
        </button>
    );
};

export default Button;
