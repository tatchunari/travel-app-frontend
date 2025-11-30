<script setup lang="ts">
import { ref, watch } from "vue";
import SearchBar from "../SearchBar.vue";

const searchQuery = ref("");
const isSearching = ref(false);

const emit = defineEmits<{ search: [string] }>();

// Simple debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const emitSearch = debounce((query: string) => {
  emit("search", query);
}, 300);

watch(searchQuery, (newValue) => {
  emitSearch(newValue);
});
</script>

<template>
  <section
    class="relative min-h-[600px] flex items-center justify-center overflow-hidden"
  >
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <img
        src="https://cdn.pixabay.com/photo/2017/04/15/11/51/mt-fuji-2232246_1280.jpg"
        alt="Travel destination"
        class="w-full h-full object-cover"
      />
      <!-- Dark overlay for better text readability -->
      <div class="absolute inset-0 bg-black/40"></div>
    </div>

    <!-- Content -->
    <div
      class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
    >
      <!-- Main Heading -->
      <h1
        class="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg"
      >
        Welcome to TravelTrip
      </h1>

      <!-- Subheading -->
      <p class="text-xl md:text-2xl text-white/90 mb-12 drop-shadow-md">
        Explore your dream destination today
      </p>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-8">
        <SearchBar
          v-model="searchQuery"
          placeholder="Search destinations..."
          size="lg"
          :loading="isSearching"
        />
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div
      class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce"
    >
      <svg
        class="w-6 h-6 text-white/70"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        ></path>
      </svg>
    </div>
  </section>
</template>
