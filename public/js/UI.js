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

        // Character counter for monster description
        const monsterDesc = document.getElementById('monster-description');
        const monsterCharCount = document.getElementById('monster-char-count');

        if (monsterDesc && monsterCharCount) {
            monsterDesc.addEventListener('input', () => {
                monsterCharCount.textContent = monsterDesc.value.length;
            });
        }

        // Initialize blob creator
        window.blobCreator = new BlobCreator();
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

    async startJournal() {
        this.currentPersonIndex = 0;
        this.journalData = [];

        // Clear any existing blobs
        if (window.physicsManager) {
            window.physicsManager.clearBlobs();
        }

        // Show yesterday's monster briefly if it exists
        await this.showYesterdayMonster();

        this.showMoldingScreen(this.people[0]);
    },

    async showYesterdayMonster() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];

        const entry = await Storage.loadEntry(dateStr);

        if (entry && entry.blobs && entry.blobs.length > 0) {
            const welcomeMsg = document.getElementById('welcome-message');
            if (welcomeMsg) {
                const monsterName = entry.blobs[0].monsterName || 'your monster';
                welcomeMsg.textContent = `Yesterday you created "${monsterName}"! Ready for today?`;
            }
        }
    },

    showMoldingScreen(personType) {
        this.showScreen('molding-screen');

        // Enable playtime mode (minimal UI)
        document.body.classList.add('playtime-mode');

        // Create fresh white blob
        const blob = new MoldableBlob(
            Scene.scene,
            Scene.world,
            0xFFFFFF,
            '✨',
            personType
        );

        blob.setPosition(0, 0, 0);

        window.physicsManager.addBlob(blob);
        window.currentBlob = blob;

        // Enable dragging
        window.vertexDragger.enable();

        // Focus camera on blob
        Scene.camera.position.set(0, 0, 5);
        Scene.camera.lookAt(0, 0, 0);
    },

    finishMolding() {
        window.vertexDragger.disable();
        document.body.classList.remove('playtime-mode');
        this.showPaintingScreen();
    },

    showPaintingScreen() {
        this.showScreen('paint-screen');
        document.body.classList.add('playtime-mode');

        // Initialize color picker UI
        if (window.blobCreator) {
            window.blobCreator.createColorPicker();
        }

        // Enable painting mode
        window.vertexDragger.enablePaintMode();
    },

    finishPainting() {
        window.vertexDragger.disablePaintMode();
        document.body.classList.remove('playtime-mode');
        this.showNameScreen();
    },

    showNameScreen() {
        this.showScreen('name-screen');
        document.getElementById('monster-name').value = '';
        document.getElementById('monster-description').value = '';
        document.getElementById('monster-char-count').textContent = '0';
    },

    async saveMonster() {
        const name = document.getElementById('monster-name').value.trim();
        const description = document.getElementById('monster-description').value.trim();

        if (!name) {
            alert('Please give your mood monster a name!');
            return;
        }

        // Get mood monster data for AI analysis
        const monsterData = window.blobCreator.getMoodMonsterData(window.currentBlob);

        // Save to current blob
        if (window.currentBlob) {
            window.currentBlob.monsterName = name;
            window.currentBlob.monsterDescription = description;
            window.currentBlob.monsterAnalysis = monsterData;

            // Save immediately (simplified flow - just one monster per day)
            const today = new Date().toISOString().split('T')[0];
            const blobData = window.currentBlob.serialize();
            blobData.monsterName = name;
            blobData.monsterDescription = description;
            blobData.monsterAnalysis = monsterData;

            try {
                await Storage.saveEntry(today, [blobData]);
                this.showCompletionMessage(name);
            } catch (error) {
                console.error('Failed to save:', error);
                alert('Oops! Could not save your monster. Try again?');
            }
        }
    },

    showCompletionMessage(monsterName) {
        this.showScreen('welcome-screen');

        const welcomeMsg = document.getElementById('welcome-message');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Great job! "${monsterName}" is saved. See you tomorrow!`;
        }

        // Clear blobs after a moment
        setTimeout(() => {
            if (window.physicsManager) {
                window.physicsManager.clearBlobs();
            }
        }, 2000);
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

    showGallery() {
        this.showScreen('gallery-screen');
        this.loadGallery();
    },

    async loadGallery() {
        const gallery = document.getElementById('blob-gallery');
        gallery.innerHTML = '<p>Loading your monsters...</p>';

        const entries = await Storage.getAllEntries();

        if (!entries || entries.length === 0) {
            gallery.innerHTML = '<p style="text-align: center; color: #999;">No monsters yet! Create your first one.</p>';
            return;
        }

        gallery.innerHTML = '';

        // Show most recent first
        entries.reverse().forEach(entry => {
            if (entry.blobs && entry.blobs.length > 0) {
                entry.blobs.forEach(blob => {
                    if (blob.monsterName) {
                        const item = document.createElement('div');
                        item.className = 'gallery-item';

                        const date = new Date(entry.date);
                        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

                        item.innerHTML = `
                            <div class="gallery-item-name">${blob.monsterName}</div>
                            <div class="gallery-item-date">${dateStr}</div>
                            <p style="font-size: 0.8em; color: #666; margin-top: 5px;">${blob.monsterDescription || ''}</p>
                        `;

                        item.onclick = () => {
                            alert(`${blob.monsterName}\n\n${blob.monsterDescription || 'No description'}\n\nCreated: ${dateStr}`);
                        };

                        gallery.appendChild(item);
                    }
                });
            }
        });
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

        document.body.classList.remove('playtime-mode');
        this.showScreen('welcome-screen');
    }
};
