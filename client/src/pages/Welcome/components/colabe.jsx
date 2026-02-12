import React from 'react';
import '../css/Colab.css';

// Import logos from assets/images/colabs
import flyViralLogo from '../../../assets/images/colabs/logo-flyviral-2.webp';
import imagesLogo from '../../../assets/images/colabs/images.png';
import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const Colab = () => {
    const collaborations = [
        {
            id: 1,
            name: 'HUSA BASKETBALL',
            role: 'PRIMARY CLUB',
            logo: husaLogo,
            desc: 'The heart of our sports ecosystem.'
        },
        {
            id: 2,
            name: 'FLYVIRAL MAROC',
            role: 'STRATEGIC SPONSOR',
            logo: flyViralLogo,
            desc: 'Amplifying our digital reach and fan engagement.'
        },
        {
            id: 3,
            name: 'IMAGE STUDIOS',
            role: 'MEDIA PARTNER',
            logo: imagesLogo,
            desc: 'Capturing the cinematic moments of the game.'
        }
    ];

    return (
        <section className="colab-brand-wall">
            <div className="wall-header">
                <span className="label">STRATEGIC ALLIANCES</span>
                <h2>THE HUB <br /> <span>OF COLLABORATION</span></h2>
            </div>

            <div className="brand-matrix">
                {collaborations.map(collab => (
                    <div className="brand-cell" key={collab.id}>
                        <div className="brand-logo-container">
                            <img src={collab.logo} alt={collab.name} />
                        </div>
                        <div className="brand-meta">
                            <span className="brand-role">{collab.role}</span>
                            <h3 className="brand-name">{collab.name}</h3>
                            <p className="brand-desc">{collab.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-text-watermark">PARTNERSHIPS</div>
        </section>
    );
};

export default Colab;