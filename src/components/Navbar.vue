<script setup lang="ts">
import Button from "./Button.vue";
import { Plane } from "lucide-vue-next";
import { useRouter } from "vue-router";

const router = useRouter();

const handleLogin = () => {
  router.push("/login");
  console.log("Login clicked");
};

const handleSignup = () => {
  router.push("/signup");
  console.log("Sign up clicked");
};
</script>

<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Brand -->
        <div class="flex items-center space-x-2">
          <Plane class="w-6 h-6 text-black" />
          <a href="/" class="text-2xl font-bold"> TravelTrip </a>
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center space-x-4">
          <Button variant="outline" @click="handleLogin">Log in</Button>
          <Button variant="outline" @click="handleSignup">Sign up</Button>
        </div>
      </div>
    </div>
  </nav>
</template>
