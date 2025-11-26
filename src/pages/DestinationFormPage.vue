<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from "lucide-vue-next";
import Button from "../components/Button.vue";
import type { Trip } from "../types/types";
import { saveTrip, getTripById } from "../api/tripsApi";
import { useAuth } from "@clerk/vue";

const route = useRoute();
const router = useRouter();
const { getToken, isLoaded: isAuthLoaded } = useAuth(); // <-- Token retrieval hooks are here

// --- STATE ---
const isEditing = computed(() => !!route.params.id);
const tripIdToEdit = computed(() =>
  route.params.id ? Number(route.params.id) : null
);

// Form State (Aligned with API Trip interface)
const formData = ref<Partial<Trip>>({
  id: undefined,
  title: "",
  description: "",
  photos: [],
  tags: [],
  latitude: 0,
  longitude: 0,
});

// Helper for single image URL input (to match current template UI)
const photoUrlInput = ref("");
// Helper for comma-separated tags input (to match current template UI)
const tagsInput = ref("");

// UI State
const isLoading = ref(true); // Loading for initial fetch in edit mode
const isSaving = ref(false); // Saving/submitting state
const statusMessage = ref<{
  type: "success" | "error" | null;
  message: string;
}>({ type: null, message: "" });

// --- DATA LOADING ---

const fetchTripForEdit = async (id: number) => {
  isLoading.value = true;
  try {
    const token = await getToken.value();
    if (!token) {
      throw new Error("User must be logged in to edit this trip.");
    }
    // Fetch trip details using the authenticated endpoint
    const trip = await getTripById(id, token);

    // Populate form data
    formData.value = {
      ...trip,
      id: trip.id,
    };
    // Populate single inputs for the UI
    photoUrlInput.value = trip.photos[0] || "";
    tagsInput.value = trip.tags.join(", ");
  } catch (error: any) {
    console.error("Failed to fetch trip for editing:", error);
    statusMessage.value = {
      type: "error",
      message: `Failed to load trip: ${
        error.message || "It may not exist or belong to you."
      }`,
    };
    // Redirect if fetch fails critically
    router.push("/dashboard");
  } finally {
    isLoading.value = false;
  }
};

// Load data if editing
onMounted(() => {
  if (isEditing.value && tripIdToEdit.value) {
    fetchTripForEdit(tripIdToEdit.value);
  } else {
    // Set default values for new trip
    photoUrlInput.value =
      "https://placehold.co/600x400/94A3B8/ffffff?text=Add+Photo";
    formData.value.latitude = 0;
    formData.value.longitude = 0;
    isLoading.value = false;
  }
});

// --- FORM SUBMISSION ---

const handleSave = async () => {
  if (!formData.value.title) {
    statusMessage.value = { type: "error", message: "Title is required." };
    return;
  }

  if (isSaving.value) return;
  isSaving.value = true;
  statusMessage.value = { type: null, message: "" };

  try {
    const token = await getToken.value();
    if (!token) {
      throw new Error("User must be logged in to save this trip.");
    }

    // 1. Prepare Payload (Convert UI inputs back to array format for the API)
    const finalPayload: Trip = {
      id: isEditing.value ? tripIdToEdit.value : null,
      title: formData.value.title || "",
      description: formData.value.description || "",
      photos: [photoUrlInput.value].filter((url) => url),
      tags: tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      // Ensure numbers are used, even if 0
      latitude: formData.value.latitude || 0,
      longitude: formData.value.longitude || 0,
      // authorId is injected by the backend controller, so we don't send it.
    } as Trip;

    // 2. Call the secure API
    const savedTrip = await saveTrip(finalPayload, token);

    const action = isEditing.value ? "updated" : "created";
    statusMessage.value = {
      type: "success",
      message: `Trip successfully ${action}! Redirecting...`,
    };

    // 3. Redirect to the newly created/updated trip details page
    setTimeout(() => {
      router.push(`/trip/${savedTrip.id}`);
    }, 1500);
  } catch (error: any) {
    console.error("Submission failed:", error);
    statusMessage.value = {
      type: "error",
      message: `Failed to save trip: ${
        error.message || "Check console for details."
      }`,
    };
  } finally {
    isSaving.value = false;
  }
};

