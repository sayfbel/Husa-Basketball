import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const TacticalSelect = ({ name, value, onChange, options, placeholder = "SELECT OPTION", direction = "down" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (optionValue) => {
        // Emulate typical onChange event handling
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%', padding: '12px',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0',
                    color: selectedOption ? 'white' : '#888',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderLeft: '2px solid #DB0A40', // Tactical mark line
                    transition: 'all 0.2s ease',
                    userSelect: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
            >
                <span style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s ease',
                        color: '#DB0A40'
                    }}
                />
            </div>

            {isOpen && (
                <div className="tactical-dropdown animate-fade-in" style={{
                    position: 'absolute', 
                    ...(direction === 'up' ? { bottom: '100%', borderBottom: 'none' } : { top: '100%', borderTop: 'none' }),
                    left: 0, width: '100%',
                    background: '#080808', border: '1px solid rgba(255,255,255,0.1)',
                    maxHeight: '250px', overflowY: 'auto', zIndex: 100,
                    boxShadow: direction === 'up' ? '0 -10px 30px rgba(0,0,0,0.8)' : '0 10px 30px rgba(0,0,0,0.8)'
                }}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            style={{
                                padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                color: value === option.value ? '#DB0A40' : '#888',
                                background: value === option.value ? 'rgba(219, 10, 64, 0.05)' : 'transparent',
                                fontSize: '0.85rem', fontWeight: 'bold',
                                letterSpacing: '0.5px',
                                transition: 'all 0.1s'
                            }}
                            onMouseEnter={(e) => {
                                if (value !== option.value) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (value !== option.value) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#888';
                                }
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TacticalSelect;
