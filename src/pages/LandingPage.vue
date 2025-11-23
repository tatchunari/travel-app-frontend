<script setup lang="ts">
import Navbar from "../components/Navbar.vue";
import Footer from "../components/Footer.vue";
import HighlightSection from "../components/sections/HighlightSection.vue";
import HeroSection from "../components/sections/HeroSection.vue";
</script>

<template>
  <Navbar />
  <div class="min-h-screen flex flex-col bg-gray-50 w-full">
    <!-- Main Content -->
    <main class="w-full">
      <!-- Hero Section (Full Width) -->
      <HeroSection />

      <!-- Other Sections (Constrained Width) -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HighlightSection />
      </div>
    </main>
  </div>
  <!-- Footer -->
  <Footer />
</template>
