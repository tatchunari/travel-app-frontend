<script setup lang="ts">
import { ref } from "vue";

interface Destination {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

const destinations = ref<Destination[]>([
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop",
    title: "Swiss Alps",
    subtitle: "เทือกเขาเอลส์ป",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=500&fit=crop",
    title: "Venice, Italy",
    subtitle: "เวนิซ อิตาลี",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=500&fit=crop",
    title: "Tokyo, Japan",
    subtitle: "โตเกียว ญี่ปุ่น",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=400&h=500&fit=crop",
    title: "Northern Vietnam",
    subtitle: "เวียดนาม",
  },
]);

const hoveredId = ref<number | null>(null);
</script>

<template>
  <section class="mt-10 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-5">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Popular Destinations
        </h2>
        <p class="text-gray-600">จุดท่องเที่ยวยอดฮิต</p>
      </div>

      <!-- Image Grid -->
      <div class="flex justify-center items-center gap-4 flex-wrap">
        <div
          v-for="destination in destinations"
          :key="destination.id"
          class="relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 ease-in-out"
          :class="[
            hoveredId === destination.id
              ? 'w-74 h-90 z-20 scale-100 shadow-2xl'
              : 'w-64 h-80 z-10 shadow-lg',
          ]"
          @mouseenter="hoveredId = destination.id"
          @mouseleave="hoveredId = null"
        >
          <!-- Image -->
          <img
            :src="destination.image"
            :alt="destination.title"
            class="w-full h-full object-cover"
          />

          <!-- Overlay -->
          <div
            class="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"
          ></div>

          <!-- Content -->
          <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 class="text-xl font-bold mb-1">{{ destination.title }}</h3>
            <p class="text-sm text-gray-200">{{ destination.subtitle }}</p>
          </div>

          <!-- Hover Effect Border -->
          <div
            v-if="hoveredId === destination.id"
            class="absolute inset-0 border-4 border-white/30 rounded-lg pointer-events-none"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>
