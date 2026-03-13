// Dashboard - Parent analytics
const Dashboard = {
    async load() {
        const entries = await Storage.getAllEntries();

        if (!entries || entries.length === 0) {
            document.getElementById('dashboard-content').innerHTML = '<p>No entries yet. Start journaling to see analytics!</p>';
            return;
        }

        this.generateMoodStats(entries);
        this.generateHeatmap(entries);
    },

    generateMoodStats(entries) {
        const statsContainer = document.getElementById('mood-stats');
        statsContainer.innerHTML = '<h3>Mood Frequency</h3>';

        // Count emotions per person
        const personEmotions = {};

        entries.forEach(entry => {
            entry.blobs.forEach(blob => {
                if (!personEmotions[blob.type]) {
                    personEmotions[blob.type] = {};
                }

                const emotion = blob.emoji;
                personEmotions[blob.type][emotion] = (personEmotions[blob.type][emotion] || 0) + 1;
            });
        });

        // Display stats
        Object.keys(personEmotions).forEach(person => {
            const emotions = personEmotions[person];
            const total = Object.values(emotions).reduce((a, b) => a + b, 0);

            const personLabel = UI.peopleLabels[person] || person;

            const statDiv = document.createElement('div');
            statDiv.style.marginBottom = '20px';

            let emotionList = '<div style="display: flex; gap: 10px; flex-wrap: wrap;">';
            Object.entries(emotions).forEach(([emoji, count]) => {
                const percentage = ((count / total) * 100).toFixed(0);
                emotionList += `<span style="background: #F5F5F5; padding: 5px 10px; border-radius: 10px;">${emoji} ${percentage}%</span>`;
            });
            emotionList += '</div>';

            statDiv.innerHTML = `
                <strong>${personLabel}</strong>
                ${emotionList}
            `;

            statsContainer.appendChild(statDiv);
        });
    },

    generateHeatmap(entries) {
        const heatmapContainer = document.getElementById('mood-heatmap');
        heatmapContainer.innerHTML = '<h3>Mood Correlations</h3>';

        const canvas = document.createElement('canvas');
        canvas.id = 'heatmap-canvas';
        canvas.width = 600;
        canvas.height = 400;

        heatmapContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Simple visualization: timeline of emotions
        const cellWidth = canvas.width / entries.length;
        const cellHeight = canvas.height / 6; // 6 people

        entries.forEach((entry, entryIndex) => {
            entry.blobs.forEach((blob, blobIndex) => {
                const x = entryIndex * cellWidth;
                const y = blobIndex * cellHeight;

                // Draw colored cell
                ctx.fillStyle = blob.color;
                ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);

                // Draw emoji
                ctx.font = '20px Arial';
                ctx.fillText(blob.emoji, x + cellWidth / 2 - 10, y + cellHeight / 2 + 10);
            });
        });

        // Labels
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ['Me', 'Mom', 'Dad', 'Friend 1', 'Friend 2', 'Special'].forEach((label, i) => {
            ctx.fillText(label, 5, i * cellHeight + 20);
        });
    }
};
