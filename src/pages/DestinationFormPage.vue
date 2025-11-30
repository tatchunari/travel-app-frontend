<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Save, Loader2 } from "lucide-vue-next";
import Button from "../components/Button.vue";
import type { Trip } from "../types/types";
import { saveTrip, getTripById } from "../api/tripsApi";
import { useAuth, useUser } from "@clerk/vue";
import CloudinaryUploader from "../components/CloudinaryUploader.vue";

const route = useRoute();
const router = useRouter();
const { getToken, isLoaded: isAuthLoaded } = useAuth();
const { user, isLoaded: isUserLoaded } = useUser();

// --- STATE ---
const isEditing = computed(() => !!route.params.id);
const tripIdToEdit = computed(() =>
  route.params.id ? Number(route.params.id) : null
);

// We need a helper to ensure we always have 4 photo slots ready
const getInitialPhotos = (existingPhotos?: string[]): string[] => {
  let photos = existingPhotos || [];
  // Ensure minimum of 4 slots are present for the minimum photo requirement
  while (photos.length < 4) {
    photos.push("");
  }
  return photos;
};

const formData = ref<Partial<Trip>>({
  id: undefined,
  title: "",
  description: "",
  // Initialize with at least 4 empty strings
  photos: getInitialPhotos(),
  tags: [],
  latitude: 0,
  longitude: 0,
  authorName: "",
  authorImageUrl: "",
});

const tagsInput = ref("");

// --- VALIDATION STATE ---
// Store errors keyed by field name
const validationErrors = ref<{
  title?: string;
  description?: string;
  latitude?: string;
  longitude?: string;
  photos?: string;
}>({});

// UI State
const isLoading = ref(true);
const isSaving = ref(false);
const statusMessage = ref<{
  type: "success" | "error" | null;
  message: string;
}>({ type: null, message: "" });

// --- VALIDATION LOGIC ---

// This method runs client-side validation for UX
const validateForm = (): boolean => {
  validationErrors.value = {}; // Clear previous errors
  let isValid = true;

  // 1. Title is required
  if (!formData.value.title || formData.value.title.trim() === "") {
    validationErrors.value.title = "Destination Name is required.";
    isValid = false;
  }

  // 2. Description is required
  if (!formData.value.description || formData.value.description.trim() === "") {
    validationErrors.value.description = "Description is required.";
    isValid = false;
  }

  // 3. Latitude/Longitude checks (must be numeric and in range)
  const lat = formData.value.latitude;
  const lon = formData.value.longitude;

  if (typeof lat !== "number" || isNaN(lat) || lat < -90 || lat > 90) {
    validationErrors.value.latitude =
      "Latitude must be a number between -90 and 90.";
    isValid = false;
  }
  if (typeof lon !== "number" || isNaN(lon) || lon < -180 || lon > 180) {
    validationErrors.value.longitude =
      "Longitude must be a number between -180 and 180.";
    isValid = false;
  }

  // 4. Photos check (must have at least 4 valid photo URLs/Data URLs)
  const validPhotos =
    formData.value.photos?.filter((url) => url && url.trim()) || [];
  if (validPhotos.length < 4) {
    validationErrors.value.photos = `A minimum of 4 images must be uploaded. You currently have ${validPhotos.length}.`;
    isValid = false;
  }

  return isValid;
};

// Computed property to disable the Save button
const formIsInvalid = computed(() => !validateForm());

// Watch formData changes to trigger live validation feedback
watch(
  formData,
  () => {
    if (Object.keys(validationErrors.value).length > 0) {
      // Only re-validate live if an error is already displayed
      validateForm();
    }
  },
  { deep: true }
);

// --- DATA LOADING ---

const fetchTripForEdit = async (id: number) => {
  isLoading.value = true;
  try {
    const token = await getToken.value();
    if (!token) throw new Error("User must be logged in to edit this trip.");

    const trip = await getTripById(id, token);

    // Populate form data
    formData.value = { ...trip };
    // Use helper to ensure edit mode starts with correct number of slots
    formData.value.photos = getInitialPhotos(trip.photos);
    tagsInput.value = trip.tags.join(", ");
  } catch (error: any) {
    console.error("Failed to fetch trip for editing:", error);
    statusMessage.value = {
      type: "error",
      message: `Failed to load trip: ${
        error.message || "It may not exist or belong to you."
      }`,
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
      } else if (!isEditing.value) {
        if (user.value) {
          formData.value.authorName =
            user.value.fullName || user.value.username || "Unknown User";
          formData.value.authorImageUrl = user.value.imageUrl;
        }

        // Initialize new trip with 4 slots
        formData.value.photos = getInitialPhotos();
        formData.value.latitude = 0;
        formData.value.longitude = 0;
        isLoading.value = false;
      }
    }
  },
  { immediate: true }
);

