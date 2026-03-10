<script lang="ts">
    import { noteStore } from "../lib/store.svelte";
    import NoteCard from "./NoteCard.svelte";
    import Spinner from "./Spinner.svelte";
    import type { Note } from "../lib/types";

    let {
        onEdit,
        onDelete,
    }: {
        onEdit: (n: Note) => void;
        onDelete: (n: Note) => void;
    } = $props();

    function infiniteScroll(node: HTMLElement) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    noteStore.hasMore &&
                    !noteStore.loading &&
                    !noteStore.loadingMore
                ) {
                    noteStore.loadMoreNotes();
                }
            },
            { rootMargin: "100px" },
        );

        observer.observe(node);

        return {
            destroy() {
                observer.disconnect();
            },
        };
    }
</script>

{#if noteStore.loading && noteStore.notes.length === 0}
    <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
        {#each Array(8) as _, i (i)}
            <div
                class="bg-white dark:bg-black rounded-lg p-5 h-48 border border-subtle relative overflow-hidden"
            >
                <div class="absolute inset-0 skeleton-shimmer"></div>
                <div class="h-6 bg-subtle rounded-md w-3/4 mb-4"></div>
                <div class="h-4 bg-subtle rounded-md w-full mb-2.5"></div>
                <div class="h-4 bg-subtle rounded-md w-5/6 mb-2.5"></div>
                <div class="h-4 bg-subtle rounded-md w-4/6 mt-auto"></div>
            </div>
        {/each}
    </div>
{:else if noteStore.displayNotes.length === 0}
    <div class="flex flex-col items-center justify-center py-20 text-center">
        <div
            class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400"
        >
            <svg
                class="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
            </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            No notes found
        </h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm">
            Looks like you don't have any notes here yet. Create one to get
            started!
        </p>
    </div>
{:else}
    <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
        {#each noteStore.displayNotes as note (note.id)}
            <div class="h-full">
                <NoteCard
                    {note}
                    isPinned={noteStore.pinnedIds.includes(String(note.id))}
                    {onEdit}
                    {onDelete}
                    onTogglePin={(id) => noteStore.togglePin(id)}
                />
            </div>
        {/each}
    </div>

    <!-- Infinite Scroll Trigger -->
    <div use:infiniteScroll class="h-10 w-full mt-4"></div>

    {#if noteStore.loadingMore}
        <div class="flex justify-center p-8">
            <Spinner size="w-8 h-8" />
        </div>
    {/if}
{/if}
