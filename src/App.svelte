<script lang="ts">
  import { onMount } from "svelte";
  import Header from "./components/Header.svelte";
  import NoteList from "./components/NoteList.svelte";
  import NoteFormModal from "./components/Forms/NoteFormModal.svelte";
  import ConfirmModal from "./components/ConfirmModal.svelte";
  import ToastProvider from "./components/ToastProvider.svelte";
  import NotFound from "./components/NotFound.svelte";

  import { noteStore } from "./lib/store.svelte";
  import { toastStore } from "./lib/toast.svelte";
  import type { Note, NoteInput } from "./lib/types";

  // Router
  let currentHash = $state("");
  let currentPath = $state("");

  // UI State
  let isFormOpen = $state(false);
  let formNote = $state<Partial<Note>>({});
  let formLoading = $state(false);

  let confirmOpen = $state(false);
  let noteToDelete = $state<Note | null>(null);
  let confirmLoading = $state(false);

  onMount(() => {
    currentHash = window.location.hash;
    currentPath = window.location.pathname;
    window.addEventListener("hashchange", () => {
      currentHash = window.location.hash;
    });
    // For standard paths, SPA usually intercepts links to pushState. Here we mainly just check the initial load path.
    // If we're not at the root (due to hard refresh like /hello), we can catch it.

    // Initial load
    noteStore.loadNotes({ sortBy: "createdAt", order: "desc" });
  });

  function handleKeydown(e: KeyboardEvent) {
    if (
      e.ctrlKey &&
      e.key.toLowerCase() === "q" &&
      !isFormOpen &&
      !confirmOpen
    ) {
      e.preventDefault();
      openNewNote();
    }
  }

  // Header Actions
  function handleSearch(term: string) {
    noteStore.loadNotes({ search: term });
  }

  function handleSort(field: string, order: "asc" | "desc") {
    noteStore.loadNotes({ sortBy: field, order });
  }

  // CRUD Actions
  function openNewNote() {
    formNote = {};
    isFormOpen = true;
  }

  function openEditNote(note: Note) {
    formNote = { ...note };
    isFormOpen = true;
  }

  async function handleSaveNote(data: NoteInput) {
    formLoading = true;
    try {
      if (formNote.id) {
        await noteStore.updateNote(formNote.id, data);
        toastStore.add({ message: "Note updated", type: "success" });
      } else {
        await noteStore.createNote(data);
        toastStore.add({ message: "Note created", type: "success" });
      }
      isFormOpen = false;
    } catch (err: any) {
      toastStore.add({
        message:
          err.message === "OFFLINE" ? "Saved offline" : "Failed to save note",
        type: err.message === "OFFLINE" ? "info" : "error",
      });
      if (err.message === "OFFLINE") isFormOpen = false;
    } finally {
      formLoading = false;
    }
  }

  function requestDelete(note: Note) {
    noteToDelete = note;
    confirmOpen = true;
  }

  async function confirmDelete() {
    if (!noteToDelete) return;

    // We implement Soft Delete by removing it from the store instantly,
    // intercepting the actual API call, and adding it to the Offline Queue *after* 10s if not undone.
    // However, our current store instantly deletes it and queues it for sync or API.
    // To implement the 10s undo without changing the store heavily:
    // We will bypass the store's delete method entirely for the 10s window!

    // Wait, the prompt says: "Deleted notes should persist for 10 seconds with an option to revert the deletion. We recommend a toast"
    // Let's hide it from the UI by temporarily filtering it in display space?
    // Actually, `noteStore` immediately modifies `this.notes = this.notes.filter...` and then calls API.
    // If we call `noteStore.deleteNote`, it deletes optimistically immediately.
    // But `noteStore.deleteNote` calls the API immediately if online.
    // So we shouldn't call `deleteNote` yet! We should hold the deletion.

    const targetId = noteToDelete.id;
    const targetNote = noteToDelete;

    // Hide it locally first (simulate optimistic delete without calling store)
    noteStore.notes = noteStore.notes.filter((n) => n.id !== targetId);

    confirmOpen = false;
    noteToDelete = null;

    let executeDelete = true;

    toastStore.add({
      type: "undo",
      message: "Note deleted.",
      duration: 10000,
      onUndo: () => {
        executeDelete = false;
        // Restore note
        noteStore.notes = [targetNote, ...noteStore.notes];
      },
    });

    // Wait 10 seconds
    setTimeout(async () => {
      if (executeDelete) {
        // Now formally ask store to delete it from API / queue
        // We have to put it back temporarily so the store finds it to delete it!
        noteStore.notes.push(targetNote);
        try {
          await noteStore.deleteNote(targetId);
        } catch (err) {
          toastStore.add({ message: "Failed to sync deletion", type: "error" });
        }
      }
    }, 10000);
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if (currentHash && currentHash !== "#/" && currentHash !== "") || (currentPath && currentPath !== "/")}
  <!-- Router logic: custom 404 page for unknown routes -->
  <NotFound
    onGoHome={() => {
      window.history.replaceState({}, "", "/");
      window.location.hash = "";
      currentPath = "/";
      currentHash = "";
    }}
  />
{:else}
  <div class="min-h-screen flex flex-col">
    <Header
      onAddClick={openNewNote}
      onSearch={handleSearch}
      onSort={handleSort}
    />

    <main class="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
      <NoteList onEdit={openEditNote} onDelete={requestDelete} />
    </main>

    <footer
      class="mt-auto py-8 border-t border-subtle text-center text-sm text-gray-500 bg-subtle"
    >
      <p class="font-medium">
        Built with <span class="text-black dark:text-white font-bold"
          >Svelte</span
        >
        &
        <span class="text-black dark:text-white font-bold">TailwindCSS</span>
        <span class="mx-2 text-gray-300 dark:text-gray-700">|</span>
        <a
          href="https://github.com/ravixalgorithm/inlabels-FE-challenge"
          class="text-black dark:text-white hover:text-primary transition-colors underline decoration-subtle underline-offset-4"
        >
          View on GitHub ↗
        </a>
      </p>
    </footer>
  </div>

  {#if isFormOpen}
    <NoteFormModal
      initialData={formNote}
      {...{ isLoading: formLoading }}
      onSave={handleSaveNote}
      onCancel={() => (isFormOpen = false)}
    />
  {/if}

  {#if confirmOpen}
    <ConfirmModal
      title="Delete Note"
      message="Are you sure you want to delete '{noteToDelete?.title ||
        'this note'}'? You'll have 10 seconds to undo this action."
      variant="danger"
      confirmText="Delete"
      {...{ isLoading: confirmLoading }}
      onConfirm={confirmDelete}
      onCancel={() => (confirmOpen = false)}
    />
  {/if}
{/if}

<ToastProvider />
