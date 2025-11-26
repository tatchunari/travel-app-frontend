<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-vue-next";
import Button from "../components/Button.vue";
import SearchBar from "../components/SearchBar.vue";
import { useAuth } from "@clerk/vue";
import type { Trip } from "../types/types";
// Import API functions
import { getMyTrips, deleteTrip } from "../api/tripsApi";

const router = useRouter();
const { isSignedIn, isLoaded: isAuthLoaded, getToken } = useAuth();

// --- STATE ---
const fetchedTrips = ref<Trip[]>([]);
const searchQuery = ref("");
const isLoading = ref(true);
const isDeleting = ref(false);

// Delete Modal State
const tripToDeleteId = ref<number | null>(null);
const showDeleteModal = ref(false);

// --- COMPUTED ---
// Filter trips based on the search query
const myFilteredTrips = computed(() => {
  let filtered = fetchedTrips.value;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }
  return filtered;
});

// --- LIFECYCLE & DATA FETCHING ---

/**
 * Loads the user's trips from the secure backend endpoint.
 */
const loadTrips = async () => {
  isLoading.value = true;
  fetchedTrips.value = []; // Clear previous data

  if (!isAuthLoaded.value || !isSignedIn.value) {
    // User is not signed in or Clerk hasn't loaded yet
    isLoading.value = false;
    return;
  }

  try {
    const token = await getToken.value();
    if (!token) throw new Error("Authentication token not available.");

    // The API client automatically handles the token injection
    const data = await getMyTrips(token);
    fetchedTrips.value = data;
  } catch (error) {
    console.error("Failed to load user's trips:", error);
    // You might want a better way to display this error in the table empty state
    // For now, we'll rely on the empty table showing up.
  } finally {
    isLoading.value = false;
  }
};

// Use watch to load data only after Clerk status is confirmed
watch(
  isAuthLoaded,
  (newVal) => {
    // Only fetch if the user is signed in AND the SDK is ready
    if (newVal && isSignedIn.value) {
      loadTrips();
    } else if (newVal && !isSignedIn.value) {
      // If the SDK is loaded but the user is signed out, stop loading and clear data
      isLoading.value = false;
      fetchedTrips.value = [];
    }
  },
  { immediate: true }
);

// --- ACTIONS ---

const handleEdit = (id: number) => {
  // Navigate to the TripFormPage in edit mode
  router.push(`/trip/${id}`);
};

const handleCreateTrip = () => {
  router.push("/dashboard/create");
};

const handleOpenDeleteModal = (id: number) => {
  tripToDeleteId.value = id;
  showDeleteModal.value = true;
};

const handleDeleteConfirmed = async () => {
  if (tripToDeleteId.value === null || isDeleting.value) return;

  isDeleting.value = true;

  try {
    const token = await getToken.value();
    if (!token) throw new Error("Authentication token not available.");

    // The API client injects the token and sends the DELETE request
    await deleteTrip(tripToDeleteId.value, token);

    // Remove the trip from the local list instantly for better UX
    fetchedTrips.value = fetchedTrips.value.filter(
      (t) => t.id !== tripToDeleteId.value
    );
  } catch (error) {
    console.error("Failed to delete trip:", error);
    // Use a status message instead of alert
    alert("Error: Could not delete the trip. It may not belong to you.");
  } finally {
    isDeleting.value = false;
    showDeleteModal.value = false;
    tripToDeleteId.value = null;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- HEADER -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p class="text-gray-500 text-sm">Manage your travel destinations</p>
        </div>
        <Button variant="primary" @click="handleCreateTrip">
          <div class="flex items-center gap-2">
            <Plus class="w-4 h-4" />
            <span>Add Destination</span>
          </div>
        </Button>
      </div>

      <!-- SEARCH BAR -->
      <SearchBar
        v-model="searchQuery"
        class="my-5"
        placeholder="Search destinations..."
        size="lg"
      />

      <!-- LOADING STATE -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <Loader2 class="w-8 h-8 text-green-500 animate-spin mr-3" />
        <p class="text-lg text-gray-600">Loading your destinations...</p>
      </div>

      <!-- TABLE VIEW -->
      <div
        v-else
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- Empty State -->
        <div v-if="myFilteredTrips.length === 0" class="p-12 text-center">
          <div
            class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <MapPin class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900">
            {{ searchQuery ? "No matching trips found" : "No trips found" }}
          </h3>
          <p v-if="!searchQuery" class="text-gray-500 mb-6">
            Get started by creating your first destination.
          </p>
          <Button
            v-if="!searchQuery"
            variant="outline"
            @click="handleCreateTrip"
            >Create Trip</Button
          >
        </div>

        <!-- Data Table -->
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Destination
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
              >
                Tags
              </th>

              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="trip in myFilteredTrips"
              :key="trip.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- Destination Column -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200"
                  >
                    <img
                      class="h-full w-full object-cover"
                      :src="
                        trip.photos[0] ||
                        'https://placehold.co/100x64/f3f4f6/a1a1aa?text=No+Photo'
                      "
                      :alt="trip.title"
                    />
                  </div>
                  <div class="ml-4">
                    <div
                      class="text-sm font-bold text-gray-900 hover:text-green-600 cursor-pointer"
                      @click="router.push(`/trip/${trip.id}`)"
                    >
                      {{ trip.title }}
                    </div>
                    <div class="text-sm text-gray-500 max-w-xs truncate">
                      {{ trip.description }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Tags Column -->
              <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <div class="flex gap-1">
                  <span
                    v-for="tag in trip.tags?.slice(0, 2)"
                    :key="tag"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                  >
                    {{ tag }}
                  </span>
                </div>
              </td>

              <!-- Actions Column -->
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Edit"
                    @click="handleEdit(trip.id!)"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                    :disabled="isDeleting"
                    @click="handleOpenDeleteModal(trip.id!)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal :show="showDeleteModal" @close="showDeleteModal = false">
      <template>
        Delete Trip:
        {{
          fetchedTrips.find((t) => t.id === tripToDeleteId)?.title ||
          "Unknown Trip"
        }}
      </template>
      <template>
        <p class="text-gray-600">
          Are you sure you want to delete this trip? This action cannot be
          undone.
        </p>
      </template>
      <template>
        <Button
          variant="secondary"
          @click="showDeleteModal = false"
          :disabled="isDeleting"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          @click="handleDeleteConfirmed"
          :loading="isDeleting"
          class="ml-3"
        >
          <span v-if="!isDeleting">Delete Permanently</span>
          <span v-else>Deleting...</span>
        </Button>
      </template>
    </Modal>
  </div>
</template>
