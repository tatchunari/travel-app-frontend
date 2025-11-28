<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Save, Loader2 } from "lucide-vue-next";
import Button from "../components/Button.vue";
import CloudinaryUploader from "../components/CloudinaryUploader.vue";

import type { Trip } from "../types/types";
import { saveTrip, getTripById } from "../api/tripsApi";
import { useAuth, useUser } from "@clerk/vue";

const route = useRoute();
const router = useRouter();
const { getToken, isLoaded: isAuthLoaded } = useAuth();
const { user, isLoaded: isUserLoaded } = useUser();

// --- STATE ---
const isEditing = computed(() => !!route.params.id);
const tripIdToEdit = computed(() =>
  route.params.id ? Number(route.params.id) : null
);

const formData = ref<Partial<Trip>>({
  id: undefined,
  title: "",
  description: "",
  photos: [],
  tags: [],
  latitude: 0,
  longitude: 0,
  authorName: "",
  authorImageUrl: "",
});

const tagsInput = ref("");

// UI State
const isLoading = ref(true);
const isSaving = ref(false);
const statusMessage = ref<{
  type: "success" | "error" | null;
  message: string;
}>({ type: null, message: "" });

// --- DATA LOADING ---
const fetchTripForEdit = async (id: number) => {
  isLoading.value = true;
  try {
    const token = await getToken.value();
    if (!token) throw new Error("User must be logged in to edit this trip.");

    const trip = await getTripById(id, token);
    formData.value = { ...trip };
    formData.value.photos = trip.photos || [];
    tagsInput.value = trip.tags.join(", ");
  } catch (error: any) {
    console.error("Failed to fetch trip for editing:", error);
    statusMessage.value = {
      type: "error",
      message: `Failed to load trip: ${error.message || "Trip not found."}`,
    };
    router.push("/dashboard");
  } finally {
    isLoading.value = false;
  }
};

watch(
  [isAuthLoaded, isUserLoaded],
  ([authReady, userReady]) => {
    if (authReady && userReady) {
      if (isEditing.value && tripIdToEdit.value) {
        fetchTripForEdit(tripIdToEdit.value);
      } else if (!isEditing.value && user.value) {
        formData.value.authorName =
          user.value.fullName || user.value.username || "Unknown User";
        formData.value.authorImageUrl = user.value.imageUrl;
        formData.value.photos = [];
        formData.value.latitude = 0;
        formData.value.longitude = 0;
        isLoading.value = false;
      }
    }
  },
  { immediate: true }
);

// --- FORM SUBMISSION ---
const handleSave = async () => {
  if (!formData.value.title) {
    statusMessage.value = { type: "error", message: "Title is required." };
    return;
  }

  if (!formData.value.photos || formData.value.photos.length === 0) {
    statusMessage.value = {
      type: "error",
      message: "At least one image is required.",
    };
    return;
  }

  if (isSaving.value) return;
  isSaving.value = true;
  statusMessage.value = { type: null, message: "" };

  try {
    const token = await getToken.value();
    if (!token) throw new Error("User must be logged in.");

    if (user.value) {
      formData.value.authorName =
        user.value.fullName || user.value.username || "Unknown User";
      formData.value.authorImageUrl = user.value.imageUrl;
    }

    const finalPayload: Trip = {
      id: isEditing.value ? tripIdToEdit.value : null,
      title: formData.value.title || "",
      description: formData.value.description || "",
      photos: formData.value.photos,
      tags: tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      latitude: formData.value.latitude || 0,
      longitude: formData.value.longitude || 0,
      authorName: formData.value.authorName || "",
      authorImageUrl: formData.value.authorImageUrl || "",
    } as Trip;

    const savedTrip = await saveTrip(finalPayload, token);

    const action = isEditing.value ? "updated" : "created";
    statusMessage.value = {
      type: "success",
      message: `Trip successfully ${action}! Redirecting...`,
    };

    setTimeout(() => {
      router.push(`/trip/${savedTrip.id}`);
    }, 1500);
  } catch (error: any) {
    console.error("Submission failed:", error);
    statusMessage.value = {
      type: "error",
      message: `Failed to save trip: ${error.message || "Check console."}`,
    };
  } finally {
    isSaving.value = false;
  }
};
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
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 space-y-6"
      >
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

        <!-- Cloudinary Image Uploader -->
        <CloudinaryUploader v-model="formData.photos" />

        <!-- Location -->
        <div class="space-y-4 pt-2 border-t border-gray-200">
          <h2 class="text-base font-medium text-gray-800">
            Location Coordinates
          </h2>
          <div
            class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Latitude</label
              >
              <input
                v-model.number="formData.latitude"
                type="number"
                step="any"
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Longitude</label
              >
              <input
                v-model.number="formData.longitude"
                type="number"
                step="any"
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
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

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3">
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
