const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API routes - load handler functions
const saveJournal = require('./api/save-journal.js');
const loadJournal = require('./api/load-journal.js');
const generateArt = require('./api/generate-art.js');

// Mount API endpoints
app.post('/api/save-journal', saveJournal);
app.get('/api/load-journal', loadJournal);
app.post('/api/generate-art', generateArt);

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🌈 Putti Blob Family Journal`);
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`\nPress Ctrl+C to stop\n`);
});
