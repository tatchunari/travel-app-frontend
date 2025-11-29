<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Heart, MessageCircle, Eye, MapPin, Loader2 } from "lucide-vue-next";
import Button from "../components/Button.vue";
import type { Trip } from "../types/types";
import { getPublicTripById } from "../api/tripsApi";

const route = useRoute();
const router = useRouter();

interface TripWithStats extends Trip {
  likes: number;
  comments: number;
  views: number;
}

const destination = ref<TripWithStats | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");

const getStats = () => ({
  likes: Math.floor(Math.random() * 2000) + 500,
  comments: Math.floor(Math.random() * 200) + 50,
  views: Math.floor(Math.random() * 10000) + 1000,
});

const openMap = () => {
  if (destination.value?.latitude && destination.value?.longitude) {
    const lat = destination.value.latitude;
    const lng = destination.value.longitude;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  }
};

// --- LIFECYCLE: FETCH DATA ---

onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = "";
  const tripId = Number(route.params.id);

  if (isNaN(tripId)) {
    errorMessage.value = "Invalid trip ID.";
    isLoading.value = false;
    return;
  }

  try {
    const trip = await getPublicTripById(tripId);

    destination.value = {
      ...trip,
      ...getStats(),
    };
  } catch (error) {
    console.error("Failed to fetch trip details:", error);
    errorMessage.value =
      "This travel destination could not be loaded. It may not exist.";
  } finally {
    isLoading.value = false;
  }
});
</script>
<template>
  <!-- Loading State -->
  <div
    v-if="isLoading"
    class="min-h-screen bg-gray-50 flex justify-center items-center"
  >
    <Loader2 class="w-8 h-8 text-green-500 animate-spin mr-3" />
    <p class="text-lg text-gray-600">Loading destination details...</p>
  </div>

  <!-- Error State -->
  <div
    v-else-if="errorMessage"
    class="min-h-screen bg-gray-50 flex justify-center items-center"
  >
    <div
      class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"
      role="alert"
    >
      <p class="font-bold">Error Loading Trip</p>
      <p>{{ errorMessage }}</p>
      <Button @click="router.push('/')" variant="outline" class="mt-4"
        >Go to Home</Button
      >
    </div>
  </div>

  <!-- Content -->
  <div v-else-if="destination" class="min-h-screen bg-gray-50">
    <div class="bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Back Button -->
        <button
          @click="router.back()"
          class="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          Back
        </button>

        <!-- Gallery Grid -->
        <div
          class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-96"
        >
          <div
            class="col-span-1 md:col-span-2 md:row-span-2 h-64 md:h-full relative"
          >
            <img
              :src="
                destination.photos[0] ||
                'https://placehold.co/800x600/CCCCCC/333333?text=Main+Photo'
              "
              :alt="destination.title"
              class="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            />
          </div>

          <!-- Small Photos (Desktop) -->
          <div
            v-for="(photo, index) in destination.photos.slice(1, 3)"
            :key="index"
            class="hidden md:block col-span-2 md:col-span-2 h-full"
          >
            <img
              :src="photo"
              :alt="`${destination.title} - Photo ${index + 2}`"
              class="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            />
          </div>

          <!-- Small Photos (Mobile Carousel) -->
          <div class="md:hidden col-span-1 flex gap-2 overflow-x-auto pb-2">
            <img
              v-for="(photo, index) in destination.photos.slice(1, 4)"
              :key="index"
              :src="photo"
              class="w-24 h-24 object-cover rounded-lg shrink-0"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-md p-8">
            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in destination.tags"
                :key="tag"
                class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium"
              >
                {{ tag }}
              </span>
            </div>

            <h1 class="text-3xl font-bold text-gray-900 mb-4">
              {{ destination.title }}
            </h1>

            <!-- Stats/Interaction Bar -->
            <div
              class="flex items-center gap-6 text-gray-500 text-sm mb-6 pb-6 border-b"
            >
              <div class="flex items-center gap-1">
                <Heart class="w-4 h-4 text-red-500" />
                <span>{{ destination.likes.toLocaleString() }} Likes</span>
              </div>
              <div class="flex items-center gap-1">
                <MessageCircle class="w-4 h-4" />
                <span
                  >{{ destination.comments.toLocaleString() }} Comments</span
                >
              </div>
              <div class="flex items-center gap-1">
                <Eye class="w-4 h-4" />
                <span>{{ destination.views.toLocaleString() }} Views</span>
              </div>
              <!-- Location Button -->
              <Button
                v-if="destination.latitude && destination.longitude"
                @click="openMap"
                variant="secondary"
                size="sm"
                class="ml-auto"
              >
                <MapPin class="w-4 h-4 mr-1" />
                View on Map
              </Button>
            </div>

            <div class="prose max-w-none">
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">
                {{ destination.description }}
              </p>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">
              About the Author
            </h3>
            <div class="flex items-start gap-4">
              <img
                :src="destination.authorImageUrl"
                :alt="destination.authorName"
                class="w-16 h-16 rounded-full object-cover border-2 border-green-200"
              />
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">
                  {{ destination.authorName }}
                </h4>
                <p class="text-sm text-gray-600 mt-1">
                  Travel Enthusiast and Contributor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
