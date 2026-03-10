<script lang="ts">
  import type { Note } from "../lib/types";
  let {
    note,
    isPinned = false,
    onEdit,
    onDelete,
    onTogglePin,
  }: {
    note: Note;
    isPinned?: boolean;
    onEdit: (n: Note) => void;
    onDelete: (n: Note) => void;
    onTogglePin: (id: string | number) => void;
  } = $props();

  function formatDate(isoString: string) {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  }
</script>

<div
  class="group relative bg-white dark:bg-[#0a0a0a] rounded-lg p-5 border-subtle border card-lift flex flex-col gap-3 h-full overflow-hidden fade-in-up {isPinned
    ? 'ring-1 ring-primary border-primary dark:border-primary'
    : ''}"
>
  <!-- Pinned indicator flat stripe -->
  {#if isPinned}
    <div class="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
  {/if}

  <div class="flex justify-between items-start gap-4">
    <h3
      class="font-serif text-2xl text-black dark:text-white line-clamp-2 tracking-tight"
      title={note.title}
    >
      {note.title}
    </h3>

    <button
      onclick={() => onTogglePin(note.id)}
      class="flex-shrink-0 mt-0.5 p-1 rounded-md transition-all duration-200 {isPinned
        ? 'text-primary bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rotate-0'
        : 'text-gray-400 dark:text-gray-600 hover:text-primary dark:hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20'}"
      title={isPinned ? "Unpin note" : "Pin note"}
    >
      <svg
        class="w-4.5 h-4.5 transition-transform duration-200 {isPinned
          ? 'fill-current scale-110'
          : ''}"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M16 3l-4 4-4-1-3 3 5 5-4 4h2l3-3 5 5 3-3-1-4 4-4-6-6z"
        />
      </svg>
    </button>
  </div>

  <p
    class="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap line-clamp-4 flex-1 leading-relaxed"
  >
    {note.content}
  </p>

  <div
    class="flex items-center justify-between pt-3 mt-auto border-t border-subtle"
  >
    <span
      class="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide"
    >
      {formatDate(note.createdAt)}
    </span>

    <div
      class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0"
    >
      <button
        onclick={() => onEdit(note)}
        class="p-1.5 text-gray-400 hover:text-black dark:hover:text-white hover:bg-subtle rounded-md transition-all duration-150"
        title="Edit note"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </button>
      <button
        onclick={() => onDelete(note)}
        class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-all duration-150"
        title="Delete note"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  </div>

  {#if String(note.id).startsWith("temp-")}
    <div
      class="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center backdrop-blur-sm"
    >
      <span
        class="bg-black dark:bg-white text-white dark:text-black font-medium text-xs px-3 py-1.5 rounded-md flex items-center gap-2 shadow-sm"
      >
        <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Saving...
      </span>
    </div>
  {/if}
</div>
