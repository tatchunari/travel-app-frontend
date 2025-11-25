<script setup lang="ts">
import Button from "./Button.vue";
import { Plane } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { UserButton, useUser } from "@clerk/vue"; // 1. Import Clerk

const router = useRouter();
const { isSignedIn, user, isLoaded } = useUser(); // 2. Get the auth state

const handleLogin = () => {
  router.push("/login");
};

const handleSignup = () => {
  router.push("/signup");
};
</script>

<template>
  <nav class="bg-white shadow-md sticky top-0 z-50 py-3">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Brand -->
        <div
          class="flex items-center space-x-2 cursor-pointer"
          @click="router.push('/')"
        >
          <Plane class="w-6 h-6 text-green-600" />
          <span class="text-2xl font-bold text-gray-900">TravelTrip</span>
        </div>

        <!-- Auth Section -->
        <div class="flex items-center space-x-4">
          <!-- STATE 1: LOADING (Show a placeholder to prevent flicker) -->
          <div v-if="!isLoaded" class="opacity-50 text-sm">Loading...</div>

          <!-- STATE 2: LOGGED IN -->
          <div v-else-if="isSignedIn" class="flex items-center gap-4">
            <!-- Optional: Greeting -->
            <span class="text-sm font-medium text-gray-700 hidden sm:block">
              Hello, {{ user?.firstName || "Traveler" }}
            </span>

            <!-- Clerk's Magic Button: Shows Avatar + Sign Out Menu -->
            <UserButton afterSignOutUrl="/" />
          </div>

          <!-- STATE 3: LOGGED OUT -->
          <div v-else class="flex items-center space-x-4">
            <Button variant="outline" @click="handleLogin">Log in</Button>
            <!-- Changed Signup to 'primary' to make it pop -->
            <Button variant="primary" @click="handleSignup">Sign up</Button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
