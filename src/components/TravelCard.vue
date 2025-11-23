<script setup lang="ts">
interface Props {
  image: string;
  title: string;
  description: string;
  likes?: number;
  comments?: number;
  author?: string;
  authorAvatar?: string;
}

withDefaults(defineProps<Props>(), {
  author: "Anonymous",
  authorAvatar:
    "https://ui-avatars.com/api/?name=User&background=10b981&color=fff",
});
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer max-w-sm"
  >
    <!-- Image -->
    <div class="relative h-48 overflow-hidden">
      <img
        :src="image"
        :alt="title"
        class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
      />
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Title -->
      <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
        {{ title }}
      </h3>

      <!-- Description -->
      <p class="text-sm text-gray-600 mb-4 line-clamp-3">
        {{ description }}
      </p>

      <!-- Footer Stats -->
      <div class="flex items-center justify-between text-gray-500 text-sm">
        <!-- Left side - Author -->
        <div class="flex items-center gap-2">
          <img
            :src="authorAvatar"
            :alt="author"
            class="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
          />
          <span class="text-gray-700 font-medium">{{ author }}</span>
        </div>

        <!-- Right side - Stats -->
        <div class="flex items-center gap-3">
          <!-- Likes -->
          <div v-if="likes" class="flex items-center gap-1">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
            <span>{{ likes }}</span>
          </div>

          <!-- Comments -->
          <div v-if="comments" class="flex items-center gap-1">
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              ></path>
            </svg>
            <span>{{ comments }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
