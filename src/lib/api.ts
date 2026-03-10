import type { Note, NoteInput } from './types';

const API_URL = import.meta.env.VITE_MOCK_API_URL || 'https://67ce2a3f0d4400e2.mockapi.io/notes';

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('OFFLINE');
    }

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!res.ok) {
            throw new ApiError(res.status, `API request failed: ${res.statusText}`);
        }

        // MockAPI returns empty strings or not-JSON on some DELETE/PUT operations depending on config
        const text = await res.text();
        return text ? JSON.parse(text) : (null as unknown as T);
    } catch (err) {
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
            throw new Error('OFFLINE', { cause: err });
        }
        throw err;
    }
}

interface GetNotesParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export const api = {
    async getNotes(params?: GetNotesParams): Promise<Note[]> {
        const query = new URLSearchParams();
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.search) query.append('title', params.search); // mockapi exact match or wildcard if configured
        if (params?.sortBy) query.append('sortBy', params.sortBy);
        if (params?.order) query.append('order', params.order);

        const qs = query.toString();
        const endpoint = qs ? `?${qs}` : '';

        // MockAPI returns array
        return fetchApi<Note[]>(endpoint);
    },

    async createNote(note: NoteInput): Promise<Note> {
        return fetchApi<Note>('', {
            method: 'POST',
            body: JSON.stringify(note),
        });
    },

    async updateNote(id: string | number, note: Partial<NoteInput>): Promise<Note> {
        return fetchApi<Note>(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(note),
        });
    },

    async deleteNote(id: string | number): Promise<Note> {
        return fetchApi<Note>(`/${id}`, {
            method: 'DELETE',
        });
    }
};
