import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import './SelectorCard.css';

const SelectorCard = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = "Select..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(null);

    // Determine if component is controlled or uncontrolled
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (option) => {
        const optionValue = typeof option === 'object' ? option.value : option;

        if (!isControlled) {
            setInternalValue(optionValue);
        }

        if (onChange) {
            onChange(optionValue);
        }
        setIsOpen(false);
    };

    // Helper to get label and value from option (which might be string or object)
    const getOptionLabel = (option) => typeof option === 'object' ? option.label : option;
    const getOptionValue = (option) => typeof option === 'object' ? option.value : option;

    const selectedOption = options.find(opt => getOptionValue(opt) === currentValue);
    const displayLabel = selectedOption ? getOptionLabel(selectedOption) : placeholder;

    return (
        <div className={`select-wrapper ${isOpen ? 'active' : ''}`} ref={wrapperRef}>
            {label && <label>{label}</label>}

            <div className="select-box" onClick={() => setIsOpen(!isOpen)}>
                <div className="selected-text">{displayLabel}</div>
                <ChevronDown size={20} className="select-arrow" />
            </div>

            <div className="options">
                {options.map((option, index) => {
                    const optValue = getOptionValue(option);
                    const optLabel = getOptionLabel(option);
                    const isSelected = currentValue === optValue;

                    return (
                        <div
                            key={index}
                            className={`option ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {optLabel}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SelectorCard;
