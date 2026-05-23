import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../components/Notification/Notification';
import { Plus, Trash2, Edit2, Calendar, FileText, Check, AlertTriangle, Eye, EyeOff, X } from 'lucide-react';
import '../../../css/dashboard.css';
import '../../PresidentDashboard/css/Overview.css';
import TacticalModal from '../../../components/UI/TacticalModal';
import TacticalSelect from '../../../components/UI/TacticalSelect';

const NewsManager = () => {
    const { currentUser } = useAuth();
    const { showNotification, showConfirm } = useNotification();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [authorType, setAuthorType] = useState('general');
    const [players, setPlayers] = useState([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState('all');

    useEffect(() => {
        fetchNews();
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/players');
            setPlayers(res.data || []);
        } catch (err) {
            console.error("Error fetching players:", err);
        }
    };

    const fetchNews = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/news');
            setNews(res.data || []);
        } catch (err) {
            console.error("Error fetching news:", err);
            showNotification("Failed to load news bulletins", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNews = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('is_important', authorType === 'important');
            formData.append('author_type', authorType === 'important' ? 'general' : authorType);
            formData.append('author_id', authorType === 'player' ? selectedPlayerId : currentUser.id);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            if (editingArticle) {
                const res = await axios.put(`http://localhost:5000/api/news/${editingArticle.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.status === 200) {
                    showNotification("Bulletin updated successfully", "success");
                    setTitle('');
                    setContent('');
                    setImageUrl('');
                    setImageFile(null);
                    setAuthorType('general');
                    setSelectedPlayerId('all');
                    setEditingArticle(null);
                    setShowForm(false);
                    fetchNews();
                }
            } else {
                const res = await axios.post('http://localhost:5000/api/news', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.status === 201) {
                    showNotification("Bulletin published successfully", "success");
                    setTitle('');
                    setContent('');
                    setImageUrl('');
                    setImageFile(null);
                    setAuthorType('general');
                    setSelectedPlayerId('all');
                    setShowForm(false);
                    fetchNews();
                }
            }
        } catch (err) {
            console.error("Error saving news:", err);
            showNotification(editingArticle ? "Failed to update bulletin" : "Failed to publish bulletin", "error");
        }
    };

    const handleEditNews = (article) => {
        setEditingArticle(article);
        setTitle(article.title || '');
        setContent(article.content || '');
        setImageUrl(article.image_url || '');
        setImageFile(null);
        setAuthorType((article.is_important === 1 || article.is_important === true) ? 'important' : (article.author_type || (article.is_presidential ? 'president' : 'general')));
        if (article.author_type === 'player' && article.author_id) {
            setSelectedPlayerId(article.author_id);
        } else {
            setSelectedPlayerId('all');
        }
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteNews = async (id) => {
        showConfirm("Are you sure you want to delete this bulletin? This action is permanent.", async () => {
            try {
                const res = await axios.delete(`http://localhost:5000/api/news/${id}`);
                if (res.status === 200) {
                    showNotification("Bulletin deleted successfully", "success");
                    fetchNews();
                }
            } catch (err) {
                console.error("Error deleting news:", err);
                showNotification("Failed to delete bulletin", "error");
            }
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading-spinner">Accessing Operations Feed...</div>;

    // Separate articles from matches
    const regularArticles = news.filter(n => !n.id.toString().startsWith('match-'));
    const matchUpdates = news.filter(n => n.id.toString().startsWith('match-'));

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            <div className="section-header-modern" style={{ minHeight: '120px', padding: '1.5rem', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(219, 10, 64, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <span className="premium-label" style={{ color: 'var(--accent)' }}>BULLETIN HUB</span>
                        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>News bulletins</h1>
                    </div>
                    <button 
                        className="intel-btn-primary" 
                        onClick={() => {
                            if (showForm) {
                                setTitle('');
                                setContent('');
                                setImageUrl('');
                                setImageFile(null);
                                setAuthorType('general');
                                setSelectedPlayerId('all');
                                setEditingArticle(null);
                            }
                            setShowForm(!showForm);
                        }}
                        style={{ width: 'auto', background: showForm ? 'rgba(255,255,255,0.05)' : 'var(--accent)', borderColor: showForm ? 'rgba(255,255,255,0.1)' : 'var(--accent)', color: '#fff', padding: '12px 24px', fontWeight: 'bold' }}
                    >
                        {showForm ? 'CANCEL DRAFT' : 'LANCER UN BULLETIN'} <Plus size={16} style={{ marginLeft: '8px' }} />
                    </button>
                </div>
            </div>

            {/* Publication Form / Modal */}
            <TacticalModal isOpen={showForm} onClose={() => {
                setShowForm(false);
                setTitle('');
                setContent('');
                setImageUrl('');
                setImageFile(null);
                setAuthorType('general');
                setSelectedPlayerId('all');
                setEditingArticle(null);
            }}>
                <form onSubmit={handleSaveNews} style={{ display: 'contents' }}>
                    {/* LEFT SIDE: METADATA INTEL */}
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        padding: '3rem 2rem',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem',
                        height: '100%',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '12px', height: '12px', background: '#DB0A40', clipPath: 'polygon(0% 0%, 100% 0%, 75% 100%, 0% 100%)' }}></div>
                                <span style={{ fontSize: '0.65rem', letterSpacing: '3px', color: '#DB0A40', fontWeight: '900' }}>BULLETIN DOSSIER</span>
                            </div>
                            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-2px', lineHeight: 0.9, textTransform: 'uppercase' }}>
                                NEWS<br /><span style={{ color: 'rgba(255,255,255,0.3)' }}>LOG</span>
                            </h1>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ opacity: 1 }}>
                                <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '8px' }}>PUBLICATION_FLAGS</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <label style={{ fontSize: '0.65rem', color: '#888', fontWeight: 'bold', letterSpacing: '1px' }}>VOIX OFFICIELLE</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: authorType === 'general' ? 'rgba(219, 10, 64, 0.1)' : 'rgba(0,0,0,0.3)', padding: '10px', border: authorType === 'general' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', transition: 'all 0.2s' }}>
                                                <input type="radio" name="authorType" value="general" checked={authorType === 'general'} onChange={(e) => setAuthorType(e.target.value)} style={{ display: 'none' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: authorType === 'general' ? '#fff' : '#888', textTransform: 'uppercase' }}>Standard</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: authorType === 'important' ? 'rgba(219, 10, 64, 0.1)' : 'rgba(0,0,0,0.3)', padding: '10px', border: authorType === 'important' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', transition: 'all 0.2s' }}>
                                                <input type="radio" name="authorType" value="important" checked={authorType === 'important'} onChange={(e) => setAuthorType(e.target.value)} style={{ display: 'none' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: authorType === 'important' ? '#fff' : '#888', textTransform: 'uppercase' }}>IMPORTANT / À LA UNE</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: authorType === 'president' ? 'rgba(219, 10, 64, 0.1)' : 'rgba(0,0,0,0.3)', padding: '10px', border: authorType === 'president' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', transition: 'all 0.2s' }}>
                                                <input type="radio" name="authorType" value="president" checked={authorType === 'president'} onChange={(e) => setAuthorType(e.target.value)} style={{ display: 'none' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: authorType === 'president' ? '#fff' : '#888', textTransform: 'uppercase' }}>THE PRÉSIDENT SAY</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: authorType === 'coach' ? 'rgba(219, 10, 64, 0.1)' : 'rgba(0,0,0,0.3)', padding: '10px', border: authorType === 'coach' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', transition: 'all 0.2s' }}>
                                                <input type="radio" name="authorType" value="coach" checked={authorType === 'coach'} onChange={(e) => setAuthorType(e.target.value)} style={{ display: 'none' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: authorType === 'coach' ? '#fff' : '#888', textTransform: 'uppercase' }}>COACH'S CORNER</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: authorType === 'player' ? 'rgba(219, 10, 64, 0.1)' : 'rgba(0,0,0,0.3)', padding: '10px', border: authorType === 'player' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', transition: 'all 0.2s' }}>
                                                <input type="radio" name="authorType" value="player" checked={authorType === 'player'} onChange={(e) => setAuthorType(e.target.value)} style={{ display: 'none' }} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: authorType === 'player' ? '#fff' : '#888', textTransform: 'uppercase' }}>PLAYERS VOICE</span>
                                            </label>
                                        </div>

                                        {authorType === 'player' && (
                                            <div className="animate-fade-in" style={{ marginTop: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <label style={{ fontSize: '0.65rem', color: '#888', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>SELECT PLAYER</label>
                                                <TacticalSelect 
                                                    name="selectedPlayerId"
                                                    value={selectedPlayerId}
                                                    direction="up"
                                                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                                                    options={[
                                                        { value: 'all', label: 'ALL PLAYERS' },
                                                        ...players.map(p => ({
                                                            value: p.id.toString(), 
                                                            label: `${p.name} (#${p.jersey_number})`
                                                        }))
                                                    ]}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', fontSize: '0.55rem', color: '#444', letterSpacing: '2px', fontFamily: 'monospace' }}>
                            SYSTEM_ID: {editingArticle ? editingArticle.id : 'NEW_ENTRY'}<br />
                            STATUS: {editingArticle ? 'MODIFICATION' : 'CREATION'}<br />
                            ORIGIN: HUSA_NEWS_OPS
                        </div>
                    </div>

                    {/* RIGHT SIDE: COMPOSITION AREA */}
                    <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {editingArticle ? "Modifier l'Entrée du Bulletin" : "Nouvelle Entrée du Bulletin"}
                                </h2>
                                <p style={{ color: '#555', fontSize: '0.75rem', margin: '4px 0 0 0' }}>Define textual and visual parameters for the news feed.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setTitle('');
                                    setContent('');
                                    setImageUrl('');
                                    setImageFile(null);
                                    setAuthorType('general');
                                    setSelectedPlayerId('all');
                                    setEditingArticle(null);
                                }}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', width: '36px', height: '36px', borderRadius: '4px', color: '#777', cursor: 'pointer', transition: '0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#DB0A40'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#777'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                            <div>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Titre de la Publication</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', padding: '15px',
                                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0', color: 'white', fontSize: '1.2rem', fontWeight: 'bold'
                                    }}
                                    placeholder="SAISIR LE TITRE..."
                                />
                            </div>

                            {/* Image Upload Area - Single Background Style */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Image Tactique (Optionnel)</label>

                                {['president', 'coach', 'player'].includes(authorType) ? (
                                    <div style={{
                                        position: 'relative',
                                        border: '2px solid rgba(255, 77, 109, 0.5)',
                                        background: 'rgba(255, 77, 109, 0.05)',
                                        minHeight: '200px',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 0 15px rgba(255, 77, 109, 0.1)'
                                    }}>
                                        {authorType === 'president' && <img src="http://localhost:5000/uploads/players/President.jpg" alt="President" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />}
                                        {authorType === 'coach' && <img src="http://localhost:5000/uploads/players/coach.jpg" alt="Coach" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />}
                                        {authorType === 'player' && <img src={players.find(p => p.id === selectedPlayerId)?.photo_url || 'http://localhost:5000/uploads/default.png'} alt="Player" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />}
                                        <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#ff4d6d', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '2px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            OFFICIAL {authorType.toUpperCase()} IMAGE
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="animate-scale-in"
                                        onClick={() => {
                                            if (!(imageUrl || imageFile)) {
                                                document.getElementById('newsFileInput').click();
                                            }
                                        }}
                                        style={{
                                            position: 'relative',
                                            border: (imageUrl || imageFile) ? '2px solid #DB0A40' : '2px dashed rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.01)',
                                            minHeight: '200px',
                                            borderRadius: '4px',
                                            cursor: (imageUrl || imageFile) ? 'default' : 'pointer',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: '0.2s',
                                            boxShadow: (imageUrl || imageFile) ? '0 0 15px rgba(219, 10, 64, 0.3)' : 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!(imageUrl || imageFile)) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!(imageUrl || imageFile)) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                            }
                                        }}
                                    >
                                        {(imageUrl || imageFile) ? (
                                            <>
                                                <img src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} alt="Visual Asset" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />

                                                {/* Overlay Actions */}
                                                <div style={{
                                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                    background: 'rgba(0,0,0,0.6)', opacity: 0, transition: '0.2s',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px'
                                                }}
                                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setImageFile(null);
                                                            setImageUrl('');
                                                        }}
                                                        title="Remove Asset"
                                                        style={{ background: '#DB0A40', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>REMOVE IMAGE</span>
                                                </div>

                                                <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#DB0A40', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '2px', color: '#fff' }}>
                                                    {imageFile ? 'NEW IMAGE' : 'CURRENT IMAGE'}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                                    <Plus size={32} />
                                                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Click to add visual asset</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#555' }}>(Optional)</span>
                                                </div>
                                            </>
                                        )}

                                        <input 
                                            id="newsFileInput"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setImageFile(e.target.files[0]);
                                                }
                                            }} 
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Dossier / Contenu</label>
                                <div style={{ position: 'relative', flex: 1, minHeight: '200px' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', border: '1px solid rgba(219, 10, 64, 0.1)', background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(219, 10, 64, 0.01) 1px, rgba(219, 10, 64, 0.01) 2px)', opacity: 0.5 }}></div>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows="8"
                                        required
                                        style={{
                                            width: '100%', height: '100%', padding: '15px',
                                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '0', color: '#ccc', resize: 'vertical',
                                            lineHeight: '1.6', fontFamily: 'inherit'
                                        }}
                                        placeholder="Saisir le contenu ou le rapport officiel..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
                            <button
                                type="submit"
                                style={{
                                    background: '#DB0A40', color: '#fff', border: 'none',
                                    padding: '1rem 3rem', borderRadius: '2px', fontWeight: '900',
                                    cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase',
                                    fontSize: '0.85rem', boxShadow: '0 10px 40px rgba(219, 10, 64, 0.2)',
                                    clipPath: 'polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%)',
                                    display: 'flex', alignItems: 'center', gap: '10px'
                                }}
                            >
                                <Check size={18} />
                                {editingArticle ? 'CONFIRMER LES MODIFICATIONS' : 'DIFFUSER LE BULLETIN'}
                            </button>
                        </div>
                    </div>
                </form>
            </TacticalModal>

            {/* News Articles Feed Table */}
            <div style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="var(--accent)" /> Published articles ({regularArticles.length})
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {regularArticles.length > 0 ? (
                        regularArticles.map(article => (
                            <div key={article.id} className="glass-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', borderLeft: article.is_important ? '4px solid var(--accent)' : article.is_presidential ? '4px solid #ff4d6d' : '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                                    {article.image_url ? (
                                        <img src={article.image_url} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.05)' }} />
                                    ) : (
                                        <div style={{ width: '80px', height: '60px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <FileText size={20} color="#444" />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>{article.title}</span>
                                            {Boolean(article.is_important) && <span style={{ background: 'rgba(219, 10, 64, 0.1)', color: 'var(--accent)', border: '1px solid rgba(219, 10, 64, 0.3)', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>À la une</span>}
                                            {(article.author_type === 'president' || Boolean(article.is_presidential)) && <span style={{ background: 'rgba(255, 77, 109, 0.1)', color: '#ff4d6d', border: '1px solid rgba(255, 77, 109, 0.3)', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>THE PRÉSIDENT SAY</span>}
                                            {article.author_type === 'coach' && <span style={{ background: 'rgba(77, 148, 255, 0.1)', color: '#4d94ff', border: '1px solid rgba(77, 148, 255, 0.3)', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>COACH'S CORNER</span>}
                                            {article.author_type === 'player' && <span style={{ background: 'rgba(255, 204, 0, 0.1)', color: '#ffcc00', border: '1px solid rgba(255, 204, 0, 0.3)', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PLAYERS VOICE</span>}
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> {formatDate(article.created_at)}
                                        </span>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#888', lineHeight: '1.5' }}>
                                            {article.content.substring(0, 120)}...
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => handleEditNews(article)}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                                        title="Edit Bulletin"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteNews(article.id)}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#DB0A40'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                                        title="Delete Bulletin"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#555', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            No regular articles have been drafted yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Match Bulletins Feed Table */}
            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} color="var(--accent)" /> Match Bulletins ({matchUpdates.length})
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {matchUpdates.length > 0 ? (
                        matchUpdates.map(article => (
                            <div key={article.id} className="glass-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', borderLeft: article.is_important ? '4px solid var(--accent)' : article.is_presidential ? '4px solid #ff4d6d' : '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                                    {article.image_url ? (
                                        <img src={article.image_url} alt="" style={{ width: '80px', height: '60px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.05)' }} />
                                    ) : (
                                        <div style={{ width: '80px', height: '60px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Calendar size={20} color="#444" />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>{article.title}</span>
                                            <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AUTO MATCH</span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} /> {formatDate(article.created_at)}
                                        </span>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#888', lineHeight: '1.5' }}>
                                            {article.content.substring(0, 120)}...
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => handleEditNews(article)}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                                        title="Edit Match Bulletin"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#555', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            No match updates available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsManager;
