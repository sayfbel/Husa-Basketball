CREATE DATABASE IF NOT EXISTS husa_basketball;
USE husa_basketball;

-- Users table (Admins)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Player', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News/Media Posts
CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category ENUM('match', 'training', 'announcement') NOT NULL,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    is_instagram_embed BOOLEAN DEFAULT FALSE,
    external_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(36) PRIMARY KEY,
    opponent VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    result ENUM('win', 'loss', 'draw', 'scheduled') DEFAULT 'scheduled',
    score_husa INT,
    score_opponent INT,
    location VARCHAR(255),
    competition VARCHAR(255),
    season VARCHAR(20),
    strategy_id VARCHAR(36), -- Link to a tactical system
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match Lineups (Linking Players to Matches)
CREATE TABLE IF NOT EXISTS match_lineups (
    match_id VARCHAR(36) NOT NULL,
    player_id VARCHAR(36) NOT NULL,
    is_starter BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (match_id, player_id),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Players/Squad
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(50) NOT NULL,
    jersey_number INT,
    height VARCHAR(10),
    weight VARCHAR(10),
    age INT,
    photo_url VARCHAR(255),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Members
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    department ENUM('coaching', 'medical', 'office') NOT NULL,
    photo_url VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kids Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id VARCHAR(36) PRIMARY KEY,
    child_name VARCHAR(255) NOT NULL,
    age_category VARCHAR(50) NOT NULL,
    parent_name VARCHAR(255) NOT NULL,
    parent_email VARCHAR(255) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    training_availability VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tryout Applications
CREATE TABLE IF NOT EXISTS tryouts (
    id VARCHAR(36) PRIMARY KEY,
    applicant_name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    height VARCHAR(10),
    position VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    experience TEXT,
    file_url VARCHAR(255), -- CV or video link
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fan Messages
CREATE TABLE IF NOT EXISTS fan_messages (
    id VARCHAR(36) PRIMARY KEY,
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    photo_url VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE, -- Moderation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
