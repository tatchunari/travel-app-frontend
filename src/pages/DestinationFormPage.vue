<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-vue-next";
import Button from "../components/Button.vue";
import { trips } from "../utils/trips";
import type { Trip } from "../utils/trips";

const route = useRoute();
const router = useRouter();

// Determine mode based on route params
const isEditing = computed(() => !!route.params.id);
const isLoading = ref(false);

// Form State
const formData = ref({
  title: "",
  description: "",
  photoUrl: "",
  tags: "",
});

// Load data if editing
onMounted(() => {
  if (isEditing.value) {
    const id = Number(route.params.id);
    const trip = trips.find((t) => t.id === id);

    if (trip) {
      formData.value = {
        title: trip.title,
        description: trip.description,
        photoUrl: trip.photos[0] || "",
        tags: trip.tags ? trip.tags.join(", ") : "",
      };
    } else {
      // Trip not found
      router.push("/dashboard");
    }
  } else {
    // Set default image for new trips
    formData.value.photoUrl =
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
  }
});

const handleSave = async () => {
  if (!formData.value.title) return alert("Title is required");

  isLoading.value = true;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const tripPayload: Trip = {
    id: isEditing.value ? Number(route.params.id) : Date.now(),
    title: formData.value.title,
    description: formData.value.description,
    photos: [formData.value.photoUrl],
    tags: formData.value.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t),
    author_id: 101, // Mock User ID
    latitude: 0,
    longitude: 0,
  };

  if (isEditing.value) {
    // Update existing item in mock array
    const index = trips.findIndex((t) => t.id === tripPayload.id);
    if (index !== -1) {
      trips[index] = { ...trips[index], ...tripPayload };
    }
  } else {
    // Add new item to mock array
    trips.unshift(tripPayload);
  }

  isLoading.value = false;
  router.push("/dashboard");
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
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div class="p-6 space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Destination Name</label
            >
            <input
              v-model="formData.title"
              type="text"
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
              >Cover Image URL</label
            >
            <div class="flex gap-2 mb-3">
              <div class="relative flex-grow">
                <ImageIcon
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                />
                <input
                  v-model="formData.photoUrl"
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
                v-if="formData.photoUrl"
                :src="formData.photoUrl"
                class="w-full h-full object-cover"
                alt="Preview"
                @error="formData.photoUrl = ''"
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

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Tags</label
            >
            <input
              v-model="formData.tags"
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
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <Button variant="primary" @click="handleSave" :loading="isLoading">
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
