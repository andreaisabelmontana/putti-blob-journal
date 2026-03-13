// Replay - History viewing with physics replays
const Replay = {
    async loadHistory() {
        const timeline = document.getElementById('history-timeline');
        timeline.innerHTML = '';

        // Get past 7 days
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }

        // Load entries for each date
        for (const date of dates) {
            const entry = await Storage.loadEntry(date);

            const item = document.createElement('div');
            item.className = 'history-item';

            if (entry && entry.blobs) {
                const emojis = entry.blobs.map(b => b.emoji).join(' ');

                item.innerHTML = `
                    <div class="history-date">${this.formatDate(date)}</div>
                    <div class="history-preview">${emojis}</div>
                `;

                item.onclick = () => this.replayEntry(entry);
            } else {
                item.innerHTML = `
                    <div class="history-date">${this.formatDate(date)}</div>
                    <div class="history-preview" style="color: #999;">No entry</div>
                `;
                item.style.opacity = '0.5';
                item.style.cursor = 'default';
            }

            timeline.appendChild(item);
        }
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date().toISOString().split('T')[0];

        if (dateString === today) {
            return 'Today';
        }

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `${days[date.getDay()]}, ${date.getMonth() + 1}/${date.getDate()}`;
    },

    replayEntry(entry) {
        // Clear current blobs
        window.physicsManager.clearBlobs();

        // Hide history screen, show canvas
        document.getElementById('history-screen').style.background = 'transparent';

        // Create blobs from saved data
        entry.blobs.forEach(blobData => {
            const blob = new MoldableBlob(
                Scene.scene,
                Scene.world,
                parseInt(blobData.color.replace('#', ''), 16),
                blobData.emoji,
                blobData.type
            );

            // Set saved state
            blob.deserialize(blobData);
            window.physicsManager.addBlob(blob);
        });

        // Run physics for 5 seconds to show settling
        let elapsed = 0;
        const replayDuration = 5;

        const replayInterval = setInterval(() => {
            elapsed += 0.016; // ~60fps

            if (elapsed >= replayDuration) {
                clearInterval(replayInterval);
                document.getElementById('history-screen').style.background = 'rgba(255, 255, 255, 0.95)';
            }
        }, 16);
    }
};
