const db = require('./config/db');

async function seedNews() {
    try {
        console.log('Seeding news...');

        const sampleNews = [
            {
                title: 'Préparations pour le prochain match de championnat',
                content: 'L\'équipe première poursuit ses entraînements intensifs au complexe sportif en vue du match décisif de ce week-end. Tous les joueurs sont concentrés sur l\'objectif de victoire.',
                image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200',
                is_important: false,
                is_presidential: false,
                author_type: 'general',
                author_id: 'st1'
            },
            {
                title: 'ALERTE INFO : Nouveau Sponsor Officiel !',
                content: 'HUSA Basketball est fier d\'annoncer un partenariat historique avec notre nouveau sponsor principal. Cet accord majeur permettra de financer le développement de notre académie de jeunes.',
                image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200',
                is_important: true,
                is_presidential: false,
                author_type: 'general',
                author_id: 'st1'
            },
            {
                title: 'Une Vision pour l\'Avenir du Club',
                content: 'Chers supporters, notre ambition est claire : faire de HUSA Basketball le leader incontesté de la région. Les récents investissements dans les infrastructures sportives ne sont que le début d\'une nouvelle ère de domination sur le terrain.',
                image_url: 'http://localhost:5000/uploads/players/President.jpg',
                is_important: false,
                is_presidential: true,
                author_type: 'president',
                author_id: 'st2'
            },
            {
                title: 'Analyse Tactique : La Défense Zone 2-3',
                content: 'Le succès de notre dernier match réside dans l\'application stricte de la défense de zone 2-3. L\'engagement des joueurs et la discipline tactique nous ont permis de bloquer toutes les pénétrations adverses. Nous continuerons à perfectionner ce système.',
                image_url: 'http://localhost:5000/uploads/players/coach.jpg',
                is_important: false,
                is_presidential: false,
                author_type: 'coach',
                author_id: 'st1'
            },
            {
                title: 'Merci aux Supporters pour l\'Ambiance Incroyable !',
                content: 'Jouer dans cette salle avec vous est une sensation magique. Vos chants et votre énergie nous ont poussés à nous dépasser lors du 4ème quart-temps. Cette victoire est aussi la vôtre !',
                image_url: 'http://localhost:5000/uploads/players/default.png', // Fallback, but let's try to get a real player photo if possible, or just default.
                is_important: false,
                is_presidential: false,
                author_type: 'player',
                author_id: 'pl1' // Assuming pl1 exists
            }
        ];

        for (const news of sampleNews) {
            await db.query(
                'INSERT INTO news (title, content, image_url, is_important, is_presidential, author_type, author_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [news.title, news.content, news.image_url, news.is_important, news.is_presidential, news.author_type, news.author_id]
            );
        }

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding news:', error);
        process.exit(1);
    }
}

seedNews();
