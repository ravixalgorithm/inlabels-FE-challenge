<script lang="ts">
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import Spinner from "../Spinner.svelte";
    import type { Note } from "../../lib/types";

    let {
        initialData = {},
        isLoading = false,
        onSave,
        onCancel,
    }: {
        initialData?: Partial<Note>;
        isLoading?: boolean;
        onSave: (data: { title: string; content: string }) => void;
        onCancel: () => void;
    } = $props();

    let title = $state("");
    let content = $state("");

    onMount(() => {
        title = initialData.title || "";
        content = initialData.content || "";
    });

    let titleError = $state("");
    let contentError = $state("");

    function validate() {
        let isValid = true;
        titleError = "";
        contentError = "";

        if (!title.trim()) {
            titleError = "Title is required";
            isValid = false;
        } else if (title.length > 100) {
            titleError = "Title must be less than 100 characters";
            isValid = false;
        }

        if (content.length > 5000) {
            contentError = "Content is too long";
            isValid = false;
        }

        return isValid;
    }

    function handleSubmit(e: Event) {
        e.preventDefault();
        if (validate()) {
            onSave({ title: title.trim(), content: content.trim() });
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape" && !isLoading) {
            onCancel();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
        transition:fade={{ duration: 200 }}
        class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onclick={() => !isLoading && onCancel()}
        role="presentation"
    ></div>

    <div
        transition:fly={{ y: 20, duration: 200 }}
        class="relative bg-white dark:bg-[#0a0a0a] rounded-lg border border-subtle shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
    >
        <div
            class="px-6 py-4 border-b border-subtle flex justify-between items-center bg-[#fcfcfc] dark:bg-black"
        >
            <h3
                class="font-serif text-2xl tracking-tight text-black dark:text-white"
            >
                {initialData.id ? "Edit Note" : "New Note"}
            </h3>
            <button
                onclick={onCancel}
                disabled={isLoading}
                aria-label="Close modal"
                title="Close modal"
                class="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1 rounded-md hover:bg-subtle disabled:opacity-50"
            >
                <svg
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>

        <form
            onsubmit={handleSubmit}
            class="flex-1 overflow-y-auto p-6 flex flex-col gap-4"
        >
            <div>
                <label
                    for="note-title"
                    class="block text-sm font-medium text-black dark:text-white mb-1"
                >
                    Title <span class="text-red-500">*</span>
                </label>
                <input
                    id="note-title"
                    type="text"
                    bind:value={title}
                    placeholder="What's this about?"
                    disabled={isLoading}
                    class="w-full px-4 py-2 border {titleError
                        ? 'border-red-500 ring-1 ring-red-500'
                        : 'border-subtle focus:border-black dark:focus:border-white'} rounded-md bg-transparent text-black dark:text-white focus:outline-none transition-colors disabled:opacity-60"
                />
                {#if titleError}
                    <p class="mt-1 text-sm text-red-500">{titleError}</p>
                {/if}
            </div>

            <div class="flex-1 flex flex-col">
                <label
                    for="note-content"
                    class="block text-sm font-medium text-black dark:text-white mb-1"
                >
                    Content
                </label>
                <textarea
                    id="note-content"
                    bind:value={content}
                    placeholder="Start typing your note here..."
                    disabled={isLoading}
                    rows="8"
                    class="w-full px-4 py-2 border {contentError
                        ? 'border-red-500'
                        : 'border-subtle focus:border-black dark:focus:border-white'} rounded-md bg-transparent text-black dark:text-white focus:outline-none transition-colors resize-none flex-1 disabled:opacity-60"
                ></textarea>
                <div class="flex justify-between mt-1">
                    {#if contentError}
                        <p class="text-sm text-red-500">{contentError}</p>
                    {:else}
                        <div></div>
                        <!-- Spacer -->
                    {/if}
                    <span
                        class="text-xs text-gray-400 {content.length > 4500
                            ? 'text-amber-500'
                            : ''} {content.length > 5000 ? 'text-red-500' : ''}"
                    >
                        {content.length}/5000
                    </span>
                </div>
            </div>
        </form>

        <div
            class="px-6 py-4 border-t border-subtle bg-subtle flex items-center justify-end gap-3"
        >
            <button
                type="button"
                onclick={onCancel}
                disabled={isLoading}
                class="px-4 py-2 text-sm font-medium text-black dark:text-white hover:bg-subtle rounded-md transition-colors disabled:opacity-50"
            >
                Cancel
            </button>

            <button
                type="button"
                onclick={handleSubmit}
                disabled={isLoading}
                class="px-5 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                {#if isLoading}
                    <Spinner size="w-4 h-4" />
                {/if}
                Save Note
            </button>
        </div>
    </div>
</div>
