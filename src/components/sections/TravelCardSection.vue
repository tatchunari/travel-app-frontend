<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import TravelCard from "../../components/TravelCard.vue";
import type { Trip } from "../../types/types";
import { getPublicTrips } from "../../api/tripsApi";

const props = defineProps<{ search: string }>();
const trips = ref<Trip[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

const currentPage = ref(1);
const itemsPerPage = 12;

const totalPages = computed(() => Math.ceil(trips.value.length / itemsPerPage));

const paginatedTrips = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return trips.value.slice(start, start + itemsPerPage);
});

const fetchTrips = async () => {
  try {
    isLoading.value = true;
    const data = await getPublicTrips(props.search); // your backend query
    trips.value = data;
  } catch (e) {
    errorMessage.value = "Failed to fetch destinations.";
  } finally {
    isLoading.value = false;
  }
};

// Fetch on mount
onMounted(fetchTrips);

// Refetch whenever search changes
watch(
  () => props.search,
  () => {
    currentPage.value = 1;
    fetchTrips();
  }
);
</script>

<template>
  <section class="py-12 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        Loading destinations...
      </div>
      <div v-else-if="errorMessage" class="text-red-600 text-center">
        {{ errorMessage }}
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <TravelCard
          v-for="trip in paginatedTrips"
          :key="trip.id"
          :image="
            trip.photos[0] ||
            'https://placehold.co/600x400/CCCCCC/333333?text=No+Image'
          "
          :title="trip.title"
          :description="trip.description"
          :tags="trip.tags"
          :author-name="trip.authorName"
          :author-avatar-url="trip.authorImageUrl"
          @click="$router.push(`/trip/${trip.id}`)"
        />
      </div>
    </div>
  </section>
</template>
