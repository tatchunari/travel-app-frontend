<script setup lang="ts">
const props = defineProps<{
  message?: string;
  icon?: string; // optional: SVG path or emoji
}>();

const defaultMessage = props.message || "No results found";
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <!-- Icon -->
    <div
      class="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 text-4xl"
    >
      <span>{{ props.icon || "📍" }}</span>
    </div>

    <!-- Message -->
    <h2 class="text-xl font-semibold text-gray-700">
      {{ props.message || defaultMessage }}
    </h2>
  </div>
</template>