// --- UTILITY ACTIONS ---

// Clear status messages after a short delay
watch(
  statusMessage,
  (newVal) => {
    if (newVal.type !== null) {
      setTimeout(() => {
        statusMessage.value = { type: null, message: "" };
      }, 5000);
    }
  },
  { deep: true }
);

// Removed handleSetLocation mock action
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <button
          @click="router.back()"
          class="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft class="w-4 h-4 mr-1" />
          Back to Dashboard
        </button>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ isEditing ? "Edit Destination" : "Add New Destination" }}
        </h1>
      </div>

      <!-- Form Card -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <Loader2 class="w-8 h-8 text-green-500 animate-spin mr-3" />
          <p class="text-lg text-gray-600">
            {{
              isEditing ? "Fetching trip details..." : "Initializing form..."
            }}
          </p>
        </div>

        <!-- Main Form Content -->
        <div v-else class="p-6 space-y-6">
          <!-- Status Message -->
          <div
            v-if="statusMessage.type"
            :class="{
              'bg-green-100 border-green-500 text-green-700':
                statusMessage.type === 'success',
              'bg-red-100 border-red-500 text-red-700':
                statusMessage.type === 'error',
            }"
            class="border-l-4 p-4 rounded-lg"
            role="alert"
          >
            <p class="font-bold">
              {{ statusMessage.type === "success" ? "Success!" : "Error!" }}
            </p>
            <p>{{ statusMessage.message }}</p>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Destination Name</label
            >
            <input
              v-model="formData.title"
              type="text"
              required
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="e.g. Koh Tao, Surat Thani"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Description</label
            >
            <textarea
              v-model="formData.description"
              rows="4"
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="Describe the atmosphere, best time to visit, etc..."
            ></textarea>
          </div>

          <!-- Image URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Cover Image URL (First Photo)</label
            >
            <div class="flex gap-2 mb-3">
              <div class="relative grow">
                <ImageIcon
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                />
                <input
                  v-model="photoUrlInput"
                  type="text"
                  class="w-full pl-10 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>

            <!-- Image Preview -->
            <div
              class="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group"
            >
              <img
                v-if="photoUrlInput"
                :src="photoUrlInput"
                class="w-full h-full object-cover"
                alt="Preview"
                @error="photoUrlInput = ''"
              />
              <div
                v-else
                class="w-full h-full flex flex-col items-center justify-center text-gray-400"
              >
                <ImageIcon class="w-8 h-8 mb-2" />
                <span class="text-sm">Image preview will appear here</span>
              </div>
            </div>
          </div>

          <!-- Location Input -->
          <div class="space-y-4 pt-2 border-t border-gray-200">
            <h2 class="text-base font-medium text-gray-800">
              Location Coordinates
            </h2>

            <div
              class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <!-- Latitude Input -->
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Latitude</label
                >
                <input
                  v-model.number="formData.latitude"
                  type="number"
                  step="any"
                  class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="e.g. 34.0522"
                />
              </div>

              <!-- Longitude Input -->
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Longitude</label
                >
                <input
                  v-model.number="formData.longitude"
                  type="number"
                  step="any"
                  class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="e.g. -118.2437"
                />
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Tags</label
            >
            <input
              v-model="tagsInput"
              type="text"
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              placeholder="Beach, Hiking, Nature (Comma separated)"
            />
            <p class="mt-1 text-xs text-gray-500">Separate tags with commas</p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          class="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200"
        >
          <button
            @click="router.back()"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            @click="handleSave"
            :loading="isSaving"
            :disabled="!formData.title || isSaving"
          >
            <div class="flex items-center gap-2">
              <Save class="w-4 h-4" />
              <span>{{ isEditing ? "Save Changes" : "Create Trip" }}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
