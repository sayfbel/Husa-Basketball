import React, { useState, useEffect, useRef } from 'react';
import '../css/carousel.css';

// Import News Images
import newsImg1 from '../../../assets/images/news/573250808_17894544573357067_6940532935089663788_n..jpg';
import newsImg2 from '../../../assets/images/news/575224628_17895474390357067_2343543371764802627_n..jpg';
import newsImg3 from '../../../assets/images/news/582739586_17895581448357067_8347811714654289535_n..jpg';
import newsImg4 from '../../../assets/images/news/585212662_17899357755357067_6311429234753411450_n..jpg';
import newsImg5 from '../../../assets/images/news/613133289_17902414716357067_395244513126613799_n..jpg';

const InstaCarousel = () => {
    // News Data
    const newsItems = [
        {
            id: 1,
            title: "Crucial Victory on the Road",
            date: "Feb 07, 2026",
            description: "HUSA Basketball secures a vital win away from home, showcasing resilience and tactical discipline in the final quarter.",
            image: newsImg1,
            tag: "Match Report"
        },
        {
            id: 2,
            title: "Playoff Intensity Rising",
            date: "Feb 05, 2026",
            description: "As the regular season winds down, the intensity heats up. The team is focused on securing the best possible seed.",
            image: newsImg2,
            tag: "Season Update"
        },
        {
            id: 3,
            title: "Training Camp Insights",
            date: "Feb 02, 2026",
            description: "Behind the scenes at our high-performance training center. See how the players prepare for the upcoming challenges.",
            image: newsImg3,
            tag: "Inside Access"
        },
        {
            id: 4,
            title: "Community Outreach Day",
            date: "Jan 28, 2026",
            description: "Giving back to Agadir. Our players visited local schools to inspire the next generation of athletes.",
            image: newsImg4,
            tag: "Community"
        },
        {
            id: 5,
            title: "New tactical approaches",
            date: "Jan 25, 2026",
            description: "Coach outlines the strategic shifts for the second half of the season to counter defensive adjustments.",
            image: newsImg5,
            tag: "Team News"
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 1200, isMobile: false });

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    isMobile: window.innerWidth <= 768
                });
            }
        };

        // Initial calc
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 6000); // Slightly longer for reading news
        return () => clearInterval(interval);
    }, []);

    const getSlideClass = (index) => {
        return index === currentIndex ? 'carousel-slide active-slide' : 'carousel-slide';
    };

    // Robust Pixel-Based Centering
    const effectiveWidth = dimensions.width;
    const rawSlideWidth = effectiveWidth * (dimensions.isMobile ? 0.85 : 0.60);
    const slideWidthPx = Math.min(rawSlideWidth, 600);
    const centerOffsetPx = (effectiveWidth - slideWidthPx) / 2;
    const translateX = centerOffsetPx - (currentIndex * slideWidthPx);

    return (
        <div className="carousel-container animate-fade-in" ref={containerRef}>
            <div className="carousel-track-wrapper">
                <div
                    className="carousel-track"
                    style={{ transform: `translateX(${translateX}px)` }}
                >
                    {newsItems.map((news, index) => (
                        <div className={getSlideClass(index)} key={news.id}>
                            <div className="news-card-content">
                                <img src={news.image} alt={news.title} className="carousel-image" />
                                <div className="news-overlay">
                                    <div className="news-header">
                                        <span className="news-tag">{news.tag}</span>
                                        <span className="news-date">{news.date}</span>
                                    </div>
                                    <div className="news-info">
                                        <h3>{news.title}</h3>
                                        <p>{news.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="carousel-controls">
                <button className="carousel-btn" onClick={prevSlide}>
                    <span className="material-icons-outlined">chevron_left</span>
                </button>
                <button className="carousel-btn" onClick={nextSlide}>
                    <span className="material-icons-outlined">chevron_right</span>
                </button>
            </div>
        </div>
    );
};

export default InstaCarousel;
