const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const dataDir = path.join(process.cwd(), 'data', 'entries');

        // Check if requesting all entries
        if (req.query.all === 'true') {
            if (!fs.existsSync(dataDir)) {
                return res.status(200).json([]);
            }

            const files = fs.readdirSync(dataDir);
            const entries = files
                .filter(f => f.endsWith('.json'))
                .map(f => {
                    const content = fs.readFileSync(path.join(dataDir, f), 'utf-8');
                    return JSON.parse(content);
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            return res.status(200).json(entries);
        }

        // Load specific date
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Missing date parameter' });
        }

        const filePath = path.join(dataDir, `${date}.json`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        const entry = JSON.parse(data);

        res.status(200).json(entry);
    } catch (error) {
        console.error('Load error:', error);
        res.status(500).json({
            error: 'Failed to load journal',
            message: error.message
        });
    }
};
