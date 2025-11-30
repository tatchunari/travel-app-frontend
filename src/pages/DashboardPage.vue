<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-vue-next";
import Button from "../components/Button.vue";
import SearchBar from "../components/SearchBar.vue";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal.vue";
import { useAuth } from "@clerk/vue";
import type { Trip } from "../types/types";
import { getMyTrips } from "../api/tripsApi";

const router = useRouter();
const { isSignedIn, isLoaded: isAuthLoaded, getToken } = useAuth();

// --- STATE ---
const fetchedTrips = ref<Trip[]>([]);

// --- SEARCH ---
const rawSearchQuery = ref(""); // immediate input from SearchBar
const searchQuery = ref(""); // debounced search for filtering

// --- DEBOUNCE HELPER ---
function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Update searchQuery after 300ms of inactivity
const debouncedUpdate = debounce((value: string) => {
  searchQuery.value = value;
});
watch(rawSearchQuery, (val) => debouncedUpdate(val));

// Filter trips based on debounced searchQuery
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

// Loading state
const isLoading = ref(true);

// Delete modal state
const tripToDeleteId = ref<number | undefined>(undefined);
const showDeleteModal = ref(false);
const tripToDeleteTitle = computed(() => {
  const trip = fetchedTrips.value.find((t) => t.id === tripToDeleteId.value);
  return trip ? trip.title : "Unknown Trip";
});

// --- DATA FETCHING ---
const loadTrips = async () => {
  isLoading.value = true;
  fetchedTrips.value = [];

  if (!isAuthLoaded.value || !isSignedIn.value) {
    isLoading.value = false;
    return;
  }

  try {
    const token = await getToken.value();
    if (!token) throw new Error("Authentication token not available.");
    const data = await getMyTrips(token);
    fetchedTrips.value = data;
  } catch (error) {
    console.error("Failed to load user's trips:", error);
  } finally {
    isLoading.value = false;
  }
};

// Fetch trips on auth load
watch(
  isAuthLoaded,
  (newVal) => {
    if (newVal && isSignedIn.value) {
      loadTrips();
    } else if (newVal && !isSignedIn.value) {
      isLoading.value = false;
      fetchedTrips.value = [];
    }
  },
  { immediate: true }
);

// --- MODAL ACTIONS ---
const handleOpenDeleteModal = (id: number) => {
  tripToDeleteId.value = id;
  showDeleteModal.value = true;
};
const handleCloseDeleteModal = () => {
  showDeleteModal.value = false;
  tripToDeleteId.value = undefined;
};
const handleTripDeleted = (deletedId: number) => {
  fetchedTrips.value = fetchedTrips.value.filter((t) => t.id !== deletedId);
  handleCloseDeleteModal();
  console.log("Trip deleted locally:", deletedId);
};

// --- NAVIGATION ---
const handleEdit = (id: number) => router.push(`/dashboard/edit/${id}`);
const handleCreateTrip = () => router.push("/dashboard/create");
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 mt-20">
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
        v-model="rawSearchQuery"
        class="my-5"
        placeholder="Search destinations..."
        size="lg"
      />

      <!-- LOADING STATE -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <Loader2 class="w-8 h-8 text-green-500 animate-spin mr-3" />
        <p class="text-lg text-gray-600">Loading your destinations...</p>
      </div>

      <!-- TABLE / EMPTY STATE -->
      <div
        v-else
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- EMPTY -->
        <div v-if="myFilteredTrips.length === 0" class="p-12 text-center">
          <div
            class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <MapPin class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900">
            {{
              rawSearchQuery
                ? "No matching destinations found"
                : "No destinations found"
            }}
          </h3>
          <p v-if="!rawSearchQuery" class="text-gray-500 mb-6">
            Get started by creating your first destination.
          </p>
          <Button
            v-if="!rawSearchQuery"
            variant="outline"
            @click="handleCreateTrip"
          >
            Create Destination
          </Button>
        </div>

        <!-- DATA TABLE -->
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Destination
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
              >
                Tags
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="trip in myFilteredTrips"
              :key="trip.id!"
              class="hover:bg-gray-50 transition-colors"
            >
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

    <!-- DELETE MODAL -->
    <DeleteConfirmationModal
      :show="showDeleteModal"
      :trip-id="tripToDeleteId"
      :trip-title="tripToDeleteTitle"
      @close="handleCloseDeleteModal"
      @trip-deleted="handleTripDeleted"
    />
  </div>
</template>
