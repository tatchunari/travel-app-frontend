<script setup lang="ts">
import { ref } from "vue";
import Button from "../components/Button.vue";

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const showPassword = ref(false);

const handleSignup = async () => {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match!");
    return;
  }

  isLoading.value = true;

  try {
    // Your signup API call here
    console.log("Signup with:", {
      name: name.value,
      email: email.value,
      password: password.value,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Handle success (e.g., redirect to login or dashboard)
  } catch (error) {
    console.error("Signup failed:", error);
  } finally {
    isLoading.value = false;
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div
    class="mt-20 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Create your account</h2>
        <p class="mt-2 text-sm text-gray-600">
          Already have an account?
          <a
            href="/login"
            class="font-medium text-green-600 hover:text-green-500"
          >
            Sign in
          </a>
        </p>
      </div>

      <!-- Signup Form -->
      <form
        @submit.prevent="handleSignup"
        class="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md"
      >
        <!-- Name Input -->
        <div>
          <label
            for="name"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Full name
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <!-- Email Input -->
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Email address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <!-- Password Input -->
        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="8"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg
                v-if="!showPassword"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <svg
                v-else
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            Must be at least 8 characters
          </p>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          variant="primary"
          size="lg"
          :loading="isLoading"
          :full-width="true"
        >
          Create account
        </Button>
      </form>
    </div>
  </div>
</template>
