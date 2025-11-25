<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import TravelCard from "../TravelCard.vue";
import { trips } from "../../utils/trips";

const router = useRouter();

// --- PAGINATION LOGIC ---
const currentPage = ref(1);
const itemsPerPage = 12;

// Calculate total pages
const totalPages = computed(() => Math.ceil(trips.length / itemsPerPage));

// Slice the data based on current page
const paginatedTrips = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return trips.slice(start, end);
});

// Helper to change page and scroll to top
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    // Optional: Smooth scroll to top of list when page changes
    window.scrollTo({ top: 1000, behavior: "smooth" });
  }
};
</script>

<template>
  <section class="py-12 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
        เที่ยวไหนดี
      </h1>

      <!-- Grid: Iterating over paginatedTrips instead of all trips -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <TravelCard
          v-for="destination in paginatedTrips"
          :key="destination.id"
          :image="destination.photos[0]"
          :title="destination.title"
          :description="destination.description"
          :tags="destination.tags"
          @click="router.push(`/trip/${destination.id}`)"
        />
      </div>

      <!-- Pagination Controls -->
      <div
        v-if="totalPages > 1"
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

      <!-- Empty State (Just in case) -->
      <div
        v-if="paginatedTrips.length === 0"
        class="text-center text-gray-500 mt-10"
      >
        No destinations found.
      </div>
    </div>
  </section>
</template>
