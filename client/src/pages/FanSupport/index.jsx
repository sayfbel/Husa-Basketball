import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/fan.css';
import RedJerseyFlyer from '../../assets/images/T-shirts/542207433_17887122501357067_4280698276740856535_n..jpg';
import RedJerseyPhoto from '../../assets/images/T-shirts/540271147_17886699834357067_1641371197587090454_n..jpg';
import WhiteJerseyFlyer from '../../assets/images/T-shirts/Gemini_Generated_Image_ceomz6ceomz6ceom.png';
import WhiteJerseyPhoto from '../../assets/images/T-shirts/e37a7414-1b79-4bc6-8769-c7858fbe33b4.png';
import SelectorCard from '../../components/SelectorCard/SelectorCard';

import husaLogo from '../../assets/images/husa_logo.jpg';
// Try to deliver a real logo for the opponent if possible, or use a high-quality placeholder
const wydadLogo = "https://upload.wikimedia.org/wikipedia/en/2/2c/Wydad_Athletic_Club_logo.png";

const FanSupport = () => {
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Form State
    const [formData, setFormData] = React.useState({
        name: '',
        location: '',
        phone: '',
        size: 'M',
        color: 'Red'
    });

    const products = [
        {
            id: 1,
            name: "HUSA Official Kit (Promo)",
            price: "150 DH",
            image: RedJerseyFlyer,
            variants: {
                Red: RedJerseyFlyer,
                White: WhiteJerseyFlyer
            }
        },
        {
            id: 2,
            name: "HUSA Official Kit (Match)",
            price: "250 DH",
            image: RedJerseyPhoto,
            variants: {
                Red: RedJerseyPhoto,
                White: WhiteJerseyPhoto
            }
        }
    ];

    const matchDetails = {
        date: "Saturday, 24 Feb",
        time: "19:00",
        opponent: "Wydad AC",
        location: "Salle Al Inbiaat, Agadir"
    };

    const handleBuyClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
        // Pre-select color based on product name
        if (product.name.toLowerCase().includes('white')) {
            setFormData(prev => ({ ...prev, color: 'White' }));
        } else {
            setFormData(prev => ({ ...prev, color: 'Red' }));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Validation for Moroccan phone
        const phoneRegex = /^(?:\+212|0)([5-7])\d{8}$/;
        if (!phoneRegex.test(formData.phone)) {
            alert("Please enter a valid Moroccan phone number (e.g., 06xxxxxxxx or +2126xxxxxxxx)");
            return;
        }

        const orderData = {
            product_name: selectedProduct.name,
            price: selectedProduct.price,
            customer_name: formData.name,
            location: formData.location,
            phone: formData.phone,
            size: formData.size,
            color: formData.color
        };

        axios.post('http://localhost:5000/api/store-reservations', orderData)
            .then(res => {
                setIsModalOpen(false);
                // Reset form
                setFormData({ name: '', location: '', phone: '', size: 'M', color: 'Red' });
                // Redirect to thanks page
                navigate('/thanks');
            })
            .catch(err => {
                console.error("Error saving order:", err);
                alert("There was an error processing your order. Please try again later.");
            });
    };

    return (
        <>
            <div className="fan-page animate-fade-in">
                {/* Hero Section */}
                <div className="fan-hero">
                    <div className="container">
                        <h1>Fan Zone</h1>
                        <p>Wear the colors. Support the team.</p>
                    </div>
                </div>

                <div className="container">
                    {/* Store Section */}
                    <section className="store-section">
                        <h2 className="section-title">Official Store</h2>
                        <div className="products-grid">
                            {products.map(product => (
                                <div key={product.id} className="product-card">
                                    <div className="product-image-container">
                                        <img src={product.image} alt={product.name} className="product-image" />
                                        <div className="product-overlay">
                                            <button className="btn-buy" onClick={() => handleBuyClick(product)}>Buy Now</button>
                                        </div>
                                    </div>
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <span className="price">{product.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>



                    <div className="match-info-grid">
                        {/* Next Match Card */}
                        <section className="match-card">
                            <h2 className="section-title">Next Match</h2>
                            <div className="match-content">
                                <div className="team home">
                                    <img src={husaLogo} alt="HUSA Logo" className="team-logo" />
                                    <span className="team-name">HUSA</span>
                                </div>
                                <div className="vs-container">
                                    <span className="vs-text">VS</span>
                                </div>
                                <div className="team away">
                                    <img src={wydadLogo} alt="Wydad AC Logo" className="team-logo" />
                                    <span className="team-name">{matchDetails.opponent}</span>
                                </div>
                            </div>
                            <div className="match-time-info">
                                <div className="time-item">
                                    <i className="icon-calendar"></i>
                                    <span>{matchDetails.date}</span>
                                </div>
                                <div className="time-item">
                                    <i className="icon-clock"></i>
                                    <span>{matchDetails.time}</span>
                                </div>
                            </div>
                        </section>

                        {/* Map Section */}
                        <section className="map-card">
                            <h2 className="section-title">Match Location</h2>
                            <p className="location-text">{matchDetails.location}</p>
                            <div className="map-container">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13768.878564758532!2d-9.5539744!3d30.4199543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdb3b6f000000001%3A0x8c0c0c0c0c0c0c0c!2sSalle%20Al%20Inbiaat!5e0!3m2!1sen!2sma!4v1707480000000!5m2!1sen!2sma"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Match Location"
                                ></iframe>
                            </div>
                        </section>
                    </div>

                    {/* Ticket Section */}
                    <section className="ticket-section animate-slide-up">
                        <h2 className="section-title">Get Your Ticket</h2>
                        <div className="ticket-container">
                            <div className="ticket-visual">
                                <div className="ticket-left">
                                    <div className="ticket-bg-pattern"></div>
                                    <div className="ticket-header">
                                        <span className="ticket-league">Botola Pro Basketball</span>
                                        <span className="ticket-season">Season 2025/2026</span>
                                    </div>
                                    <div className="ticket-body">
                                        <div className="ticket-teams">
                                            <div className="t-team">
                                                <span className="t-name">HUSA</span>
                                                <img src={husaLogo} alt="HUSA" className="t-logo" />
                                            </div>
                                            <div className="t-vs">VS</div>
                                            <div className="t-team">
                                                <img src={wydadLogo} alt="WAC" className="t-logo" />
                                                <span className="t-name">WAC</span>
                                            </div>
                                        </div>
                                        <div className="ticket-info-row">
                                            <div className="info-item">
                                                <span className="label">Date</span>
                                                <span className="value">{matchDetails.date}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Time</span>
                                                <span className="value">{matchDetails.time}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Venue</span>
                                                <span className="value">Salle Al Inbiaat</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="ticket-right">
                                    <div className="ticket-price-container">
                                        <span className="ticket-price-label">Price</span>
                                        <span className="ticket-price-value">20 DH</span>
                                    </div>
                                    <div className="barcode-container">
                                        <div className="barcode"></div>
                                    </div>
                                    <div className="ticket-cut-line"></div>
                                </div>

                            </div>

                        </div>

                    </section>
                </div>
            </div>
            <div className="contact-for-tikite">
                +212 6 66 66 66 66
            </div>

            {/* Purchase Modal (Outside fan-page to fill screen) */}
            {isModalOpen && (
                <div className="purchase-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="purchase-modal-card" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>

                        <div className="modal-content-grid">
                            <div className="product-preview-side">
                                <img
                                    src={selectedProduct.variants ? selectedProduct.variants[formData.color] : selectedProduct.image}
                                    alt={selectedProduct.name}
                                />
                                <div className="preview-info">
                                    <h3>{selectedProduct.name}</h3>
                                    <span className="preview-price">{selectedProduct.price}</span>
                                </div>
                            </div>

                            <div className="order-form-side">
                                <h2>Complete Your Order</h2>
                                <form onSubmit={handleFormSubmit}>
                                    <div className="form-group-fashion">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div className="form-group-fashion">
                                        <label>Delivery Location</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="City, Neighborhood..."
                                        />
                                    </div>

                                    <div className="form-group-fashion">
                                        <label>Phone Number (Morocco)</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="06 / 07 xxxxxxxx"
                                        />
                                    </div>

                                    <div className="form-row-fashion">
                                        <div className="form-group-fashion" style={{ zIndex: 10 }}>
                                            <SelectorCard
                                                label="Size"
                                                options={['S', 'M', 'L', 'XL', 'XXL']}
                                                value={formData.size}
                                                onChange={val => setFormData({ ...formData, size: val })}
                                                placeholder="Select Size"
                                            />
                                        </div>

                                        <div className="form-group-fashion">
                                            <label>Color</label>
                                            <div className="color-options-fashion">
                                                <label className={`color-opt ${formData.color === 'Red' ? 'active' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name="color"
                                                        value="Red"
                                                        checked={formData.color === 'Red'}
                                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                                    />
                                                    <span className="dot red"></span> Red
                                                </label>
                                                <label className={`color-opt ${formData.color === 'White' ? 'active' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name="color"
                                                        value="White"
                                                        checked={formData.color === 'White'}
                                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                                    />
                                                    <span className="dot white"></span> White
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-confirm-order">Confirm Purchase</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FanSupport;
