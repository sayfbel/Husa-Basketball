import React, { useState, useEffect, useRef } from 'react';
import '../css/carousel.css';

const InstaCarousel = () => {
    // Player data
    const players = [
        {
            name: "Anas El Mahboul",
            number: 10,
            image: "https://images.unsplash.com/photo-1546519638-68e109498fe5?q=80&w=2090&auto=format&fit=crop",
            position: "Point Guard"
        },
        {
            name: "Karim Gourari",
            number: 23,
            image: "https://images.unsplash.com/photo-1519861531473-920026393112?q=80&w=2090&auto=format&fit=crop",
            position: "Forward"
        },
        {
            name: "Mohamed Choua",
            number: 15,
            image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2069&auto=format&fit=crop",
            position: "Center"
        },
        {
            name: "Yassine Mahsini",
            number: 4,
            image: "https://images.unsplash.com/photo-1628779238951-be2c9f2a59f4?q=80&w=2070&auto=format&fit=crop",
            position: "Shooting Guard"
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
        setCurrentIndex((prev) => (prev + 1) % players.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + players.length) % players.length);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    const getSlideClass = (index) => {
        return index === currentIndex ? 'carousel-slide active-slide' : 'carousel-slide';
    };

    // Robust Pixel-Based Centering
    // Slide consumes 60% (desktop) or 85% (mobile) of container width AND is capped at 600px in CSS
    const effectiveWidth = dimensions.width;

    // Calculate what the CSS is doing
    const rawSlideWidth = effectiveWidth * (dimensions.isMobile ? 0.85 : 0.60);
    // Apply the max-width constraint from CSS (600px)
    const slideWidthPx = Math.min(rawSlideWidth, 600);

    // Gap to center the slide: (ContainerWidth - SlideWidth) / 2
    const centerOffsetPx = (effectiveWidth - slideWidthPx) / 2;

    // Total shift: Offset - (N * SlideWidth)
    const translateX = centerOffsetPx - (currentIndex * slideWidthPx);

    return (
        <div className="carousel-container animate-fade-in" ref={containerRef}>
            <div className="carousel-track-wrapper">
                <div
                    className="carousel-track"
                    style={{ transform: `translateX(${translateX}px)` }}
                >
                    {players.map((player, index) => (
                        <div className={getSlideClass(index)} key={index}>
                            <div className="player-card-content">
                                <img src={player.image} alt={player.name} className="carousel-image" />
                                <div className="player-overlay">
                                    <div className="player-number">{player.number}</div>
                                    <div className="player-info">
                                        <h3>{player.name}</h3>
                                        <p>{player.position}</p>
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
