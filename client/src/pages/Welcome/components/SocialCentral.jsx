import React from 'react';
import '../css/social-central.css';
import instaFeedImage from '../../../assets/images/insta_feed_mockup.png';
import postImage1 from '../../../assets/images/match_post.jpg';
import postImage2 from '../../../assets/images/victory_post.jpg';
import husaLogo from '../../../assets/images/husa_logo.jpg';

const SocialCentral = () => {
    return (
        <section className="social-section">
            <div className="social-bg-gradient"></div>

            <div className="social-container">
                {/* Visual Mockup */}
                <div className="mockup-wrapper animate-fade-in">
                    <div className="phone-mockup">
                        <img
                            src={instaFeedImage}
                            alt="HUSA Instagram Feed"
                            className="mockup-image"
                            style={{ height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="social-content">
                    <span className="social-label">Join The Community</span>
                    <h2 className="social-title">Follow The Pride</h2>
                    <p className="social-description">
                        Get exclusive behind-the-scenes access, live match updates, and player takeovers.
                        Join 15,000+ fans on our official social channels.
                    </p>

                    {/* Posts Preview Grid */}
                    <div className="posts-preview">
                        {/* Post 1 */}
                        <a href="https://www.instagram.com/p/DTado0NiJPW/?img_index=1" target="_blank" rel="noopener noreferrer" className="post-card-link">
                            <div className="post-card">
                                <div className="post-header">
                                    <div className="post-avatar">
                                        <img src={husaLogo} alt="HUSA Basketball" />
                                    </div>
                                    <div>
                                        <div className="post-user">husabasketball</div>
                                        <div className="post-meta">Official</div>
                                    </div>
                                </div>
                                <div className="post-image-placeholder">
                                    <img src={postImage1} alt="HUSA Post 1" />
                                </div>
                                <div className="post-caption">
                                    🏀 Match Highlights & Great Moments. Check out the latest action from our squad! #DIMAHUSA #Agadir
                                </div>
                            </div>
                        </a>

                        {/* Post 2 */}
                        <a href="https://www.instagram.com/p/DRF8j8fjUL4/?img_index=1" target="_blank" rel="noopener noreferrer" className="post-card-link">
                            <div className="post-card">
                                <div className="post-header">
                                    <div className="post-avatar">
                                        <img src={husaLogo} alt="HUSA Basketball" />
                                    </div>
                                    <div>
                                        <div className="post-user">husabasketball</div>
                                        <div className="post-meta">Official</div>
                                    </div>
                                </div>
                                <div className="post-image-placeholder">
                                    <img src={postImage2} alt="Victory vs ASCMM" />
                                </div>
                                <div className="post-caption">
                                    ⚪️🔴 HIGHLIGHT TODAY GAME VS ASCMM #Victory. Strong performance securing the win! #HUSAWIN
                                </div>
                            </div>
                        </a>
                    </div>

                    <div className="social-buttons">
                        <a href="https://www.instagram.com/husabasketball/" target="_blank" rel="noopener noreferrer" className="btn-social btn-insta">
                            <span className="material-icons-outlined">photo_camera</span> Follow on Instagram
                        </a>
                        <a href="https://www.facebook.com/p/HUSA-Basketball-100079564001494/" target="_blank" rel="noopener noreferrer" className="btn-social btn-fb">
                            <span className="material-icons-outlined">facebook</span> Like on Facebook
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SocialCentral;
