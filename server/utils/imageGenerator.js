const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const generateMatchImage = async (matchId, homeTeam, awayTeam, date, score) => {
    try {
        const width = 1200;
        const height = 630;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Add some tactical lines / design
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        for (let i = 0; i < width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }

        // Accent borders
        ctx.fillStyle = '#DB0A40';
        ctx.fillRect(0, 0, width, 20);
        ctx.fillRect(0, height - 20, width, 20);

        // Title text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = 'bold 50px sans-serif';
        ctx.fillText('MATCHDAY BULLETIN', width / 2, 60);

        // Load logos
        const logosDir = path.join(__dirname, '../uploads/logos');
        const defaultLogoPath = path.join(logosDir, 'HUSA.png'); // fallback
        
        let homeLogoPath = path.join(logosDir, `${homeTeam}.png`);
        if (!fs.existsSync(homeLogoPath)) homeLogoPath = defaultLogoPath;
        
        let awayLogoPath = path.join(logosDir, `${awayTeam}.png`);
        if (!fs.existsSync(awayLogoPath)) awayLogoPath = defaultLogoPath;

        const homeLogo = await loadImage(homeLogoPath);
        const awayLogo = await loadImage(awayLogoPath);

        // Draw logos
        const logoSize = 300;
        ctx.drawImage(homeLogo, 200, 165, logoSize, logoSize);
        ctx.drawImage(awayLogo, width - 200 - logoSize, 165, logoSize, logoSize);

        // "VS" Text
        ctx.fillStyle = '#DB0A40';
        ctx.font = 'bold 80px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('VS', width / 2, height / 2);

        // Match Info
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '30px sans-serif';
        if (score && score !== '-') {
            ctx.fillText(`SCORE: ${score}`, width / 2, height - 120);
        } else {
            ctx.fillText(`DATE: ${date || 'TBD'}`, width / 2, height - 120);
        }

        // Team Names
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText(homeTeam, 350, 490);
        ctx.fillText(awayTeam, width - 350, 490);

        // Save image
        const newsDir = path.join(__dirname, '../uploads/news');
        if (!fs.existsSync(newsDir)) {
            fs.mkdirSync(newsDir, { recursive: true });
        }
        
        const fileName = `auto_match_${matchId}.png`;
        const filePath = path.join(newsDir, fileName);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filePath, buffer);
        
        return `/uploads/news/${fileName}`;
    } catch (error) {
        console.error('Error generating match image:', error);
        return null; // return null if generation fails
    }
};

module.exports = { generateMatchImage };
