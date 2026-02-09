const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Placeholder routes
app.get('/', (req, res) => {
    res.send('HUSA Basketball API is running');
});

// Import route files (to be created)
// app.use('/api/news', require('./routes/news'));
// app.use('/api/players', require('./routes/players'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
