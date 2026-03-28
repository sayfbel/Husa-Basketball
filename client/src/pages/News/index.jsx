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
    const presidentialNews = news.filter(n => n.is_presidential);
    const regularNews = news.filter(n => !n.is_presidential);
    const importantNews = regularNews.find(n => n.is_important) || regularNews[0];
    const otherRegularNews = regularNews.filter(n => n.id !== (importantNews?.id));

    if (loading) return <div className="loading">Chargement du journal...</div>;

    return (
        <div className="news-page animate-fade-in">
            <div className="news-bg-glow"></div>
            <div className="news-container">
                {/* Masthead */}
                <header className="news-header">
                    <h1 className="news-masthead">Husa Basketball</h1>
                    <div className="news-subheader">
                        <span>Édition Spéciale</span>
                        <span>AGADIR, {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span>Vol. 1 - N° 23</span>
                    </div>
                </header>

                {/* President Admin Form */}
                {currentUser?.role === 'President' && (
                    <div style={{ marginBottom: '2rem' }}>
                        <button 
                            className="btn-publish" 
                            onClick={() => setIsAdding(!isAdding)}
                            style={{ width: '100%', marginBottom: '1rem' }}
                        >
                            {isAdding ? 'Annuler' : 'Ajouter une Nouvelle Publication'}
                        </button>
                        
                        {isAdding && (
                            <form className="news-admin-form" onSubmit={handleAddNews}>
                                <h2>Nouvelle Publication</h2>
                                <div className="form-group">
                                    <label>Titre</label>
                                    <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>URL de l'image (Optionnel)</label>
                                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                                </div>
                                <div className="form-group">
                                    <label>Contenu</label>
                                    <textarea value={content} onChange={(e) => setContent(e.target.value)} rows="6" required />
                                </div>
                                <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
                                        Important / À la une
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <input type="checkbox" checked={isPresidential} onChange={(e) => setIsPresidential(e.target.checked)} />
                                        Éditorial du Président
                                    </label>
                                </div>
                                <button type="submit" className="btn-publish">Publier dans le Journal</button>
                            </form>
                        )}
                    </div>
                )}

                <div className="news-layout">
                    {/* Main Section */}
                    <div className="news-main">
                        {/* Featured (Important) News */}
                        {importantNews && (
                            <div className="article-card featured">
                                {importantNews.is_important && <span className="importance-tag">À LA UNE</span>}
                                {currentUser?.role === 'President' && !importantNews.id.toString().startsWith('match-') && (
                                    <button onClick={() => handleDeleteNews(importantNews.id)} style={{ float: 'right', color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>Supprimer</button>
                                )}
                                <h1 className="article-headline" style={{ fontSize: '3.5rem' }}>{importantNews.title}</h1>
                                <div className="article-meta">Publié le {formatDate(importantNews.created_at)}</div>
                                {importantNews.image_url && <img src={importantNews.image_url} alt="Main" className="article-image" style={{ maxHeight: '500px' }} />}
                                <div className="news-column">
                                    <p className="article-content">{importantNews.content}</p>
                                </div>
                            </div>
                        )}

                        {/* Regular News */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            {otherRegularNews.map(item => (
                                <div key={item.id} className="article-card">
                                    {currentUser?.role === 'President' && !item.id.toString().startsWith('match-') && (
                                        <button onClick={() => handleDeleteNews(item.id)} style={{ float: 'right', color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>Supprimer</button>
                                    )}
                                    <h2 className="article-headline" style={{ fontSize: '1.8rem' }}>{item.title}</h2>
                                    <div className="article-meta">{formatDate(item.created_at)}</div>
                                    {item.image_url && <img src={item.image_url} alt="News" className="article-image" />}
                                    <p className="article-content">{item.content.substring(0, 200)}...</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar / Presidential Column */}
                    <aside className="news-sidebar">
                        <div className="president-section">
                            <img src="http://localhost:5000/uploads/President.jpg" alt="President" className="president-image" />
                            {presidentialNews.length > 0 ? (
                                <div className="president-editorial">
                                    <h3 style={{ textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'Poppins' }}>Le mot du Président</h3>
                                    {presidentialNews.map(pNews => (
                                        <div key={pNews.id} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                            <h4 style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>{pNews.title}</h4>
                                            <p style={{ fontSize: '0.95rem', fontStyle: 'italic', lineHeight: '1.5' }}>
                                                "{pNews.content.substring(0, 500)}..."
                                            </p>
                                            {currentUser?.role === 'President' && <button onClick={() => handleDeleteNews(pNews.id)} style={{ fontSize: '0.8rem', color: 'red', border: 'none', background: 'transparent', cursor: 'pointer' }}>Supprimer</button>}
                                        </div>
                                    ))}
                                    <div className="president-signature">
                                        Youssef Abid<br />
                                        <span>Président de HUSA Basketball</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="president-editorial">
                                    <h3 style={{ textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'Poppins' }}>Le mot du Président</h3>
                                    <p style={{ fontSize: '0.95rem', fontStyle: 'italic' }}>
                                        "Bienvenue à tous les supporters de HUSA Basketball. Notre vision pour cette année est de porter l'équipe vers de nouveaux sommets..."
                                    </p>
                                    <div className="president-signature">
                                        Youssef Abid<br />
                                        <span>Président de HUSA Basketball</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Next Match Sidebar Info */}
                        {(() => {
                            // Find future matches and pick the one with the earliest date >= today
                            const now = new Date();
                            const upcomingMatch = news
                                .filter(item => item.id.toString().startsWith('match-'))
                                .map(item => {
                                    // Parse content to get some extra info if needed, 
                                    // or just use the title/date if we had them.
                                    // But we have the title "Dominateur à Domicile : HUSA reçoit OCK"
                                    const matchDate = new Date(item.created_at);
                                    return { ...item, matchDate };
                                })
                                .filter(item => item.matchDate >= now)
                                .sort((a, b) => a.matchDate - b.matchDate)[0];

                            if (!upcomingMatch) return null;

                            return (
                                <div style={{ marginTop: '2rem', border: '1px solid #111', padding: '1rem' }}>
                                    <h3 style={{ fontFamily: 'Poppins', borderBottom: '2px solid #111', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Match Prochain</h3>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontWeight: 'bold' }}>{upcomingMatch.title.split(': ')[1] || upcomingMatch.title}</p>
                                        <p style={{ fontSize: '0.9rem' }}>
                                            {formatDate(upcomingMatch.created_at)}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>DISPONIBLE EN BILLETTERIE</p>
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
