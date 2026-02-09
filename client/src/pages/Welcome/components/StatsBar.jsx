import React, { useState, useEffect } from 'react';
import '../css/stats.css';

const Counter = ({ start = 0, end, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(start);

    useEffect(() => {
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Ease out quart
            const easeProgress = 1 - Math.pow(1 - progress, 4);

            setCount(Math.floor(easeProgress * (end - start) + start));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }, [start, end, duration]);

    return (
        <div className="stat-number">
            {count.toString().padStart(2, '0')}{suffix}
        </div>
    );
};

const StatsBar = () => {
    return (
        <div className="stats-bar container">
            <div className="stat-box">
                <Counter end={14} />
                <div className="stat-label">Matches Played</div>
            </div>
            <div className="stat-box">
                <Counter end={10} />
                <div className="stat-label">Victories</div>
            </div>
            <div className="stat-box">
                <Counter start={3} end={1} suffix="DNH" />
                <div className="stat-label">League Rank</div>
            </div>
            <div className="stat-box">
                <div className="stat-number" style={{ fontSize: '1.8rem' }}>Excellent</div>
                <div className="stat-label">Upcoming</div>
            </div>
        </div>
    );
};

export default StatsBar;
