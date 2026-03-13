// UI Controller - Flow management and screen transitions
const UI = {
    currentScreen: 'welcome-screen',
    currentPersonIndex: 0,
    people: ['me', 'mom', 'dad', 'friend1', 'friend2', 'special'],
    peopleLabels: {
        me: 'Me',
        mom: 'Mom',
        dad: 'Dad',
        friend1: 'Friend 1',
        friend2: 'Friend 2',
        special: 'Someone Special'
    },
    journalData: [],

    init() {
        // Character counter for activity input
        const activityInput = document.getElementById('activity-input');
        const charCount = document.getElementById('char-count');

        activityInput.addEventListener('input', () => {
            charCount.textContent = activityInput.value.length;
        });
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
    },

    startJournal() {
        this.currentPersonIndex = 0;
        this.journalData = [];

        // Clear any existing blobs
        if (window.physicsManager) {
            window.physicsManager.clearBlobs();
        }

        this.showMoldingScreen(this.people[0]);
    },

    showMoldingScreen(personType) {
        const personLabel = this.peopleLabels[personType];
        document.getElementById('molding-title').textContent = `Mold ${personLabel}'s blob`;
        document.getElementById('molding-instructions').textContent = 'Drag to shape how they feel';
        document.getElementById('person-indicator').textContent = `👤 ${personLabel}`;

        this.showScreen('molding-screen');

        // Create blob for this person
        const positions = [
            { x: 0, y: 0, z: 0 },      // me
            { x: -3, y: 2, z: -1 },    // mom
            { x: 3, y: 2, z: -1 },     // dad
            { x: -2, y: -2, z: -1 },   // friend1
            { x: 2, y: -2, z: -1 },    // friend2
            { x: 0, y: 3, z: -2 }      // special
        ];

        const blob = new MoldableBlob(
            Scene.scene,
            Scene.world,
            0xFFFFFF,
            '😊',
            personType
        );

        const pos = positions[this.currentPersonIndex];
        blob.setPosition(pos.x, pos.y, pos.z);

        window.physicsManager.addBlob(blob);
        window.currentBlob = blob;

        // Enable dragging
        window.vertexDragger.enable();
    },

    finishMolding() {
        window.vertexDragger.disable();
        this.showColorPicker();
    },

    showColorPicker() {
        this.showScreen('color-screen');
    },

    selectEmotion(button) {
        const color = button.getAttribute('data-color');
        const emoji = button.getAttribute('data-emoji');

        // Update current blob
        if (window.currentBlob) {
            window.currentBlob.setColor(parseInt(color.replace('#', ''), 16));
            window.currentBlob.emoji = emoji;
        }

        this.showActivityInput();
    },

    showActivityInput() {
        const personLabel = this.peopleLabels[this.people[this.currentPersonIndex]];
        document.getElementById('activity-title').textContent = `What did ${personLabel} do today?`;
        document.getElementById('activity-input').value = '';
        document.getElementById('char-count').textContent = '0';

        this.showScreen('activity-screen');
    },

    async saveActivity() {
        const activity = document.getElementById('activity-input').value;

        // Save current person data
        const blobData = window.currentBlob.serialize();
        blobData.activity = activity;

        this.journalData.push(blobData);

        // Move to next person or finish
        this.currentPersonIndex++;

        if (this.currentPersonIndex < this.people.length) {
            this.showMoldingScreen(this.people[this.currentPersonIndex]);
        } else {
            // Generate art for all entries
            await this.generateArt();
        }
    },

    async generateArt() {
        this.showScreen('art-screen');

        // Mock AI art generation for each entry
        const artPromises = this.journalData.map(async (entry) => {
            try {
                const response = await fetch('/api/generate-art', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        person: entry.type,
                        activity: entry.activity,
                        color: entry.color
                    })
                });

                const data = await response.json();
                entry.artUrl = data.artUrl;
            } catch (error) {
                console.error('Art generation failed:', error);
                entry.artUrl = '/assets/mock-art/placeholder.png';
            }
        });

        await Promise.all(artPromises);

        this.showSummary();
    },

    showSummary() {
        const summaryContent = document.getElementById('summary-content');
        summaryContent.innerHTML = '';

        this.journalData.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'summary-item';

            const personLabel = this.peopleLabels[entry.type];

            item.innerHTML = `
                <span class="summary-emoji">${entry.emoji}</span>
                <div class="summary-text">
                    <div class="summary-person">${personLabel}</div>
                    <div class="summary-activity">${entry.activity || 'No activity recorded'}</div>
                    ${entry.artUrl ? `<img src="${entry.artUrl}" class="summary-art" alt="Generated art">` : ''}
                </div>
            `;

            summaryContent.appendChild(item);
        });

        this.showScreen('summary-screen');

        // Re-enable physics interactions to show blob relationships
        window.vertexDragger.disable();
    },

    async finishEntry() {
        // Save to storage
        const today = new Date().toISOString().split('T')[0];

        try {
            await Storage.saveEntry(today, this.journalData);
            alert('Journal saved!');
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save journal. Please try again.');
        }

        this.backToWelcome();
    },

    showHistory() {
        this.showScreen('history-screen');
        Replay.loadHistory();
    },

    showDashboard() {
        this.showScreen('dashboard-screen');
        Dashboard.load();
    },

    backToWelcome() {
        // Clear blobs
        if (window.physicsManager) {
            window.physicsManager.clearBlobs();
        }

        this.showScreen('welcome-screen');
    }
};
