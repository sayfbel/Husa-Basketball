import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../components/Notification/Notification';
import { Plus, Edit2, Trash2, ShoppingBag, Tag, Image as ImageIcon, X, Check, DollarSign, UploadCloud, Star, ArrowUp } from 'lucide-react';
import '../../../css/dashboard.css';
import '../css/overview.css';
import TacticalModal from '../../../components/UI/TacticalModal';
import TacticalSelect from '../../../components/UI/TacticalSelect';

import husaLogo from '../../../assets/images/colabs/husa_logo.jpg';

const StoreManager = () => {
    const { showNotification, showConfirm } = useNotification();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: 'Kit',
        in_stock: true
    });

    // Unified Asset Management: { type: 'existing'|'new', url/preview: string, file?: File, id: string }
    const [assets, setAssets] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/store?t=${Date.now()}`);
            const processed = res.data.map(p => {
                let images = [];
                try {
                    images = JSON.parse(p.image_url);
                    if (!Array.isArray(images)) images = [p.image_url];
                } catch (e) {
                    images = p.image_url ? [p.image_url] : [];
                }
                images = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
                return { ...p, images };
            });
            setProducts(processed);
        } catch (err) {
            console.error(err);
            showNotification("Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newAssets = files.map((file, index) => ({
            type: 'new',
            file,
            preview: URL.createObjectURL(file), // Generate updated preview
            id: `new-${Date.now()}-${index}`
        }));

        setAssets(prev => [...prev, ...newAssets]);
        // Reset input to allow selecting same files again if needed
        e.target.value = '';
    };

    const handleRemoveAsset = (index) => {
        setAssets(prev => {
            const newAssets = [...prev];
            const removed = newAssets.splice(index, 1)[0];
            if (removed.type === 'new') {
                URL.revokeObjectURL(removed.preview);
            }
            return newAssets;
        });
    };

    const handleSetPrimary = (index) => {
        if (index === 0) return; // Already primary
        setAssets(prev => {
            const newAssets = [...prev];
            const [item] = newAssets.splice(index, 1);
            newAssets.unshift(item);
            return newAssets;
        });
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            price: '',
            description: '',
            category: 'Kit',
            in_stock: true
        });
        setAssets([]);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description || '',
            category: product.category || 'Kit',
            in_stock: product.in_stock === 1 || product.in_stock === true
        });

        // Initialize assets from existing images
        const existingAssets = (product.images || []).map((url, idx) => ({
            type: 'existing',
            url,
            preview: url,
            id: `existing-${idx}`
        }));
        setAssets(existingAssets);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('in_stock', formData.in_stock);

        // Advanced Asset Handling
        // 1. Append valid new files to formData
        const newFiles = assets.filter(a => a.type === 'new').map(a => a.file);
        newFiles.forEach(file => {
            data.append('images', file);
        });

        // 2. Construct Image Order Manifest
        const imageOrder = assets.map(asset => {
            if (asset.type === 'existing') {
                return `existing:${asset.url}`;
            } else {
                return 'new'; // Matches the order of appended 'images'
            }
        });

        data.append('image_order', JSON.stringify(imageOrder));

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            if (editingProduct) {
                await axios.put(`http://localhost:5000/api/store/${editingProduct.id}`, data, config);
                showNotification("Product updated successfully", "success");
            } else {
                await axios.post('http://localhost:5000/api/store', data, config);
                showNotification("Product created successfully", "success");
            }
            setShowModal(false);
            await fetchProducts();
        } catch (err) {
            console.error(err);
            showNotification("Failed to save product", "error");
        }
    };

    const handleDelete = (id) => {
        showConfirm("Are you sure you want to delete this product?", async () => {
            try {
                await axios.delete(`http://localhost:5000/api/store/${id}`);
                showNotification("Product deleted successfully", "success");
                fetchProducts();
            } catch (err) {
                showNotification("Failed to delete product", "error");
            }
        });
    };

    if (loading) return <div className="loading-spinner">Loading Store Inventory...</div>;

    return (
        <div className="overview-container dashboard-fashion-theme animate-fade-in">
            {/* Header */}
            <div className="section-header-modern">
                <div className="watermark-bg">STORE</div>

                <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, pointerEvents: 'none' }}>
                    <img src={husaLogo} alt="HUSA" style={{ width: '150px' }} />
                </div>

                <div className="header-content-box">
                    <span className="premium-label">MERCHANDISE CONTROL</span>
                    <h1 className="hero-dashboard-title">
                        TEAM <br />
                        <span className="accent-text">PRODUCTS</span>
                    </h1>
                    <div className="header-status-bar">
                        <div className="status-item">
                            <ShoppingBag size={14} />
                            <span>{products.length} ITEMS LISTED</span>
                        </div>
                    </div>
                </div>
                <button className="intel-btn-primary" onClick={openAddModal} style={{ marginLeft: 'auto', height: 'fit-content' }}>
                    <Plus size={18} style={{ marginRight: '8px' }} /> ADD PRODUCT
                </button>
            </div>

            {/* Products Grid */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {products.map(product => (
                    <div key={product.id} className="intel-card product-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* Image Area */}
                        <div style={{
                            height: '250px',
                            background: '#1a1a1a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <ImageIcon size={48} style={{ opacity: 0.2 }} />
                            )}

                            {/* Gallery Indicator */}
                            {product.images && product.images.length > 1 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <ImageIcon size={12} /> +{product.images.length - 1}
                                </div>
                            )}

                            {!product.in_stock && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: '#DB0A40',
                                    color: 'white',
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                }}>
                                    OUT OF STOCK
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>{product.category}</div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{product.name}</h3>
                                </div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#DB0A40' }}>
                                    {product.price} <span style={{ fontSize: '0.8rem' }}>DH</span>
                                </div>
                            </div>

                            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: '1.5rem' }}>
                                {product.description || 'No description provided.'}
                            </p>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                <button
                                    onClick={() => openEditModal(product)}
                                    style={{
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.05)',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    style={{
                                        background: 'rgba(219, 10, 64, 0.1)',
                                        border: '1px solid rgba(219, 10, 64, 0.3)',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        color: '#DB0A40',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tactical Dossier Style Modal with Reusable Component */}
            <TacticalModal isOpen={showModal} onClose={() => setShowModal(false)}>
                <form onSubmit={handleSubmit} style={{ display: 'contents' }}>

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
                                <span style={{ fontSize: '0.65rem', letterSpacing: '3px', color: '#DB0A40', fontWeight: '900' }}>PRODUCT DOSSIER</span>
                            </div>
                            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-2px', lineHeight: 0.9, textTransform: 'uppercase' }}>
                                MERCH<br /><span style={{ color: 'rgba(255,255,255,0.3)' }}>LOG</span>
                            </h1>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                            {/* Price Input */}
                            <div style={{ opacity: 1 }}>
                                <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '8px' }}>UNIT_COST (DH)</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#DB0A40' }} />
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%', padding: '12px 12px 12px 36px',
                                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '0', color: 'white', fontWeight: 'bold', fontSize: '1.1rem',
                                            borderLeft: '2px solid #DB0A40'
                                        }}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Category Select */}
                            <div style={{ opacity: 1 }}>
                                <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '8px' }}>CLASSIFICATION</label>
                                <TacticalSelect
                                    name="category"
                                    value={formData.category}
                                    onChange={(data) => {
                                        // The TacticalSelect returns { target: { name, value } } if we wrote it that way,
                                        // OR it mimics usage. Let's re-check the component code I just wrote.
                                        // Yes, handleSelect calls onChange({ target: { name, value } });
                                        // So passing handleInputChange directly works if it expects e.target.
                                        // The component passes { target: { name, value } }.
                                        // handleInputChange does: const { name, value, ... } = e.target;
                                        // So it matches perfectly.
                                        handleInputChange(data);
                                    }}
                                    options={[
                                        { value: 'Kit', label: 'KIT / UNIFORM' },
                                        { value: 'Apparel', label: 'APPAREL / WEAR' },
                                        { value: 'Accessories', label: 'ACCESSORIES' },
                                        { value: 'Training', label: 'TRAINING GEAR' }
                                    ]}
                                />
                            </div>

                            {/* Stock Checkbox */}
                            <div style={{ opacity: 1, marginTop: '1rem' }}>
                                <label style={{ fontSize: '0.6rem', color: '#666', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '8px' }}>INVENTORY_STATUS</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <input
                                        type="checkbox"
                                        name="in_stock"
                                        checked={formData.in_stock}
                                        onChange={handleInputChange}
                                        id="inStockCheck"
                                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#DB0A40' }}
                                    />
                                    <label htmlFor="inStockCheck" style={{ color: formData.in_stock ? '#fff' : '#666', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        {formData.in_stock ? 'AVAILABLE' : 'OUT_OF_STOCK'}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', fontSize: '0.55rem', color: '#444', letterSpacing: '2px', fontFamily: 'monospace' }}>
                            SYSTEM_ID: {editingProduct ? editingProduct.id.substring(0, 8).toUpperCase() : 'NEW_ENTRY'}<br />
                            STATUS: {editingProduct ? 'MODIFICATION' : 'CREATION'}<br />
                            ORIGIN: HUSA_STORE_OPS
                        </div>
                    </div>

                    {/* RIGHT SIDE: COMPOSITION AREA */}
                    <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Product Detail Input</h2>
                                <p style={{ color: '#555', fontSize: '0.75rem', margin: '4px 0 0 0' }}>Define visual and textual parameters for the store front.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', width: '36px', height: '36px', borderRadius: '4px', color: '#777', cursor: 'pointer', transition: '0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#DB0A40'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#777'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                            {/* Name Input */}
                            <div>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Product Designation</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%', padding: '15px',
                                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0', color: 'white', fontSize: '1.2rem', fontWeight: 'bold'
                                    }}
                                    placeholder="ENTER PRODUCT NAME..."
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Description & Specs</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', border: '1px solid rgba(219, 10, 64, 0.1)', background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(219, 10, 64, 0.01) 1px, rgba(219, 10, 64, 0.01) 2px)', opacity: 0.5 }}></div>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="5"
                                        style={{
                                            width: '100%', padding: '15px',
                                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '0', color: '#ccc', resize: 'vertical', minHeight: '120px',
                                            lineHeight: '1.6'
                                        }}
                                        placeholder="Technical specifications and details..."
                                    />
                                </div>
                            </div>

                            {/* Image Upload Area - Integrated Style */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Visual Assets</label>

                                <div style={{
                                    border: '2px dashed rgba(255,255,255,0.1)',
                                    padding: '1.5rem',
                                    background: 'rgba(255,255,255,0.01)', // Match container
                                    minHeight: '200px'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px' }}>
                                        {/* Existing Assets */}
                                        {assets.map((asset, index) => (
                                            <div key={asset.id} className="animate-scale-in" style={{
                                                position: 'relative',
                                                aspectRatio: '1',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                border: index === 0 ? '2px solid #DB0A40' : '1px solid rgba(255,255,255,0.2)',
                                                boxShadow: index === 0 ? '0 0 15px rgba(219, 10, 64, 0.3)' : 'none'
                                            }}>
                                                <img src={asset.preview} alt={`Asset ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                                                {/* Overlay Actions */}
                                                <div style={{
                                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                    background: 'rgba(0,0,0,0.4)', opacity: 0, transition: '0.2s',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                }}
                                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                                >
                                                    {index !== 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetPrimary(index)}
                                                            title="Set as Primary Cover"
                                                            style={{ background: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}
                                                        >
                                                            <ArrowUp size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAsset(index)}
                                                        title="Remove Asset"
                                                        style={{ background: '#DB0A40', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                {/* Primary Badge */}
                                                {index === 0 && (
                                                    <div style={{ position: 'absolute', top: '5px', left: '5px', background: '#DB0A40', padding: '2px 6px', fontSize: '0.6rem', fontWeight: 'bold', borderRadius: '2px' }}>
                                                        MAIN
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add Button Tile */}
                                        <div
                                            onClick={() => document.getElementById('fileInput').click()}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '4px',
                                                aspectRatio: '1',
                                                color: '#888',
                                                border: '1px dashed rgba(255,255,255,0.2)',
                                                cursor: 'pointer',
                                                transition: '0.2s'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#888'; }}
                                        >
                                            <Plus size={24} />
                                            <span style={{ fontSize: '0.7rem', marginTop: '4px', textTransform: 'uppercase' }}>Add</span>
                                        </div>
                                    </div>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />

                                    {assets.length === 0 && (
                                        <p style={{ margin: '1rem 0 0 0', color: '#aaa', fontSize: '0.8rem', textAlign: 'center' }}>
                                            No visuals uploaded. Add images to define the product look.
                                        </p>
                                    )}
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
                                {editingProduct ? 'Confirm Updates' : 'Initialize Product'}
                            </button>
                        </div>
                    </div>
                </form>
            </TacticalModal>
        </div>
    );
};

export default StoreManager;
