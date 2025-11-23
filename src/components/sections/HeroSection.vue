<script setup lang="ts">
import { ref } from "vue";
import SearchBar from "../SearchBar.vue";

const searchQuery = ref("");
const isSearching = ref(false);

const handleSearch = async () => {
  console.log("Searching for...");
};
</script>

<template>
  <section
    class="relative min-h-[600px] flex items-center justify-center overflow-hidden"
  >
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop"
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
          @search="handleSearch"
        />
      </div>

      <!-- Quick Links -->
      <div class="flex flex-wrap justify-center gap-4 text-white/80 text-sm">
        <span class="hover:text-white cursor-pointer transition-colors"
          >Popular:</span
        >
        <a href="#" class="hover:text-white transition-colors underline"
          >Paris</a
        >
        <a href="#" class="hover:text-white transition-colors underline"
          >Tokyo</a
        >
        <a href="#" class="hover:text-white transition-colors underline"
          >New York</a
        >
        <a href="#" class="hover:text-white transition-colors underline"
          >Bali</a
        >
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
