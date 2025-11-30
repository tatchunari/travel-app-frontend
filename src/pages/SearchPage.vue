<script setup lang="ts">
import HeroSection from "../components/sections/HeroSection.vue";
import TravelCardSection from "../components/sections/TravelCardSection.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 w-full">
    <main class="w-full">
      <!-- Hero Section  -->
      <HeroSection />

      <!-- Other Sections  -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TravelCardSection />
      </div>
    </main>
  </div>
</template>
