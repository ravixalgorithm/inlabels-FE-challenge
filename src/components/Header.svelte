<script lang="ts">
  import { onMount } from "svelte";
  import { noteStore } from "../lib/store.svelte";

  let {
    onAddClick,
    onSearch,
    onSort,
  }: {
    onAddClick: () => void;
    onSearch: (term: string) => void;
    onSort: (field: string, order: "asc" | "desc") => void;
  } = $props();

  let isDark = $state(false);
  let searchTimer: any;
  let searchTerm = $state("");
  let searchInput = $state<HTMLInputElement>();

  // Sort variables
  let sortField = $state("createdAt");
  let sortOrder = $state<"asc" | "desc">("desc");
  let isDropdownOpen = $state(false);

  const sortOptions = [
    { value: "createdAt-desc", label: "Newest" },
    { value: "createdAt-asc", label: "Oldest" },
    { value: "title-asc", label: "Title (A-Z)" },
    { value: "title-desc", label: "Title (Z-A)" },
    { value: "id-desc", label: "ID (High-Low)" },
    { value: "id-asc", label: "ID (Low-High)" },
  ];

  let currentSortLabel = $derived(
    sortOptions.find((o) => o.value === `${sortField}-${sortOrder}`)?.label ||
      "Newest",
  );

  onMount(() => {
    isDark =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark";
    if (isDark) document.documentElement.classList.add("dark");
  });

  function toggleDark() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  function handleSearchInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    searchTerm = val;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      onSearch(val);
    }, 400); // 400ms debounce
  }

  function handleSortChange(val: string) {
    const [field, order] = val.split("-");
    sortField = field;
    sortOrder = order as "asc" | "desc";
    onSort(sortField, sortOrder);
    isDropdownOpen = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && isDropdownOpen) {
      isDropdownOpen = false;
    }
    if (
      e.key === "/" &&
      document.activeElement !== searchInput &&
      document.activeElement?.tagName !== "TEXTAREA" &&
      document.activeElement?.tagName !== "INPUT"
    ) {
      e.preventDefault();
      searchInput?.focus();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<header class="sticky top-0 z-30 w-full">
  <div class="bg-white dark:bg-black border-b border-subtle">
    <div
      class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 flex items-center justify-center font-serif text-2xl"
        >
          N.
        </div>

        <!-- Sync Status Indicator -->
        {#if !noteStore.isOnline}
          <span
            class="ml-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 py-1"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Offline
          </span>
        {:else if noteStore.isSyncing}
          <span
            class="ml-2 flex items-center gap-1.5 text-xs font-medium text-primary py-1"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-primary status-pulse"
            ></span>
            Syncing
          </span>
        {/if}
      </div>

      <div
        class="flex-1 w-full max-w-3xl mx-4 md:mx-8 flex items-center justify-center gap-2"
      >
        <div class="relative w-full">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            bind:this={searchInput}
            type="text"
            placeholder="Search notes... (Press '/')"
            value={searchTerm}
            oninput={handleSearchInput}
            class="w-full pl-9 pr-4 py-2 bg-subtle border border-transparent focus:bg-white dark:focus:bg-black focus:border-black dark:focus:border-white rounded-md outline-none transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <!-- Custom Dropdown -->
        <div class="relative hidden md:block shrink-0">
          <button
            onclick={() => (isDropdownOpen = !isDropdownOpen)}
            class="flex items-center justify-between w-40 bg-transparent hover:bg-subtle border border-subtle rounded-md py-2 px-3 focus:border-black dark:focus:border-white text-sm outline-none cursor-pointer font-medium transition-colors whitespace-nowrap"
          >
            {currentSortLabel}
            <svg
              class="w-4 h-4 ml-2 transition-transform duration-200 {isDropdownOpen
                ? 'rotate-180'
                : ''}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          {#if isDropdownOpen}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="fixed inset-0 z-40"
              onclick={() => (isDropdownOpen = false)}
            ></div>
            <div
              class="absolute right-0 mt-1 w-48 bg-white dark:bg-black border border-subtle rounded-md shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {#each sortOptions as option}
                <button
                  class="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-primary hover:text-white transition-colors
                  {`${sortField}-${sortOrder}` === option.value
                    ? 'bg-subtle font-semibold'
                    : ''}"
                  onclick={() => handleSortChange(option.value)}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button
            onclick={toggleDark}
            class="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Toggle dark mode"
          >
            {#if isDark}
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                /></svg
              >
            {:else}
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                /></svg
              >
            {/if}
          </button>

          <button
            onclick={onAddClick}
            title="Create note (Ctrl+Q)"
            class="flex items-center gap-1.5 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-4 py-2 rounded-md font-medium transition-colors text-sm whitespace-nowrap shrink-0"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              /></svg
            >
            <span class="hidden sm:inline">New Note</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</header>
