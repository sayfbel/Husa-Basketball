import React, { useState, useEffect, useRef } from 'react';
import './DateCard.css';

// Constants
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const VIEWS = {
    DAYS: 'days',
    MONTHS: 'months',
    YEARS: 'years'
};

const DateCard = ({
    label,
    value,
    onChange,
    placeholder = "Select Date"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Initial date setup
    const getInitialDate = () => {
        if (value) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) return d;
        }
        return new Date();
    };

    const [cursorDate, setCursorDate] = useState(getInitialDate()); // Date being viewed
    const [view, setView] = useState(VIEWS.DAYS); // days | months | years

    // Sync cursor when reopening
    useEffect(() => {
        if (isOpen) {
            setCursorDate(value ? new Date(value) : new Date());
            setView(VIEWS.DAYS);
        }
    }, [isOpen, value]);

    // Helpers
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
    const toISODate = (d) => d.toISOString().split('T')[0];

    // Format display date
    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // --- NAVIGATION HANDLERS ---

    // Header Click: Days -> Months -> Years -> Days (or stay at years)
    const handleHeaderClick = (e) => {
        e.stopPropagation();
        if (view === VIEWS.DAYS) setView(VIEWS.MONTHS);
        else if (view === VIEWS.MONTHS) setView(VIEWS.YEARS);
        else setView(VIEWS.DAYS); // Optional: loop back to days or do nothing
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        const d = new Date(cursorDate);
        if (view === VIEWS.DAYS) {
            d.setMonth(d.getMonth() - 1);
        } else if (view === VIEWS.MONTHS) {
            d.setFullYear(d.getFullYear() - 1);
        } else if (view === VIEWS.YEARS) {
            d.setFullYear(d.getFullYear() - 12);
        }
        setCursorDate(d);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        const d = new Date(cursorDate);
        if (view === VIEWS.DAYS) {
            d.setMonth(d.getMonth() + 1);
        } else if (view === VIEWS.MONTHS) {
            d.setFullYear(d.getFullYear() + 1);
        } else if (view === VIEWS.YEARS) {
            d.setFullYear(d.getFullYear() + 12);
        }
        setCursorDate(d);
    };

    // --- SELECTION HANDLERS ---

    const handleDayClick = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        if (onChange) onChange(`${year}-${month}-${day}`);
        setIsOpen(false);
    };

    const handleMonthClick = (monthIndex) => {
        const d = new Date(cursorDate);
        d.setMonth(monthIndex);
        setCursorDate(d);
        setView(VIEWS.DAYS);
    };

    const handleYearClick = (year) => {
        const d = new Date(cursorDate);
        d.setFullYear(year);
        setCursorDate(d);
        setView(VIEWS.MONTHS);
    };

    // --- RENDERING SUB-COMPONENTS ---

    const renderHeader = () => {
        let title = "";
        if (view === VIEWS.DAYS) {
            title = `${MONTHS[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`;
        } else if (view === VIEWS.MONTHS) {
            title = `${cursorDate.getFullYear()}`;
        } else if (view === VIEWS.YEARS) {
            const startYear = cursorDate.getFullYear() - 6;
            const endYear = cursorDate.getFullYear() + 5;
            title = `${startYear} - ${endYear}`;
        }

        return (
            <div className="calendar-header" onClick={handleHeaderClick} style={{ cursor: 'pointer' }}>
                <button type="button" className="calendar-nav-btn" onClick={handlePrev}>
                    <span className="material-icons-outlined">chevron_left</span>
                </button>
                <span className="calendar-title">{title}</span>
                <button type="button" className="calendar-nav-btn" onClick={handleNext}>
                    <span className="material-icons-outlined">chevron_right</span>
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const year = cursorDate.getFullYear();
        const month = cursorDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const grid = [];
        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            grid.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }
        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const dateStr = toISODate(dateObj);
            const isSelected = value && toISODate(new Date(value)) === dateStr;
            const isToday = toISODate(new Date()) === dateStr;

            grid.push(
                <div
                    key={d}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => handleDayClick(dateObj)}
                >
                    {d}
                </div>
            );
        }

        return (
            <div className="calendar-grid days-grid">
                <div className="calendar-day-name">Sun</div>
                <div className="calendar-day-name">Mon</div>
                <div className="calendar-day-name">Tue</div>
                <div className="calendar-day-name">Wed</div>
                <div className="calendar-day-name">Thu</div>
                <div className="calendar-day-name">Fri</div>
                <div className="calendar-day-name">Sat</div>
                {grid}
            </div>
        );
    };

    const renderMonths = () => {
        return (
            <div className="calendar-grid months-grid">
                {MONTHS.map((m, index) => (
                    <div
                        key={m}
                        className={`calendar-item ${cursorDate.getMonth() === index ? 'selected' : ''}`}
                        onClick={() => handleMonthClick(index)}
                    >
                        {m.substring(0, 3)}
                    </div>
                ))}
            </div>
        );
    };

    const renderYears = () => {
        const currentYear = cursorDate.getFullYear();
        const startYear = currentYear - 6;
        const years = [];
        for (let i = 0; i < 12; i++) {
            const year = startYear + i;
            years.push(
                <div
                    key={year}
                    className={`calendar-item ${year === currentYear ? 'selected' : ''}`}
                    onClick={() => handleYearClick(year)}
                >
                    {year}
                </div>
            );
        }
        return (
            <div className="calendar-grid years-grid">
                {years}
            </div>
        );
    };

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className={`date-wrapper ${isOpen ? 'active' : ''}`} ref={wrapperRef}>
            {label && <label>{label}</label>}

            <div className="date-box" onClick={() => setIsOpen(!isOpen)}>
                <div className="selected-text">
                    {value ? formatDate(value) : placeholder}
                </div>
                <span className="material-icons-outlined icon">calendar_today</span>
            </div>

            <div className="calendar-dropdown">
                {renderHeader()}

                {view === VIEWS.DAYS && renderDays()}
                {view === VIEWS.MONTHS && renderMonths()}
                {view === VIEWS.YEARS && renderYears()}
            </div>
        </div>
    );
};

export default DateCard;
