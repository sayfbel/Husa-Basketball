import React from 'react';
import MilestoneCard from './MilestoneCard';

const Timeline = () => {
    const milestones = [
        { year: '1946', title: 'Foundation', description: 'HUSA Basketball was founded.' },
        { year: '1999', title: 'First Championship', description: 'Won the national league.' },
        { year: '2023', title: 'New Era', description: 'Rebranding and new management.' },
    ];

    return (
        <div className="timeline">
            {milestones.map((milestone, index) => (
                <MilestoneCard key={index} {...milestone} />
            ))}
        </div>
    );
};

export default Timeline;
