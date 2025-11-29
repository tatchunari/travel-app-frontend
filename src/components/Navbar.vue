<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Button from "./Button.vue";
import { Plane } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { UserButton, useUser, SignInButton } from "@clerk/vue";

const router = useRouter();
const { isSignedIn, isLoaded } = useUser();

const handleSignup = () => {
  router.push("/signup");
};

// --- SCROLL LOGIC ---
const isScrolled = ref(false);
const SCROLL_THRESHOLD = 50; // Distance in pixels before the background appears

const handleScroll = () => {
  // Check if the current scroll position is past the threshold
  isScrolled.value = window.scrollY > SCROLL_THRESHOLD;
};

onMounted(() => {
  // Attach the event listener when the component mounts
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  // Remove the event listener when the component is destroyed to prevent memory leaks
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <nav
    :class="{
      // Base classes: always sticky, transition, high z-index
      'sticky top-0 z-50 transition-colors duration-300': true,
      // Scrolled classes: apply background, shadow, and blur
      'bg-gray/80 backdrop-blur-sm shadow-xl': isScrolled,
      // Initial state classes: transparent background
      'bg-transparent': !isScrolled,
    }"
  >
    <div class="max-w-7xl mx-auto px-10 sm:px-6 lg:px-8 py-3">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Brand -->
        <div
          class="flex items-center space-x-2 cursor-pointer"
          @click="router.push('/')"
        >
          <Plane class="w-6 h-6 text-[#162842]" />
          <span class="text-2xl font-bold text-[#162842] tracking-wider"
            >TravelTrip</span
          >
        </div>

        <!-- Auth Section -->
        <div class="flex items-center space-x-4">
          <div v-if="!isLoaded" class="opacity-50 text-sm text-white">
            Loading...
          </div>

          <div v-else-if="isSignedIn" class="flex items-center gap-4">
            <Button
              variant="ghost"
              class="text-[#101f36] font-semibold hover:bg-black/20"
              size="sm"
              @click="router.push('/dashboard')"
              >Dashboard</Button
            >

            <UserButton afterSignOutUrl="/" />
          </div>

          <!-- LOGGED OUT -->
          <div v-else class="flex items-center space-x-4">
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                class="text-white hover:text-[#162842] hover:bg-black/20"
                >Log in</Button
              >
            </SignInButton>

            <Button variant="primary" @click="handleSignup">Sign up</Button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
