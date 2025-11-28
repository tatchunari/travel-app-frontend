<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSignIn } from "@clerk/vue";
import Button from "../components/Button.vue";

const router = useRouter();
const { signIn, isLoaded, setActive } = useSignIn();

// Form fields
const email = ref("");
const password = ref("");

// UI state
const isLoading = ref(false);
const showPassword = ref(false);
const errorMessage = ref("");

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  if (!isLoaded.value || !signIn.value || !setActive.value) return;

  isLoading.value = true;
  errorMessage.value = "";

  try {
    // 1) Create a sign-in attempt (EMAIL ONLY)
    const si = await signIn.value.create({
      identifier: email.value,
    });

    // 2) Attempt the password factor
    const result = await si.attemptFirstFactor({
      strategy: "password",
      password: password.value,
    });

    // 3) If complete → success
    if (result.status === "complete") {
      await setActive.value({ session: result.createdSessionId });
      router.push("/");
      return;
    }

    if (result.status === "needs_second_factor") {
      errorMessage.value = "Your Clerk user requires 2FA.";
      return;
    }

    errorMessage.value = "Unexpected login step: " + result.status;
  } catch (err: any) {
    console.error("Login failed:", err);
    errorMessage.value =
      err?.errors?.[0]?.longMessage || "Invalid email or password";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="mt-20 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p class="mt-2 text-sm text-gray-600">
          Don't have an account?
          <a
            href="/signup"
            class="font-medium text-green-600 hover:text-green-500"
          >
            Sign up
          </a>
        </p>
      </div>

      <form
        @submit.prevent="handleLogin"
        class="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md"
      >
        <!-- Email -->
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-2"
            >Email address</label
          >
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <!-- Password -->
        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-2"
            >Password</label
          >
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
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
        </div>

        <!-- Error -->
        <div
          v-if="errorMessage"
          class="text-red-500 text-sm text-center bg-red-50 p-2 rounded"
        >
          {{ errorMessage }}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          :loading="isLoading"
          :full-width="true"
        >
          Sign in
        </Button>
      </form>
    </div>
  </div>
</template>
