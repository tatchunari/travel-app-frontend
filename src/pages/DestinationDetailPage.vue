<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { trips, type Trip } from "../utils/trips";
import Button from "../components/Button.vue";

// Extended interface with additional UI data
interface TripWithStats extends Trip {
  author: {
    name: string;
    image: string;
    bio?: string;
  };
}

const route = useRoute();
const destination = ref<TripWithStats | null>(null);

// Mock author data - replace with actual author data from your database
const getAuthorData = (authorId: number) => ({
  name: "Travel Explorer",
  image: "https://i.pravatar.cc/150?img=" + authorId,
  bio: "นักท่องเที่ยว | ช่างภาพ | แชร์ประสบการณ์การเดินทาง",
});

const openMap = () => {
  if (destination.value?.latitude && destination.value?.longitude) {
    const lat = destination.value.latitude;
    const lng = destination.value.longitude;
    // Opens Google Maps in a new tab searching for these coordinates
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  }
};

// Mock stats - replace with actual data from your database
const getStats = () => ({
  likes: Math.floor(Math.random() * 2000) + 500,
  comments: Math.floor(Math.random() * 200) + 50,
  views: Math.floor(Math.random() * 10000) + 1000,
});

onMounted(() => {
  const tripId = Number(route.params.id);
  const trip = trips.find((t) => t.id === tripId);

  if (trip) {
    destination.value = {
      ...trip,
      author: getAuthorData(trip.author_id),
      ...getStats(),
    };
  }
});
</script>
<template>
  <div v-if="destination" class="min-h-screen bg-gray-50">
    <div class="bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-96"
        >
          <div
            class="col-span-1 md:col-span-2 md:row-span-2 h-64 md:h-full relative"
          >
            <img
              :src="destination.photos[0]"
              :alt="destination.title"
              class="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            />
          </div>

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

            <Button
              v-if="destination.latitude && destination.longitude"
              @click="openMap"
              >View on Google Maps</Button
            >

            <div
              class="flex items-center gap-6 text-gray-500 text-sm mb-6 pb-6 border-b"
            />

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
                :src="destination.author.image"
                :alt="destination.author.name"
                class="w-16 h-16 rounded-full object-cover border-2 border-green-200"
              />
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">
                  {{ destination.author.name }}
                </h4>
                <p
                  v-if="destination.author.bio"
                  class="text-sm text-gray-600 mt-1"
                >
                  {{ destination.author.bio }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
