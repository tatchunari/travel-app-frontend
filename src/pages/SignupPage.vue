<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSignUp } from "@clerk/vue";
import Button from "../components/Button.vue";

const { signUp, isLoaded, setActive } = useSignUp();
const router = useRouter();

// Form Fields
const name = ref("");
const email = ref("");
const password = ref("");
const code = ref("");

// UI State
const isLoading = ref(false);
const showPassword = ref(false);
const pendingVerification = ref(false);
const errorMessage = ref("");

const handleSignup = async () => {
  if (!isLoaded.value || !signUp.value || !setActive.value) return;
  isLoading.value = true;
  errorMessage.value = "";

  try {
    // split name into first/last for Clerk
    const nameParts = name.value.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    // Create the user in Clerk
    await signUp.value.create({
      firstName,
      lastName,
      emailAddress: email.value,
      password: password.value,
    });

    // Request the email code
    await signUp.value.prepareEmailAddressVerification({
      strategy: "email_code",
    });

    // Switch UI to Verification Mode
    pendingVerification.value = true;
  } catch (err: any) {
    console.error("Signup failed:", err);
    errorMessage.value = err.errors[0]?.longMessage || "Signup failed";
  } finally {
    isLoading.value = false;
  }
};

// Verify Code & Activate Session
const handleVerification = async () => {
  if (!isLoaded.value || !signUp.value || !setActive.value) return;
  isLoading.value = true;
  errorMessage.value = "";

  try {
    // Verify the code
    const result = await signUp.value.attemptEmailAddressVerification({
      code: code.value,
    });

    // If verified, set active session
    if (result.status === "complete") {
      await setActive.value({ session: result.createdSessionId });
      router.push("/");
    } else {
      console.log("Verification invalid", result);
    }
  } catch (err: any) {
    console.error("Verification failed:", err);
    errorMessage.value = err.errors[0]?.longMessage || "Invalid code";
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
        <h2 class="text-3xl font-bold text-gray-900">
          {{ pendingVerification ? "Check your email" : "Create your account" }}
        </h2>

        <!-- Only show login link if NOT verifying -->
        <p v-if="!pendingVerification" class="mt-2 text-sm text-gray-600">
          Already have an account?
          <a
            href="/login"
            class="font-medium text-green-600 hover:text-green-500"
          >
            Sign in
          </a>
        </p>
        <p v-else class="mt-2 text-sm text-gray-600">
          We sent a 6-digit code to <span class="font-bold">{{ email }}</span>
        </p>
      </div>

      <!-- FORM 1: INITIAL SIGNUP -->
      <form
        v-if="!pendingVerification"
        @submit.prevent="handleSignup"
        class="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md"
      >
        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2"
            >Full name</label
          >
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

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

        <div
          v-if="errorMessage"
          class="text-red-500 text-sm bg-red-50 p-2 rounded text-center"
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
          Create account
        </Button>
      </form>

      <!-- FORM 2: VERIFICATION CODE -->
      <form
        v-else
        @submit.prevent="handleVerification"
        class="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md"
      >
        <div>
          <label for="code" class="block text-sm font-medium text-gray-700 mb-2"
            >Verification Code</label
          >
          <input
            id="code"
            v-model="code"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center tracking-widest text-lg"
            placeholder="123456"
          />
        </div>

        <div
          v-if="errorMessage"
          class="text-red-500 text-sm bg-red-50 p-2 rounded text-center"
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
          Verify Email
        </Button>

        <button
          type="button"
          @click="pendingVerification = false"
          class="w-full text-center text-sm text-gray-500 hover:text-gray-700"
        >
          Back to signup
        </button>
      </form>
    </div>
  </div>
</template>
