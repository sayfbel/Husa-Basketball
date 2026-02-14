import React, { useState } from 'react';
import { User } from 'lucide-react';


const PlayerCard = ({ player, isStaff }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
        <div
            className={`player-card ${isStaff ? 'coach-card' : ''} ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className="card-inner-wrapper">
                {/* Front Side */}
                <div className="card-front">
                    {/* Number Background */}
                    <div className="player-number-bg">{player.number}</div>

                    {/* Image Area */}
                    <div className="player-image-wrapper">
                        {player.image ? (
                            <img src={player.image} alt={player.name} className="player-image" />
                        ) : (
                            <User size={64} className="player-placeholder-icon" />
                        )}
                        <h1>{player.name}</h1>
                    </div>

                    {/* Content */}
                    <div className="player-info">
                        {isStaff ? (
                            <div className="coach-badge">{player.role ? player.role.toUpperCase() : 'STAFF'}</div>
                        ) : (
                            <div className="player-number-small">#{player.number}</div>
                        )}
                        <h3 className="player-name">
                            {player.name.split(' ').map((part, i) => (
                                <span key={i}>{part}</span>
                            ))}
                        </h3>
                    </div>

                    {/* Decorative Elements */}
                    <div className="card-accent-line"></div>
                    <div className="card-corner-tr"></div>
                    <div className="card-corner-bl"></div>
                </div>

                {/* Back Side */}
                <div className="card-back">
                    {/* Left: Player Image */}
                    <div style={{ flex: '1', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        {player.image ? (
                            <img
                                src={player.image}
                                alt={player.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
                                <User size={48} className="text-gray-500" />
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div style={{ flex: '1.2', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>

                        {/* Number Custom Position for this layout */}
                        <div className="player-number-bg" style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            fontSize: '6rem',
                            zIndex: 0,
                            color: 'rgba(227, 24, 55, 0.4)'
                        }}>
                            {player.number}
                        </div>

                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <h3 className="text-xl font-bold uppercase mb-1" style={{ fontSize: '1.4rem', lineHeight: '1.2' }}>{player.name}</h3>
                            <div className="text-gray-400 mb-4" style={{ fontSize: '0.9rem' }}>{isStaff ? 'Technical Staff' : 'Player'}</div>

                            <div className="flex flex-col gap-3 w-full">
                                <div className="flex justify-between border-b border-gray-800 pb-1">
                                    <span className="text-gray-500 text-sm">Role : </span>
                                    <span className="text-sm">{player.role || 'Forward'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-1">
                                    <span className="text-gray-500 text-sm">Height : </span>
                                    <span className="text-sm">{player.height || '--'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-1">
                                    <span className="text-gray-500 text-sm">Weight : </span>
                                    <span className="text-sm">{player.weight || '--'}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-1">
                                    <span className="text-gray-500 text-sm">Age : </span>
                                    <span className="text-sm">{player.age ? `${player.age} Yrs` : '--'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerCard;
