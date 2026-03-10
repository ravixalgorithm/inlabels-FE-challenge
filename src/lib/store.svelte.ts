import { api } from './api';
import type { Note, NoteInput } from './types';

type OfflineAction =
    | { type: 'CREATE'; payload: NoteInput; tempId: string }
    | { type: 'UPDATE'; id: string | number; payload: Partial<NoteInput> }
    | { type: 'DELETE'; id: string | number };

class NoteStore {
    // Application State
    notes = $state<Note[]>([]);
    loading = $state(false);

    // Pagination State
    currentPage = $state(1);
    hasMore = $state(true);
    loadingMore = $state(false);
    lastParams = $state<{ search?: string; sortBy?: string; order?: 'asc' | 'desc'; limit?: number }>({});

    // Offline Sync State
    isOnline = $state(typeof navigator !== 'undefined' ? navigator.onLine : true);
    isSyncing = $state(false);
    offlineQueue = $state<OfflineAction[]>([]);

    // Pinned Notes State
    pinnedIds = $state<string[]>([]);

    constructor() {
        if (typeof window !== 'undefined') {
            // Load offline queue
            const savedQueue = localStorage.getItem('offlineQueue');
            if (savedQueue) {
                try { this.offlineQueue = JSON.parse(savedQueue); } catch (_e) { console.error('Failed to parse offline queue'); }
            }

            // Load pinned ids
            const savedPinned = localStorage.getItem('pinnedIds');
            if (savedPinned) {
                try { this.pinnedIds = JSON.parse(savedPinned); } catch (_e) { /* ignore parse error */ }
            }

            // Listeners
            window.addEventListener('online', () => {
                this.isOnline = true;
                this.processQueue();
            });
            window.addEventListener('offline', () => {
                this.isOnline = false;
            });
        }
    }

    // Persist methods
    private saveQueue() {
        localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
    }

    private savePinned() {
        localStorage.setItem('pinnedIds', JSON.stringify(this.pinnedIds));
    }

    // Pinned feature
    togglePin(id: string | number) {
        const strId = String(id);
        if (this.pinnedIds.includes(strId)) {
            this.pinnedIds = this.pinnedIds.filter(i => i !== strId);
        } else {
            this.pinnedIds.push(strId);
        }
        this.savePinned();
    }

    // Filter/Sort logic for the UI
    get displayNotes() {
        const pinned = this.notes.filter(n => this.pinnedIds.includes(String(n.id)));
        const unpinned = this.notes.filter(n => !this.pinnedIds.includes(String(n.id)));
        return [...pinned, ...unpinned];
    }

    // API wrappers
    async loadNotes(params?: { search?: string; sortBy?: string; order?: 'asc' | 'desc'; page?: number; limit?: number }) {
        this.loading = true;

        // Reset pagination if it's a fresh search/sort (no page specified, or page 1)
        if (!params?.page || params.page === 1) {
            this.currentPage = 1;
            this.hasMore = true;
            this.notes = [];
            this.lastParams = {
                search: params?.search,
                sortBy: params?.sortBy,
                order: params?.order,
                limit: params?.limit || 20
            };
        }

        const fetchParams = {
            ...this.lastParams,
            page: params?.page || 1,
            limit: this.lastParams.limit
        };

        try {
            const response = await api.getNotes(fetchParams);

            if (Array.isArray(response)) {
                if (fetchParams.page && fetchParams.page > 1) {
                    // Check for duplicates before appending just in case
                    const newNotes = response.filter(rn => !this.notes.some(n => n.id === rn.id));
                    this.notes = [...this.notes, ...newNotes];
                } else {
                    this.notes = response;
                }

                // If we get fewer items than the limit, we've reached the end
                if (response.length < (fetchParams.limit || 20)) {
                    this.hasMore = false;
                } else {
                    this.hasMore = true;
                }
            }
        } catch (err: any) {
            if (err.message === 'OFFLINE') {
                // We can't fetch new notes while offline, but we can rely on what we have.
            } else {
                console.error('Failed to load notes', err);
                this.hasMore = false;
            }
        } finally {
            this.loading = false;
        }
    }

    async loadMoreNotes() {
        if (!this.hasMore || this.loadingMore || !this.isOnline) return;

        this.loadingMore = true;
        this.currentPage += 1;

        try {
            await this.loadNotes({ ...this.lastParams, page: this.currentPage });
        } finally {
            this.loadingMore = false;
        }
    }

