<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { Image as ImageIcon, Plus, X, Upload, Loader2 } from "lucide-vue-next";
import Button from "../components/Button.vue";

// modelValue now holds the array of Data URLs (Base64 strings)
const modelValue = defineModel<string[]>({
  default: () => [""],
});

// State to hold the temporary File object reference and status for each slot
const fileStates = ref<{ fileName: string; isProcessing: boolean }[]>([]);

// Synchronize fileStates on initial load or if array length changes
watch(
  modelValue,
  (newUrls) => {
    // FIX: Only re-map if the length changes to ensure synchronization
    if (newUrls.length !== fileStates.value.length) {
      fileStates.value = newUrls.map((url) => ({
        fileName: url ? "File attached" : "",
        isProcessing: false,
      }));
    }
  },
  { immediate: true }
);

// --- FILE MANAGEMENT ---

/**
 * Handles the file selection, reads the file, and converts it to a Data URL
 * for immediate display. This Data URL is saved to the modelValue.
 */
const handleFileChange = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    input.value = ""; // Reset file input
    return;
  }

  // FIX: Safely retrieve state object
  const state = fileStates.value[index];
  if (!state) return;

  state.isProcessing = true;
  state.fileName = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    // When the file is read, the result (Data URL) is stored in the modelValue
    if (modelValue.value && e.target?.result) {
      modelValue.value[index] = e.target.result as string;
    }
    state.isProcessing = false;
  };
  reader.onerror = () => {
    state.isProcessing = false;
    state.fileName = "Error reading file";
    alert("Could not read the selected file.");
  };
  reader.readAsDataURL(file);
};

const addPhotoField = () => {
  if (modelValue.value) {
    modelValue.value.push(""); // Also add a corresponding empty state
    fileStates.value.push({ fileName: "", isProcessing: false });
    nextTick(() => {
      // Optional: Focus the new input element after it appears
      const newIndex = modelValue.value.length - 1; // FIX: Using optional chaining on the result of getElementById
      const inputElement = document.getElementById(`file-input-${newIndex}`);
      (inputElement as HTMLInputElement)?.focus();
    });
  }
};

const removePhotoField = (index: number) => {
  if (modelValue.value && modelValue.value.length > 1) {
    modelValue.value.splice(index, 1);
    fileStates.value.splice(index, 1);
  }
};

const getStatusLabel = (index: number): string => {
  const state = fileStates.value[index];
  // FIX: Guard against undefined state
  if (!state) return `Click to Upload Image ${index + 1}...`;

  if (state.isProcessing) return "Processing image...";
  if (state.fileName && modelValue.value[index]) return state.fileName;
  return `Click to Upload Image ${index + 1}...`;
};
</script>

<template>
  <div class="space-y-4">
    <label class="block text-sm font-medium text-gray-700"
      >Images (Local File Upload)</label
    >

    <div
      v-for="(photoUrl, index) in modelValue"
      :key="index"
      class="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
    >
      <div class="flex gap-2 items-center">
        <!-- File Input Wrapper -->
        <div class="relative grow">
          <label
            :for="`file-input-${index}`"
            class="flex items-center justify-between px-3 py-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-all"
            :class="{
              'border-green-500 ring-1 ring-green-500':
                // FIX: Use optional chaining on fileStates[index]
                !!modelValue[index] && !fileStates[index]?.isProcessing,
              'opacity-70 cursor-not-allowed': fileStates[index]?.isProcessing,
            }"
          >
            <!-- Label Text -->
            <span
              class="text-sm truncate mr-2"
              :class="{
                'text-gray-400':
                  // FIX: Use optional chaining on fileStates[index]
                  !modelValue[index] && !fileStates[index]?.isProcessing,
              }"
            >
              {{ getStatusLabel(index) }}
            </span>

            <!-- Icon -->
            <Loader2
              v-if="fileStates[index]?.isProcessing"
              class="w-4 h-4 text-gray-500 shrink-0 ml-2 animate-spin"
            />
            <Upload v-else class="w-4 h-4 text-gray-500 shrink-0 ml-2" />
          </label>
          <input
            :id="`file-input-${index}`"
            type="file"
            accept="image/*"
            @change="handleFileChange($event, index)"
            :disabled="fileStates[index]?.isProcessing"
            class="sr-only"
          />
        </div>

        <!-- Remove Button -->
        <Button
          v-if="modelValue.length > 1"
          variant="ghost"
          size="sm"
          @click="removePhotoField(index)"
          type="button"
          title="Remove image"
          class="shrink-0"
          :disabled="fileStates[index]?.isProcessing"
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
          <span class="text-xs">Select a file for preview</span>
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
