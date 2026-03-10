<script lang="ts">
    let {
        onGoHome,
    }: {
        onGoHome: () => void;
    } = $props();
</script>

<div
    class="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center"
>
    <div class="relative w-48 h-48 mb-6">
        <div
            class="absolute inset-0 bg-primary/20 dark:bg-primary/10 rounded-full animate-ping opacity-50"
        ></div>
        <div
            class="absolute inset-4 bg-primary/30 dark:bg-primary/20 rounded-full animate-pulse"
        ></div>
        <div
            class="absolute inset-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center"
        >
            <span class="text-4xl font-black text-gray-900 dark:text-gray-100"
                >404</span
            >
        </div>
    </div>

    <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Page Not Found
    </h2>
    <p class="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved. Let's get
        you back home.
    </p>

    <button
        onclick={onGoHome}
        class="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors shadow-sm"
    >
        Return to Notes
    </button>
</div>