    async createNote(input: NoteInput) {
        const tempId = `temp-${Date.now()}`;
        const newNote: Note = {
            id: tempId,
            ...input,
            createdAt: new Date().toISOString()
        };

        // Optimistic UI
        this.notes = [newNote, ...this.notes];

        if (!this.isOnline) {
            this.offlineQueue.push({ type: 'CREATE', payload: input, tempId });
            this.saveQueue();
            return newNote;
        }

        try {
            const created = await api.createNote(input);
            // Replace optimistic temp ID with real ID
            this.notes = this.notes.map(n => n.id === tempId ? created : n);
            return created;
        } catch (err: any) {
            if (err.message === 'OFFLINE') {
                this.offlineQueue.push({ type: 'CREATE', payload: input, tempId });
                this.saveQueue();
                return newNote;
            }
            // Revert optimistic
            this.notes = this.notes.filter(n => n.id !== tempId);
            throw err;
        }
    }

    async updateNote(id: string | number, payload: Partial<NoteInput>) {
        const oldNote = this.notes.find(n => n.id === id);
        if (!oldNote) return;

        // Optimistic UI
        this.notes = this.notes.map(n => n.id === id ? { ...n, ...payload } : n);

        if (String(id).startsWith('temp-')) {
            // It's a temporary note still in queue! Update the queue payload.
            const qItem = this.offlineQueue.find(q => q.type === 'CREATE' && q.tempId === id);
            if (qItem && qItem.type === 'CREATE') {
                qItem.payload = { ...qItem.payload, ...payload };
                this.saveQueue();
            }
            return;
        }

        if (!this.isOnline) {
            this.offlineQueue.push({ type: 'UPDATE', id, payload });
            this.saveQueue();
            return;
        }

        try {
            await api.updateNote(id, payload);
        } catch (err: any) {
            if (err.message === 'OFFLINE') {
                this.offlineQueue.push({ type: 'UPDATE', id, payload });
                this.saveQueue();
                return;
            }
            // Revert
            this.notes = this.notes.map(n => n.id === id ? oldNote : n);
            throw err;
        }
    }

    async deleteNote(id: string | number) {
        const oldNote = this.notes.find(n => n.id === id);
        if (!oldNote) return;

        // Optimistic UI
        this.notes = this.notes.filter(n => n.id !== id);

        // Remove if pinned
        if (this.pinnedIds.includes(String(id))) {
            this.togglePin(id);
        }

        if (String(id).startsWith('temp-')) {
            // Was a temporary offline note, remove its creation from queue
            this.offlineQueue = this.offlineQueue.filter(q => !(q.type === 'CREATE' && q.tempId === id));
            this.saveQueue();
            return;
        }

        if (!this.isOnline) {
            this.offlineQueue.push({ type: 'DELETE', id });
            this.saveQueue();
            return;
        }

        try {
            await api.deleteNote(id);
        } catch (err: any) {
            if (err.message === 'OFFLINE') {
                this.offlineQueue.push({ type: 'DELETE', id });
                this.saveQueue();
                return;
            }
            // Revert
            this.notes = [...this.notes, oldNote];
            throw err;
        }
    }

    async processQueue() {
        if (this.offlineQueue.length === 0 || this.isSyncing || !this.isOnline) return;

        this.isSyncing = true;
        const queueCpy = [...this.offlineQueue];

        for (const action of queueCpy) {
            try {
                if (action.type === 'CREATE') {
                    const created = await api.createNote(action.payload);
                    // Update temp ID to real ID in state
                    this.notes = this.notes.map(n => n.id === action.tempId ? created : n);

                    // Also update any subsequent queued actions that referenced this tempId
                    for (const remaining of this.offlineQueue) {
                        if ((remaining.type === 'UPDATE' || remaining.type === 'DELETE') && remaining.id === action.tempId) {
                            remaining.id = created.id;
                        }
                    }
                }
                else if (action.type === 'UPDATE') {
                    await api.updateNote(action.id, action.payload);
                }
                else if (action.type === 'DELETE') {
                    await api.deleteNote(action.id);
                }

                // Remove from queue upon success
                this.offlineQueue = this.offlineQueue.filter(q => q !== action);
                this.saveQueue();
            } catch (err) {
                console.error('Failed to sync action', action, err);
                // Break queue processing if offline / severe error?
                // We'll just continue attempting other actions for now
            }
        }
        this.isSyncing = false;
    }
}

export const noteStore = new NoteStore();
