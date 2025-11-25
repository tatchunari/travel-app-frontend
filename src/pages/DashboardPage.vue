<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus, Pencil, Trash2, MapPin } from "lucide-vue-next";
import Button from "../components/Button.vue";
import SearchBar from "../components/SearchBar.vue";
import { trips as initialTrips, type Trip } from "../utils/trips";
import { useAuth } from "@clerk/vue";

const router = useRouter();
// const { user } = useAuth();

// --- STATE ---
const localTrips = ref<Trip[]>([]);
const searchQuery = ref("");
const isLoading = ref(false);

// Form Data
const formData = ref({
  id: 0,
  title: "",
  description: "",
  location: "",
  photoUrl: "",
  tags: "",
});

const tripToDeleteId = ref<number | null>(null);

// --- COMPUTED ---
// Filter trips by the logged in user (Mocking: ID 101 is our "test" user)
const myTrips = computed(() => {
  let filtered = localTrips.value;

  // In a real app, you would filter by author_id === user.id
  // For this demo, we just show all trips so you can see data
  // filtered = localTrips.value.filter(t => t.author_id === "user_2b3...");

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }
  return filtered;
});

// --- LIFECYCLE ---
onMounted(() => {
  // Initialize local state with mock data
  localTrips.value = [...initialTrips];
});

// --- ACTIONS ---

const handleEdit = (id: number) => {
  // This replaces ":id" in the route path with the actual number (e.g., /dashboard/edit/1)
  router.push(`/dashboard/edit/${id}`);
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
        <Button variant="primary" @click="router.push('/dashboard/create')">
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

      <!-- TABLE VIEW -->
      <div
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <!-- Empty State -->
        <div v-if="myTrips.length === 0" class="p-12 text-center">
          <div
            class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <MapPin class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900">No trips found</h3>
          <p class="text-gray-500 mb-6">
            Get started by creating your first destination.
          </p>
          <Button variant="outline">Create Trip</Button>
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
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
              >
                Last Updated
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
              v-for="trip in myTrips"
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
                      :src="trip.photos[0]"
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

              <!-- Date Column -->
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell"
              >
                <!-- Mock Date -->
                2 days ago
              </td>

              <!-- Actions Column -->
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <div class="flex items-center justify-end gap-2">
                  <button
                    class="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Edit"
                    @click="handleEdit(trip.id)"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
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
  </div>
</template>
