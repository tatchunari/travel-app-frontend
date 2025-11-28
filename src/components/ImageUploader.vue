<script setup lang="ts">
import { Image as ImageIcon, Plus, X } from "lucide-vue-next";
import Button from "../components/Button.vue";

// Use defineModel for easy v-model integration
const modelValue = defineModel<string[]>({
  default: () => [""],
});

// --- IMAGE MANAGEMENT ---
const addPhotoField = () => {
  // Ensure modelValue is an array before pushing
  if (modelValue.value) {
    modelValue.value.push("");
  }
};

const removePhotoField = (index: number) => {
  // Ensure we don't remove the last field if we don't want to
  if (modelValue.value && modelValue.value.length > 1) {
    modelValue.value.splice(index, 1);
  }
};
</script>

<template>
  <div class="space-y-4">
    <label class="block text-sm font-medium text-gray-700">Images</label>

    <div
      v-for="(photoUrl, index) in modelValue"
      :key="index"
      class="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
    >
      <div class="flex gap-2 items-center">
        <div class="relative grow">
          <ImageIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
          />
          <input
            v-model="modelValue[index]"
            type="text"
            class="w-full pl-10 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            :placeholder="`Image URL ${index + 1}`"
          />
        </div>
        <!-- Only allow removal if there's more than one field -->
        <Button
          v-if="modelValue.length > 1"
          variant="ghost"
          size="sm"
          @click="removePhotoField(index)"
          type="button"
          title="Remove image"
          class="shrink-0"
        >
          <X class="w-4 h-4 text-red-500" />
        </Button>
      </div>

      <!-- Image Preview for each URL -->
      <div
        class="w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group"
      >
        <img
          v-if="photoUrl && photoUrl.trim()"
          :src="photoUrl"
          class="w-full h-full object-cover"
          alt="Preview"
          @error="modelValue[index] = ''"
        />
        <div
          v-else
          class="w-full h-full flex flex-col items-center justify-center text-gray-400"
        >
          <ImageIcon class="w-6 h-6 mb-1" />
          <span class="text-xs">Preview</span>
        </div>
      </div>
    </div>

    <!-- Add new photo button -->
    <Button
      type="button"
      variant="outline"
      @click="addPhotoField"
      class="w-full justify-center mt-3"
    >
      <Plus class="w-4 h-4 mr-2" /> Add another image
    </Button>
  </div>
</template>
