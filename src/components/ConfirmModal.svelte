<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import Spinner from "./Spinner.svelte";

    let {
        title,
        message,
        confirmText = "Submit",
        cancelText = "Cancel",
        variant = "primary",
        isLoading = false,
        onConfirm,
        onCancel,
    }: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        variant?: "danger" | "primary";
        isLoading?: boolean;
        onConfirm: () => void;
        onCancel: () => void;
    } = $props();

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
        class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
        onclick={() => !isLoading && onCancel()}
        role="presentation"
    ></div>

    <div
        transition:fly={{ y: 20, duration: 200 }}
        class="relative bg-white dark:bg-black rounded-lg border border-subtle shadow-2xl w-full max-w-sm p-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
    >
        <h3
            class="text-2xl font-serif text-black dark:text-white tracking-tight mb-2"
        >
            {title}
        </h3>
        <p
            class="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed"
        >
            {message}
        </p>

        <div class="flex items-center justify-end gap-3">
            <button
                type="button"
                onclick={onCancel}
                disabled={isLoading}
                class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
            >
                {cancelText}
            </button>

            <button
                type="button"
                onclick={onConfirm}
                disabled={isLoading}
                class="px-5 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50
          {variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'}"
            >
                {#if isLoading}
                    <Spinner size="w-4 h-4" />
                {/if}
                {confirmText}
            </button>
        </div>
    </div>
</div>
