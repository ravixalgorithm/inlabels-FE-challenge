export interface Note {
    id: number | string;
    title: string;
    content: string;
    createdAt: string;
}

export interface NoteInput {
    title: string;
    content: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
}
