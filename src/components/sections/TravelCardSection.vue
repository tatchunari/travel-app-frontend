<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import TravelCard from "../../components/TravelCard.vue";
import type { Trip } from "../../types/types";

import { getPublicTrips } from "../../api/tripsApi"; // Import API function

const router = useRouter();

// --- STATE ---
const allTrips = ref<Trip[]>([]); // Stores all fetched public data
const isLoading = ref(true); // Loading state
const errorMessage = ref("");

// --- PAGINATION LOGIC ---
const currentPage = ref(1);
const itemsPerPage = 12;

// Calculate total pages based on live data
const totalPages = computed(() =>
  Math.ceil(allTrips.value.length / itemsPerPage)
);

// Slice the data based on current page
const paginatedTrips = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return allTrips.value.slice(start, end);
});

// Helper to change page and scroll to top
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    // Optional: Smooth scroll to top of list when page changes
    window.scrollTo({ top: 100, behavior: "smooth" });
  }
};

// --- LIFECYCLE: FETCH DATA ---
onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    // Fetch public trips (unprotected API call)
    const data = await getPublicTrips();
    allTrips.value = data;
  } catch (error) {
    console.error("Error fetching public trips:", error);
    errorMessage.value = "Failed to load travel destinations from the server.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="py-12 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
        เที่ยวไหนดี (Public Trips)
      </h1>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <p class="ml-3 text-lg text-gray-600">Loading destinations...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="errorMessage"
        class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-center"
        role="alert"
      >
        <p class="font-bold">Error</p>
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Grid: Iterating over paginatedTrips -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <!-- Ensure TravelCard accepts these props -->
        <TravelCard
          v-for="destination in paginatedTrips"
          :key="destination.id"
          :image="
            destination.photos[0] ||
            'https://placehold.co/600x400/CCCCCC/333333?text=No+Image'
          "
          :title="destination.title"
          :description="destination.description"
          :tags="destination.tags"
          @click="router.push(`/trip/${destination.id}`)"
        />
      </div>

      <!-- Pagination Controls -->
      <div
        v-if="totalPages > 1 && !isLoading"
        class="flex justify-center items-center mt-12 gap-2"
      >
        <!-- Previous Button -->
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <!-- Page Numbers -->
        <button
          v-for="page in totalPages"
          :key="page"
          @click="changePage(page)"
          :class="[
            'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
            currentPage === page
              ? 'bg-green-600 text-white font-bold'
              : 'bg-white text-gray-700 hover:bg-gray-50 border',
          ]"
        >
          {{ page }}
        </button>

        <!-- Next Button -->
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && allTrips.length === 0"
        class="text-center text-gray-500 mt-10 text-lg"
      >
        No public destinations found.
      </div>
    </div>
  </section>
</template>
