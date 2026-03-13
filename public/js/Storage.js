// Storage - Save/load journal entries
const Storage = {
    async saveEntry(date, journalData) {
        try {
            const response = await fetch('/api/save-journal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: date,
                    blobs: journalData
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save journal');
            }

            return await response.json();
        } catch (error) {
            console.error('Save error:', error);
            throw error;
        }
    },

    async loadEntry(date) {
        try {
            const response = await fetch(`/api/load-journal?date=${date}`);

            if (!response.ok) {
                throw new Error('Failed to load journal');
            }

            return await response.json();
        } catch (error) {
            console.error('Load error:', error);
            return null;
        }
    },

    async getAllEntries() {
        try {
            const response = await fetch('/api/load-journal?all=true');

            if (!response.ok) {
                throw new Error('Failed to load entries');
            }

            return await response.json();
        } catch (error) {
            console.error('Load all error:', error);
            return [];
        }
    }
};
