<script setup lang="ts">
import { ref } from "vue";
import HeroSection from "../components/sections/HeroSection.vue";
import TravelCardSection from "../components/sections/TravelCardSection.vue";

const searchQuery = ref("");
</script>

<template>
  <div class="min-h-screen w-full bg-white flex flex-col">
    <HeroSection @search="searchQuery = $event" />

    <TravelCardSection :search="searchQuery" />
  </div>
</template>
