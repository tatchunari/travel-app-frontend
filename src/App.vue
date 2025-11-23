<script setup lang="ts">
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <div class="bg-gray-50">
    <Navbar />

    <router-view />

    <Footer />
  </div>
</template>
