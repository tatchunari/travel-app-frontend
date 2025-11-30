<script setup lang="ts">
interface Props {
  image: string | undefined;
  title: string;
  description: string;
  authorName: string | undefined;
  authorAvatarUrl: string | undefined;
  tags?: string[];
  photos?: string[]; // extra photos array
}
const emit = defineEmits(["click"]);

withDefaults(defineProps<Props>(), {
  authorName: "Anonymous Contributor",
  authorAvatarUrl:
    "https://ui-avatars.com/api/?name=User&background=10b981&color=fff",
  tags: () => [],
  photos: () => [],
});
</script>

<template>
  <div
    @click="emit('click')"
    class="rounded-2xl overflow-hidden shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-[1.02]"
  >
    <!-- Main Image -->
    <div class="relative h-56 overflow-hidden">
      <img
        :src="image"
        :alt="title"
        class="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110 hover:rotate-1"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
      ></div>

      <!-- Tags -->
      <div
        v-if="tags && tags.length > 0"
        class="absolute bottom-3 left-3 flex flex-wrap gap-1"
      >
        <span
          v-for="tag in tags.slice(0, 3)"
          :key="tag"
          class="bg-white/30 backdrop-blur-sm px-2 py-0.5 text-xs rounded-full font-semibold text-white hover:bg-white/50 hover:text-green-600 transition-all"
        >
          #{{ tag }}
        </span>
        <span v-if="tags.length > 3" class="text-xs text-white/70 self-center">
          +{{ tags.length - 3 }}
        </span>
      </div>

      <!-- Title -->
      <h3
        class="absolute bottom-10 left-3 text-white text-lg font-bold drop-shadow-lg line-clamp-2"
      >
        {{ title }}
      </h3>
    </div>

    <!-- Description -->
    <p class="px-4 mt-2 text-gray-600 text-sm line-clamp-3">
      {{ description }}
    </p>

    <!-- Thumbnail Photos -->
    <div v-if="photos && photos.length > 0" class="flex gap-2 mt-2 px-4">
      <img
        v-for="(photo, index) in photos.slice(0, 3)"
        :key="index"
        :src="photo"
        class="w-16 h-16 object-cover rounded-lg border border-gray-200 transition-transform duration-300 hover:scale-105"
        :alt="`${title} photo ${index + 1}`"
      />
      <div
        v-if="photos.length > 3"
        class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg text-xs text-gray-500 border border-gray-200"
      >
        +{{ photos.length - 3 }}
      </div>
    </div>

    <!-- Author Info -->
    <div class="flex items-center gap-3 p-4 bg-white mt-2">
      <img
        :src="authorAvatarUrl"
        :alt="authorName"
        class="w-8 h-8 rounded-full object-cover border-2 border-green-200"
      />
      <span class="text-gray-700 font-medium">{{ authorName }}</span>
    </div>
  </div>
</template>
