import React from 'react';
import MatchCard from './components/MatchCard';
import NewsFilter from './components/NewsFilter';
import SocialEmbed from './components/SocialEmbed';
import './css/news.css';

const News = () => {
    return (
        <div className="news-page container animate-fade-in">
            <h1>News & Media</h1>
            <NewsFilter />
            <div className="news-grid">
                <MatchCard />
                <SocialEmbed />
                <SocialEmbed />
            </div>
        </div>
    );
};

export default News;
