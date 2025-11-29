<script setup lang="ts">
import Button from "./Button.vue";
import { Plane } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { UserButton, useUser } from "@clerk/vue";
import { SignInButton } from "@clerk/vue";

const router = useRouter();
const { isSignedIn, user, isLoaded } = useUser();

const handleLogin = () => {
  router.push("/login");
};

const handleSignup = () => {
  router.push("/signup");
};
</script>

<template>
  <nav class="bg-white shadow-md sticky top-0 z-50 py-2">
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
          <div v-if="!isLoaded" class="opacity-50 text-sm">Loading...</div>

          <div v-else-if="isSignedIn" class="flex items-center gap-4">
            <Button
              variant="primary"
              size="sm"
              @click="router.push('/dashboard')"
              >Dashboard</Button
            >

            <UserButton afterSignOutUrl="/" />
          </div>

          <!-- LOGGED OUT -->
          <div v-else class="flex items-center space-x-4">
            <!-- <Button variant="outline" @click="handleLogin">Log in</Button> -->
            <SignInButton mode="modal">
              <Button variant="outline">Log in</Button>
            </SignInButton>

            <Button variant="primary" @click="handleSignup">Sign up</Button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