// --- FORM SUBMISSION (with Backend Error Parsing) ---

const handleSave = async () => {
  // 🛑 STEP 1: Run frontend validation first
  if (!validateForm()) {
    statusMessage.value = {
      type: "error",
      message: "Please correct the highlighted errors.",
    };
    return;
  }

  if (isSaving.value) return;
  isSaving.value = true;
  statusMessage.value = { type: null, message: "" };

  try {
    const token = await getToken.value();
    if (!token)
      throw new Error("User must be logged in to create or edit a trip.");

    if (user.value) {
      formData.value.authorName =
        user.value.fullName || user.value.username || "Unknown User";
      formData.value.authorImageUrl = user.value.imageUrl;
    }

    // Prepare Payload: send only the valid (non-empty) photo URLs/Data URLs
    const validPhotos =
      formData.value.photos?.filter((url) => url.trim()) || [];

    const finalPayload: Trip = {
      id: isEditing.value ? tripIdToEdit.value : null,
      title: formData.value.title || "",
      description: formData.value.description || "",
      photos: validPhotos,
      tags: tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      latitude: formData.value.latitude || 0,
      longitude: formData.value.longitude || 0,

      authorName: formData.value.authorName || "",
      authorImageUrl: formData.value.authorImageUrl || "",
    } as Trip;

    // 🛑 STEP 2: Send validated payload to backend
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

    let displayMessage = `Failed to save trip: Check console for details.`;

    // --- BACKEND ERROR PARSING (BindingResult) ---
    if (
      error.response &&
      error.response.status === 400 &&
      Array.isArray(error.response.data)
    ) {
      // The backend returned a 400 with the list of validation errors
      const backendErrors = error.response.data;
      validationErrors.value = {}; // Clear old errors

      backendErrors.forEach((err: any) => {
        const field = err.field; // The name of the field that failed validation (e.g., "title")
        const message = err.defaultMessage; // The custom error message (e.g., "Title must be between 3 and 100 characters.")

        if (field && message) {
          // Map error to the corresponding frontend validation state property
          (validationErrors.value as any)[field] = message;
        }
      });

      if (Object.keys(validationErrors.value).length > 0) {
        displayMessage =
          "Please correct the highlighted errors received from the server.";
      }
    } else {
      // General errors (500, 401, 403, 404, etc.)
      displayMessage = error.message || "An unexpected error occurred.";
    }

    statusMessage.value = {
      type: "error",
      message: displayMessage,
    };
  } finally {
    isSaving.value = false;
  }
};

// --- UTILITY ACTIONS ---

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
            :class="{ 'border-red-500 ring-red-500': validationErrors.title }"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            placeholder="e.g. Koh Tao, Surat Thani"
            @blur="validateForm"
          />
          <p v-if="validationErrors.title" class="text-xs text-red-600 mt-1">
            {{ validationErrors.title }}
          </p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Description</label
          >
          <textarea
            v-model="formData.description"
            rows="4"
            :class="{
              'border-red-500 ring-red-500': validationErrors.description,
            }"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            placeholder="Describe the atmosphere, best time to visit, etc..."
            @blur="validateForm"
          ></textarea>
          <p
            v-if="validationErrors.description"
            class="text-xs text-red-600 mt-1"
          >
            {{ validationErrors.description }}
          </p>
        </div>

        <!-- Multiple Image Uploader -->
        <CloudinaryUploader v-model="formData.photos" />
        <p v-if="validationErrors.photos" class="text-xs text-red-600 -mt-3">
          {{ validationErrors.photos }}
        </p>

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
                :class="{
                  'border-red-500 ring-red-500': validationErrors.latitude,
                }"
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                placeholder="e.g. 34.0522"
                @blur="validateForm"
              />
              <p
                v-if="validationErrors.latitude"
                class="text-xs text-red-600 mt-1"
              >
                {{ validationErrors.latitude }}
              </p>
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
                :class="{
                  'border-red-500 ring-red-500': validationErrors.longitude,
                }"
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                placeholder="e.g. -118.2437"
                @blur="validateForm"
              />
              <p
                v-if="validationErrors.longitude"
                class="text-xs text-red-600 mt-1"
              >
                {{ validationErrors.longitude }}
              </p>
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
            :disabled="formIsInvalid || isSaving"
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
