import React from 'react';

const NewsFilter = () => {
    return (
        <div className="news-filter" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-outline">All</button>
            <button className="btn btn-outline">Matches</button>
            <button className="btn btn-outline">Training</button>
        </div>
    );
};

export default NewsFilter;
