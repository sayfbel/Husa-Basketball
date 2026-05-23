import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './css/news.css';

const News = () => {
    const { currentUser } = useAuth();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isImportant, setIsImportant] = useState(false);
    const [isPresidential, setIsPresidential] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/news');
            const data = await response.json();
            setNews(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching news:', error);
            setLoading(false);
        }
    };

    const handleAddNews = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    image_url: imageUrl,
                    is_important: isImportant,
                    is_presidential: isPresidential,
                    author_id: currentUser.id
                })
            });

            if (response.ok) {
                fetchNews();
                setTitle('');
                setContent('');
                setImageUrl('');
                setIsImportant(false);
                setIsPresidential(false);
                setIsAdding(false);
            }
        } catch (error) {
            console.error('Error adding news:', error);
        }
    };

    const handleDeleteNews = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/news/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchNews();
            }
        } catch (error) {
            console.error('Error deleting news:', error);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    // Filter news
    const officialVoices = news.filter(n => ['president', 'coach', 'player'].includes(n.author_type) || n.is_presidential);
    const regularNews = news.filter(n => !['president', 'coach', 'player'].includes(n.author_type) && !n.is_presidential);
    const importantNews = regularNews.find(n => n.is_important) || regularNews[0];
    const otherRegularNews = regularNews.filter(n => n.id !== (importantNews?.id));

    if (loading) return <div className="loading">Chargement du journal...</div>;

    return (
        <div className="news-page animate-fade-in">
            <div className="news-bg-glow"></div>
            <div className="news-container">
                {/* Tactical Cyber Header */}
                <h1 className="news-title">HUSA Bulletins</h1>
                <div className="news-intro">
                    <p>
                        Welcome to the Hassania Union Sport d'Agadir (HUSA) Basketball Operations Feed. 
                        Stay informed with real-time match reports, official club announcements, tactical roster updates, and editorial briefings straight from the command center. 
                        Every publication keeps our coaching staff, players, and dedicated supporters synchronized with our relentless drive toward basketball excellence.
                    </p>
                </div>


                <header className="news-header">
                    <div className="news-subheader">
                        <span>Bulletin Officiel</span>
                        <span>AGADIR, {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span>Tactical Dossier v1.0</span>
                    </div>
                </header>


                {/* President Control Publisher Form Removed */}

                <div className="news-layout">
                    {/* Main Bulletins Section */}
                    <div className="news-main">
                        {/* Featured (Important) Bulletin */}
                        {importantNews && (
                            <div className="article-card featured animate-fade-in">
                                {Boolean(importantNews.is_important) && <span className="importance-tag">À la une</span>}
                                {currentUser?.role === 'SocialMedia' && !importantNews.id.toString().startsWith('match-') && (
                                    <button 
                                        onClick={() => handleDeleteNews(importantNews.id)} 
                                        style={{ float: 'right', color: 'var(--primary-color)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}
                                    >
                                        [ Supprimer ]
                                    </button>
                                )}
                                <h1 className="article-headline" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>{importantNews.title}</h1>
                                <div className="article-meta">Enregistré le {formatDate(importantNews.created_at)}</div>
                                {importantNews.image_url && <img src={importantNews.image_url} alt="Featured Brief" className="article-image" />}
                                <div className="news-column">
                                    <p className="article-content">{importantNews.content}</p>
                                </div>
                            </div>
                        )}

                        {/* Regular Bulletins Feed */}
                        <div className="regular-news-grid">
                            {otherRegularNews.map(item => (
                                <div key={item.id} className="article-card animate-fade-in">
                                    {currentUser?.role === 'SocialMedia' && !item.id.toString().startsWith('match-') && (
                                        <button 
                                            onClick={() => handleDeleteNews(item.id)} 
                                            style={{ float: 'right', color: 'var(--primary-color)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}
                                        >
                                            [ Supprimer ]
                                        </button>
                                    )}
                                    <h2 className="article-headline" style={{ fontSize: '1.8rem' }}>{item.title}</h2>
                                    <div className="article-meta">{formatDate(item.created_at)}</div>
                                    {item.image_url && <img src={item.image_url} alt="Briefing" className="article-image" />}
                                    <p className="article-content">{item.content.substring(0, 200)}...</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Dossiers / Presidential Column */}
                    <aside className="news-sidebar">
                        <div className="president-section animate-fade-in">
                                <div className="president-editorial">
                                    {officialVoices.length > 0 && <h3 style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '1.5rem', fontWeight: 600 }}>OFFICIAL HUSA VOICES</h3>}
                                    {officialVoices.map(voice => {
                                        let themeRGB = '255, 77, 109'; // Default President (Red)
                                        if (voice.author_type === 'coach') themeRGB = '77, 148, 255'; // Coach (Blue)
                                        if (voice.author_type === 'player') themeRGB = '255, 204, 0'; // Player (Yellow)

                                        return (
                                            <div key={voice.id} style={{ marginBottom: '1.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                                    {(voice.author_type === 'president' || Boolean(voice.is_presidential)) && <span style={{ background: 'rgba(255, 77, 109, 0.1)', color: '#ff4d6d', border: '1px solid rgba(255, 77, 109, 0.3)', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>THE PRÉSIDENT SAY</span>}
                                                    {voice.author_type === 'coach' && <span style={{ background: 'rgba(77, 148, 255, 0.1)', color: '#4d94ff', border: '1px solid rgba(77, 148, 255, 0.3)', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>COACH'S CORNER</span>}
                                                    {voice.author_type === 'player' && <span style={{ background: 'rgba(255, 204, 0, 0.1)', color: '#ffcc00', border: '1px solid rgba(255, 204, 0, 0.3)', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PLAYERS VOICE</span>}
                                                </div>
                                                {voice.image_url && (
                                                    <div className="voice-breakout-container" style={{ 
                                                        border: `1px solid rgba(${themeRGB}, 0.2)`, 
                                                        background: `linear-gradient(to top, rgba(${themeRGB}, 0.1), transparent)` 
                                                    }}>
                                                        <img src={voice.image_url} alt={voice.title} className="voice-breakout-image" />
                                                    </div>
                                                )}
                                                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>{voice.title}</h4>
                                                <p style={{ color: '#aaa', fontStyle: 'italic', lineHeight: '1.6' }}>"{voice.content}"</p>
                                            </div>
                                        );
                                    })}
                                </div>
                        </div>

                        {/* Next Match Sidebar Info */}
                        {(() => {
                            const now = new Date();
                            const upcomingMatch = news
                                .filter(item => item.id.toString().startsWith('match-'))
                                .map(item => {
                                    const matchDate = new Date(item.created_at);
                                    return { ...item, matchDate };
                                })
                                .filter(item => item.matchDate >= now)
                                .sort((a, b) => a.matchDate - b.matchDate)[0];

                            if (!upcomingMatch) return null;

                            return (
                                <div className="next-match-card animate-fade-in">
                                    <h3>Match Prochain</h3>
                                    <div className="next-match-title">
                                        {upcomingMatch.title.split(': ')[1] || upcomingMatch.title}
                                    </div>
                                    <div className="next-match-date">
                                        {formatDate(upcomingMatch.created_at)}
                                    </div>
                                    <div className="next-match-badge">
                                        Disponible en Billetterie
                                    </div>
                                </div>
                            );
                        })()}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default News;
