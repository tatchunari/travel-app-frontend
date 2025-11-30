<script setup lang="ts">
import { ref, onMounted } from "vue"; // Import onMounted
import { useRouter } from "vue-router";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-vue-next"; // Import Loader2
import { getPublicTrips } from "../api/tripsApi"; // Import API function
import type { Trip } from "../types/types"; // Assuming types/types.ts is accessible

const router = useRouter();

// --- STATE ---
const featuredTrips = ref<Trip[]>([]); // Initialize as array of Trip type
const isLoading = ref(true);
const errorMessage = ref("");

// --- DATA FETCHING ---
const fetchTrips = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    // Fetch all public trips
    const data = await getPublicTrips();

    // Use the first 4 trips as featured, or all if less than 4, filtering out trips with null id
    featuredTrips.value = data.filter((trip) => trip.id !== null).slice(0, 4);
  } catch (e: any) {
    console.error("Error fetching featured trips:", e);
    errorMessage.value = "Failed to load featured trips.";
  } finally {
    isLoading.value = false;
  }
};

// --- LIFECYCLE ---
onMounted(fetchTrips);

// --- Navigation Actions ---
const goToTripDetail = (id: number) => {
  router.push(`/trip/${id}`);
};

// --- Featured Card Navigation (Scroll Logic) ---
const scrollContainer = ref<HTMLElement | null>(null);

const scrollCards = (direction: "left" | "right") => {
  if (scrollContainer.value) {
    const cardWidth = 300; // Approximate card width
    const scrollAmount = direction === "right" ? cardWidth : -cardWidth;
    scrollContainer.value.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
};
</script>

<template>
  <div class="w-full h-full flex justify-end relative">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center w-full h-full min-h-96"
    >
      <Loader2 class="w-8 h-8 animate-spin text-white/50" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="errorMessage"
      class="flex items-center justify-center w-full h-full text-red-300"
    >
      <p>{{ errorMessage }}</p>
    </div>

    <!-- Content (Only display if not loading and trips exist) -->
    <template v-else-if="featuredTrips.length > 0">
      <!-- Scroll Buttons -->
      <!-- Note: Added bg-black/50 to buttons as they were slightly faded -->
      <button
        @click="scrollCards('left')"
        class="absolute left-0 top-50 z-20 p-2 bg-black/50 rounded-full hover:bg-black/70 transition hidden md:block"
        aria-label="Scroll Left"
      >
        <ChevronLeft class="w-6 h-6 text-white" />
      </button>
      <button
        @click="scrollCards('right')"
        class="absolute right-0 top-50 z-20 p-2 bg-black/50 rounded-full hover:bg-black/70 transition hidden md:block"
        aria-label="Scroll Right"
      >
        <ChevronRight class="w-6 h-6 text-white" />
      </button>

      <!-- Cards Container -->
      <div
        ref="scrollContainer"
        class="flex overflow-x-scroll snap-x snap-mandatory py-6 scroll-bar-hidden"
        style="-webkit-overflow-scrolling: touch"
      >
        <div
          v-for="(trip, index) in featuredTrips"
          :key="trip.id ?? index"
          class="w-72 h-96 shrink-0 snap-center relative mx-4 cursor-pointer"
          @click="trip.id ? goToTripDetail(trip.id) : undefined"
        >
          <!-- Card Content -->
          <div
            class="relative w-full h-full rounded-xl overflow-hidden shadow-2xl transition duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20"
          >
            <img
              :src="
                trip.photos?.[0] ||
                'https://placehold.co/400x450/1d3557/FFFFFF?text=No+Image'
              "
              :alt="trip.title"
              class="w-full h-full object-cover brightness-90"
            />

            <div
              class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"
            ></div>

            <div class="absolute bottom-4 left-4 right-4">
              <span
                class="text-xs font-medium bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full mb-1 inline-block"
                >{{ trip.tags?.[0] || "Destination" }}</span
              >
              <h3 class="text-xl font-semibold mb-1">{{ trip.title }}</h3>
              <div class="text-yellow-400 text-sm">
                <!-- Note: Assuming a static 5-star rating for featured trips for now -->
                <span
                  v-for="n in 5"
                  :key="n"
                  :class="
                    n <= 4 ? 'text-yellow-400' : 'text-gray-400' // Hardcoding 4 stars for visual appeal
                  "
                  >★</span
                >
                <span class="text-white/80 ml-1 text-xs">(4.0)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div
      v-else
      class="flex items-center justify-center w-full h-full text-white/70"
    >
      No featured trips available.
    </div>
  </div>
</template>

<style scoped>
.scroll-bar-hidden {
  scrollbar-width: none;
}
.scroll-bar-hidden::-webkit-scrollbar {
  display: none;
}
</style>
