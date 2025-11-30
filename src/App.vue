<script setup lang="ts">
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <!-- Root div for the entire application -->
  <!-- We use min-h-screen and flex-col to push the footer to the bottom -->
  <div class="flex flex-col min-h-screen bg-gray-50">
    <Navbar />

    <!-- Main Content Wrapper: Uses flex-grow to take all remaining vertical space -->
    <main class="grow">
      <router-view />
    </main>

    <!-- Footer: Stays anchored to the bottom -->
    <Footer />
  </div>
</template>
