const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.initTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS tryouts (
                id VARCHAR(36) PRIMARY KEY,
                applicant_name VARCHAR(255) NOT NULL,
                age INT NOT NULL,
                height VARCHAR(10),
                position VARCHAR(50),
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                experience TEXT,
                file_url VARCHAR(255),
                status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(query);
        console.log('Tryouts table initialized');
    } catch (error) {
        console.error('Error initializing tryouts table:', error);
    }
};

exports.submitTryout = async (req, res) => {
    const { firstName, lastName, email, phone, birthDate, height, position, experience, videoUrl } = req.body;

    // Basic Validation
    if (!firstName || !lastName || !email || !phone || !birthDate || !height || !position) {
        return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
    }

    // Phone Validation (Prevent all 0s)
    const cleanPhone = phone.replace(/[\s\-\+]/g, '');
    if (/^0+$/.test(cleanPhone) || cleanPhone.length < 8) {
        return res.status(400).json({ message: 'Please enter a valid phone number.' });
    }

    // Combine Name
    const applicantName = `${firstName} ${lastName}`;

    // Calculate Age (Roughly)
    const birthDateObj = new Date(birthDate);
    const ageDifMs = Date.now() - birthDateObj.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Height Validation (Ensure unique number)
    if (isNaN(height) || height < 100 || height > 250) {
        return res.status(400).json({ message: 'Please enter a valid height in cm.' });
    }

    try {
        const id = uuidv4();
        const query = `
            INSERT INTO tryouts (id, applicant_name, age, height, position, email, phone, experience, file_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            id,
            applicantName,
            age,
            `${height}cm`,
            position,
            email,
            phone,
            experience,
            videoUrl
        ]);

        res.status(201).json({ message: 'Application submitted successfully!', id });

    } catch (error) {
        console.error('Error submitting tryout:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
