const db = require('./config/db');

async function fix() {
    try {
        const [players] = await db.query('SELECT id, photo_url FROM players LIMIT 1');
        if (players.length > 0) {
            const player = players[0];
            await db.query("UPDATE news SET author_id = ?, image_url = ? WHERE author_id = 'pl1' AND author_type = 'player'", [player.id, player.photo_url]);
            console.log('Fixed player voice news to use real player:', player.id);
        } else {
            console.log('No players found in DB.');
        }
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
fix();
