<script setup lang="ts">
import { useRouter } from "vue-router";
import TravelCard from "../TravelCard.vue";
import { trips } from "../../utils/trips";

const router = useRouter();
</script>

<template>
  <section class="py-12 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
        เที่ยวไหนดี
      </h1>

      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <TravelCard
          v-for="destination in trips"
          :key="destination.id"
          :image="destination.photos[0]"
          :title="destination.title"
          :description="destination.description"
          @click="router.push(`/trip/${destination.id}`)"
        />
      </div>
    </div>
  </section>
</template>
