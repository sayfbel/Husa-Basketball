const db = require('../config/db');

exports.initTable = async () => {
    try {
        // 1. Ensure table exists with correct columns
        try {
            await db.query('SELECT COUNT(*) FROM news'); 
        } catch (tableError) {
            if (tableError.errno === 1932) {
                console.error('Recovering news table from engine error...');
                try { await db.query('DROP TABLE IF EXISTS news'); } catch (e) {}
            }
            await db.query(`
                CREATE TABLE IF NOT EXISTS news (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    image_url VARCHAR(255),
                    is_important BOOLEAN DEFAULT FALSE,
                    is_presidential BOOLEAN DEFAULT FALSE,
                    author_type VARCHAR(50) DEFAULT 'general',
                    author_id VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            }

        try {
            await db.query("ALTER TABLE news ADD COLUMN author_type VARCHAR(50) DEFAULT 'general'");
            await db.query("UPDATE news SET author_type = 'president' WHERE is_presidential = TRUE");
        } catch (e) {}

        try {
            await db.query("ALTER TABLE news ADD COLUMN author_id VARCHAR(50)");
        } catch (e) {}

        // 2. Seed default data if empty
        const [rows] = await db.query('SELECT COUNT(*) as count FROM news');
        if (rows[0].count === 0) {
            await db.query(`
                INSERT INTO news (title, content, image_url, is_important, author_type, author_id)
                VALUES 
                ('Victoire Éclatante de HUSA Basketball Face au WAC', 'HUSA a remporté une victoire historique hier soir avec un score de 89-78. Les joueurs ont montré une détermination sans faille...', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200', TRUE, 'general', 'st2'),
                ('Nouveau Projet Scolaire : Basket-études', 'Le club lance son programme basket-études pour la saison prochaine. Ce projet vise à allier excellence académique et excellence sportive...', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200', FALSE, 'general', 'st2'),
                ('Note pour les Supporters de HUSA', 'Nous tenons à remercier notre public pour son soutien indéfectible lors des derniers matchs. Ensemble, nous sommes plus forts.', NULL, FALSE, 'president', 'st2')
            `);
        }
    } catch (error) {
        console.error('Error during news table initialization:', error);
    }
};

exports.getAllNews = async (req, res) => {
    try {
        const [news] = await db.query('SELECT * FROM news ORDER BY created_at DESC');
        const [matches] = await db.query('SELECT * FROM match_schedule');

        // Transform matches into news format
        const matchNews = matches.map(m => {
            const isHusaHome = m.home.includes('HUSA') || m.home.includes('Hassania');
            const opponent = isHusaHome ? m.away : m.home;
            const matchTitle = isHusaHome ? `Dominateur à Domicile : HUSA reçoit ${opponent}` : `En Déplacement : HUSA défie ${opponent}`;
            
            let matchStatusText = "";
            if (m.score && m.score !== '-') {
                matchStatusText = `Le match s'est terminé sur un score de ${m.score}.`;
            } else {
                matchStatusText = `Le match aura lieu le ${m.date} à ${m.time} au ${m.venue}. Venez nombreux !`;
            }
            const fullDefaultContent = `Dans le cadre de la compétition en cours, HUSA Basketball affronte ${opponent}. ${matchStatusText} Une rencontre qui s'annonce intense pour nos joueurs qui comptent sur votre soutien indéfectible.`;

            // Convert DD/MM/YYYY to JS Date if possible for sorting
            let matchDate = new Date();
            if (m.date && m.date.includes('/')) {
                const [day, month, year] = m.date.split('/');
                matchDate = new Date(`${year}-${month}-${day}T${m.time || '00:00'}:00`);
            }

            return {
                id: `match-${m.id}`,
                title: m.news_title || matchTitle,
                content: m.news_content || fullDefaultContent,
                image_url: m.news_image_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200',
                is_important: false,
                is_presidential: false,
                author_id: 'system',
                created_at: m.updated_at || matchDate
            };
        });

        const combined = [...news, ...matchNews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(combined);
    } catch (error) {
        console.error('Error fetching combined news:', error);
        res.status(500).json({ message: 'Error fetching combined news' });
    }
};

exports.addNews = async (req, res) => {
    const { title, content, is_important, author_type, author_id } = req.body;
    let image_url = null;
    
    try {
        if (author_type === 'president') {
            image_url = 'http://localhost:5000/uploads/players/President.jpg';
        } else if (author_type === 'coach') {
            image_url = 'http://localhost:5000/uploads/players/coach.jpg';
        } else if (author_type === 'player') {
            const [playerRows] = await db.query('SELECT photo_url FROM players WHERE id = ?', [author_id]);
            if (playerRows.length > 0) {
                image_url = playerRows[0].photo_url;
            }
        } else if (req.file) {
            image_url = `http://localhost:5000/uploads/news/${req.file.filename}`;
        }

        const [result] = await db.query(
            'INSERT INTO news (title, content, image_url, is_important, is_presidential, author_type, author_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, content, image_url, is_important === 'true' || is_important === true, author_type === 'president', author_type || 'general', author_id]
        );
        res.status(201).json({ id: result.insertId, message: 'News added successfully' });
    } catch (error) {
        console.error('Error adding news:', error);
        res.status(500).json({ message: 'Error adding news' });
    }
};

exports.deleteNews = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM news WHERE id = ?', [id]);
        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting news' });
    }
};

exports.updateNews = async (req, res) => {
    const { id } = req.params;
    const { title, content, is_important, author_type, author_id } = req.body;
    let image_url = null;
    
    try {
        if (author_type === 'president') {
            image_url = 'http://localhost:5000/uploads/players/President.jpg';
        } else if (author_type === 'coach') {
            image_url = 'http://localhost:5000/uploads/players/coach.jpg';
        } else if (author_type === 'player') {
            const [playerRows] = await db.query('SELECT photo_url FROM players WHERE id = ?', [author_id]);
            if (playerRows.length > 0) {
                image_url = playerRows[0].photo_url;
            }
        } else if (req.file) {
            image_url = `http://localhost:5000/uploads/news/${req.file.filename}`;
        }

        if (id.startsWith('match-')) {
            const matchId = id.replace('match-', '');
            if (image_url) {
                await db.query(
                    'UPDATE match_schedule SET news_title = ?, news_content = ?, news_image_url = ? WHERE id = ?',
                    [title, content, image_url, matchId]
                );
            } else {
                await db.query(
                    'UPDATE match_schedule SET news_title = ?, news_content = ? WHERE id = ?',
                    [title, content, matchId]
                );
            }
            res.json({ message: 'News updated successfully' });
            return;
        }

        if (image_url) {
            await db.query(
                'UPDATE news SET title = ?, content = ?, image_url = ?, is_important = ?, is_presidential = ?, author_type = ?, author_id = ? WHERE id = ?',
                [title, content, image_url, is_important === 'true' || is_important === true, author_type === 'president', author_type || 'general', author_id, id]
            );
        } else {
            await db.query(
                'UPDATE news SET title = ?, content = ?, is_important = ?, is_presidential = ?, author_type = ?, author_id = ? WHERE id = ?',
                [title, content, is_important === 'true' || is_important === true, author_type === 'president', author_type || 'general', author_id, id]
            );
        }
        res.json({ message: 'News updated successfully' });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ message: 'Error updating news' });
    }
};
