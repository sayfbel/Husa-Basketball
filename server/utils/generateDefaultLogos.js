const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const teams = ['HUSA', 'ACSMM', 'RCOZ', 'WSC', 'OCK', 'OCY', 'CSBA', 'RSS', 'COJ', 'TEST TEAM'];

const logosDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
}

teams.forEach(team => {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');

    // Background circle
    ctx.fillStyle = team === 'HUSA' ? '#DB0A40' : '#222222';
    ctx.beginPath();
    ctx.arc(100, 100, 95, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 40px sans-serif';
    
    // Split long names
    if (team.includes(' ')) {
        const parts = team.split(' ');
        ctx.fillText(parts[0], 100, 80);
        ctx.fillText(parts[1], 100, 120);
    } else {
        ctx.fillText(team, 100, 100);
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(logosDir, `${team}.png`), buffer);
    console.log(`Generated default logo for ${team}`);
});

console.log('All default logos generated successfully.');
