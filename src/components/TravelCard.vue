<script setup lang="ts">
interface Props {
  image: string | undefined;
  title: string;
  description: string;
  likes?: number;
  comments?: number;
  author?: string;
  authorAvatar?: string;
  tags?: string[];
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

      <div
        v-if="tags && tags.length > 0"
        class="flex flex-wrap gap-2 mb-4 mt-auto"
      >
        <span
          v-for="tag in tags.slice(0, 3)"
          :key="tag"
          class="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium"
        >
          #{{ tag }}
        </span>
        <span v-if="tags.length > 3" class="text-xs text-gray-400 self-center">
          +{{ tags.length - 3 }}
        </span>
      </div>

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
      </div>
    </div>
  </div>
</template>
