<script lang="ts">
  import { toastStore } from "../lib/toast.svelte";
  import { slide } from "svelte/transition";

  function getBgColor(type: string) {
    switch (type) {
      case "success":
        return "bg-black text-white dark:bg-white dark:text-black";
      case "error":
        return "bg-red-600 text-white";
      case "undo":
        return "bg-black text-white dark:bg-white dark:text-black";
      default:
        return "bg-primary text-white";
    }
  }
</script>

<div
  class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 p-4 pt-0 w-80 max-w-full pointer-events-none"
>
  {#each toastStore.toasts as toast (toast.id)}
    <div
      transition:slide
      class="{getBgColor(
        toast.type,
      )} shadow-sm rounded-md p-4 pointer-events-auto flex items-center justify-between border border-transparent dark:border-subtle"
    >
      <div class="flex-1">
        <p class="font-medium text-sm">{toast.message}</p>
        {#if toast.type === "undo" && toast.countdown !== undefined}
          <p class="text-xs opacity-80 mt-1">
            Permanently deleting in {toast.countdown}s
          </p>
        {/if}
      </div>

      {#if toast.type === "undo"}
        <button
          class="ml-3 px-3 py-1 bg-white hover:bg-gray-100 text-black dark:bg-black dark:text-white dark:hover:bg-gray-900 rounded-sm text-sm font-medium transition-colors border border-transparent dark:border-subtle"
          onclick={() => {
            if (toast.onUndo) toast.onUndo();
            toastStore.remove(toast.id);
          }}
        >
          Undo
        </button>
      {/if}

      {#if toast.type !== "undo"}
        <button
          class="ml-3 opacity-60 hover:opacity-100"
          onclick={() => toastStore.remove(toast.id)}
          aria-label="Close"
        >
          &times;
        </button>
      {/if}
    </div>
  {/each}
</div>
