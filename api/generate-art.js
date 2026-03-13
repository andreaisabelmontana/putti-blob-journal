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
        const { person, activity, color } = req.body;

        // Simulate 2-second generation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock art URLs (using placeholder images)
        const mockArtUrls = [
            '/assets/mock-art/art1.svg',
            '/assets/mock-art/art2.svg',
            '/assets/mock-art/art3.svg',
            '/assets/mock-art/art4.svg',
            '/assets/mock-art/art5.svg',
            '/assets/mock-art/art6.svg'
        ];

        // Return random art URL
        const randomIndex = Math.floor(Math.random() * mockArtUrls.length);

        res.status(200).json({
            success: true,
            artUrl: mockArtUrls[randomIndex],
            person,
            activity,
            color
        });
    } catch (error) {
        console.error('Art generation error:', error);
        res.status(500).json({
            error: 'Failed to generate art',
            message: error.message
        });
    }
};
