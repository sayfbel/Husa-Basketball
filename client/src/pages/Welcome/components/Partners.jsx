import React from 'react';
import '../css/partners.css';

const Partners = () => {
    return (
        <section className="partners-section">
            <span className="section-label">Official Partnership</span>

            <div className="partner-spotlight">
                <div className="partner-logo-area">
                    <div className="flyviral-logo">
                        Fly<span>Viral</span> <br /> Maroc
                    </div>
                </div>

                <div className="partner-content">
                    <div className="headline-wrapper">
                        <h2 className="animate-fade-in">Partenaire Officiel du HUSA Basketball</h2>
                        <p className="partner-subtitle">Agadir, le 26-08-2025</p>
                    </div>

                    <div className="announcement-text">
                        <p>
                            FlyViral Maroc a le plaisir d’annoncer officiellement son rôle en tant que sponsor officiel
                            de l’équipe HUSA Basketball, symbole d’excellence et de passion sportive dans la région Souss-Massa.
                        </p>
                        <p style={{ marginTop: '1rem' }}>
                            Cette collaboration marque une étape importante pour FlyViral Maroc, qui s’engage à soutenir
                            le développement du sport local et à promouvoir les valeurs de performance, d’esprit d’équipe
                            et d’engagement communautaire.
                        </p>
                    </div>

                    <div className="partner-quote">
                        « Nous sommes honorés de nous associer à HUSA Basketball. Ce partenariat reflète notre
                        engagement envers le sport et la jeunesse. Ensemble, nous souhaitons inspirer la nouvelle
                        génération et contribuer à l’essor du basketball à Agadir et au Maroc. »
                        <span className="quote-author">Ahmed Tamra, Directeur de FlyViral Maroc</span>
                    </div>

                    <div className="partner-details">
                        <div className="detail-item">
                            <span className="material-icons-outlined">email</span> contact@flyviral.ma
                        </div>
                        <div className="detail-item">
                            <span className="material-icons-outlined">public</span> @flyviralmaroc
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Partners;
