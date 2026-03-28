const db = require('../config/db');

exports.initTable = async () => {
    try {
        // 1. Ensure table exists with correct columns
        try {
            const [columns] = await db.query('SHOW COLUMNS FROM news');
            const columnNames = columns.map(c => c.Field);

            if (!columnNames.includes('is_important')) {
                console.log('Old news table detected. Recreating...');
                await db.query('DROP TABLE news');
                throw new Error('Table dropped for recreation');
            }
        } catch (tableError) {
            await db.query(`
                CREATE TABLE IF NOT EXISTS news (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    image_url VARCHAR(255),
                    is_important BOOLEAN DEFAULT FALSE,
                    is_presidential BOOLEAN DEFAULT FALSE,
                    author_id VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }

        // 2. Seed default data if empty
        const [rows] = await db.query('SELECT COUNT(*) as count FROM news');
        if (rows[0].count === 0) {
            await db.query(`
                INSERT INTO news (title, content, image_url, is_important, is_presidential, author_id)
                VALUES 
                ('Victoire Éclatante de HUSA Basketball Face au WAC', 'HUSA a remporté une victoire historique hier soir avec un score de 89-78. Les joueurs ont montré une détermination sans faille...', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200', TRUE, FALSE, 'st2'),
                ('Nouveau Projet Scolaire : Basket-études', 'Le club lance son programme basket-études pour la saison prochaine. Ce projet vise à allier excellence académique et excellence sportive...', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200', FALSE, FALSE, 'st2'),
                ('Note pour les Supporters de HUSA', 'Nous tenons à remercier notre public pour son soutien indéfectible lors des derniers matchs. Ensemble, nous sommes plus forts.', NULL, FALSE, TRUE, 'st2')
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

            // Convert DD/MM/YYYY to JS Date if possible for sorting
            let matchDate = new Date();
            if (m.date && m.date.includes('/')) {
                const [day, month, year] = m.date.split('/');
                matchDate = new Date(`${year}-${month}-${day}T${m.time || '00:00'}:00`);
            }

            return {
                id: `match-${m.id}`,
                title: matchTitle,
                content: `Dans le cadre de la compétition en cours, HUSA Basketball affronte ${opponent}. ${matchStatusText} Une rencontre qui s'annonce intense pour nos joueurs qui comptent sur votre soutien indéfectible.`,
                image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200',
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
    const { title, content, image_url, is_important, is_presidential, author_id } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO news (title, content, image_url, is_important, is_presidential, author_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, content, image_url, is_important || false, is_presidential || false, author_id]
        );
        res.status(201).json({ id: result.insertId, message: 'News added successfully' });
    } catch (error) {
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
