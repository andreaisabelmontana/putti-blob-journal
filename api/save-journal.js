const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { date, blobs } = req.body;

        if (!date || !blobs) {
            return res.status(400).json({ error: 'Missing date or blobs data' });
        }

        // Validate blobs array
        if (!Array.isArray(blobs) || blobs.length === 0) {
            return res.status(400).json({ error: 'Invalid blobs data' });
        }

        // Create data directory if it doesn't exist
        const dataDir = path.join(process.cwd(), 'data', 'entries');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Save to JSON file
        const filePath = path.join(dataDir, `${date}.json`);
        const data = {
            date,
            blobs,
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        res.status(200).json({
            success: true,
            message: 'Journal saved successfully',
            date
        });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({
            error: 'Failed to save journal',
            message: error.message
        });
    }
};
