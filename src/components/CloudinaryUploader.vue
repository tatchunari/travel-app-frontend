<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import {
  Image as ImageIcon,
  Plus,
  X,
  Upload,
  Loader2,
  CheckCircle,
} from "lucide-vue-next";
import Button from "../components/Button.vue";
import { uploadFileToCloudinary } from "../api/CloudinaryUploader";

// modelValue holds the array of image URLs (which could be Cloudinary URLs)
const modelValue = defineModel<string[]>({
  default: () => [""],
});

// Component state for each upload slot
interface UploadState {
  progress: number; // 0 to 100
  isUploading: boolean;
  error: string | null;
  file: File | null;
  inputKey: number; // Key used to reset the file input
}

const uploadStates = ref<UploadState[]>([]);
let inputKeyCounter = 0; // Use counter for unique keys instead of Math.random for better performance

// Initialize and synchronize state array based on modelValue
watch(
  modelValue,
  (newUrls) => {
    const currentLength = uploadStates.value.length;
    const newLength = newUrls.length;

    if (newLength > currentLength) {
      // Add new states for additional URLs
      for (let i = currentLength; i < newLength; i++) {
        uploadStates.value.push({
          progress: newUrls[i] ? 100 : 0,
          isUploading: false,
          error: null,
          file: null,
          inputKey: ++inputKeyCounter,
        });
      }
    } else if (newLength < currentLength) {
      // Remove excess states
      uploadStates.value.splice(newLength);
    }
    // If lengths are equal, states are preserved (assuming external changes are handled elsewhere)
  },
  { immediate: true }
);

// --- FILE / IMAGE MANAGEMENT ---

/**
 * Handles the file selection, initiates Cloudinary upload, and updates the state.
 * @param event The change event from the file input
 * @param index The index in the modelValue array to update
 */
/**
 * Validates the selected file for upload.
 * @param file The file to validate
 * @returns Error message if invalid, null if valid
 */
const validateFile = (file: File): string | null => {
  if (!file.type.startsWith("image/")) {
    return "Please select an image file.";
  }
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return "File size must be less than 10MB.";
  }
  return null;
};

/**
 * Handles the file selection, validates, and initiates Cloudinary upload.
 * @param event The change event from the file input
 * @param index The index in the modelValue array to update
 */
const handleFileChange = async (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (!uploadStates.value[index]) return; // Safety check

  const validationError = validateFile(file);
  if (validationError) {
    alert(validationError);
    uploadStates.value[index].inputKey = ++inputKeyCounter; // Reset input
    return;
  }

  const state = uploadStates.value[index];
  if (!state) return; // Safety check

  state.file = file;
  state.error = null;
  state.isUploading = true;
  state.progress = 0;

  try {
    const url = await uploadFileToCloudinary(file, (percent) => {
      state.progress = percent;
    });

    // Update the modelValue with the secure Cloudinary URL
    modelValue.value[index] = url;
    state.progress = 100;
  } catch (e: any) {
    state.error = e.message || "Upload failed.";
    state.progress = 0;
    // Clear the URL in case it was a re-upload attempt
    modelValue.value[index] = "";
  } finally {
    state.isUploading = false;
    // Prepare input for next file (by changing the input key)
    state.inputKey = ++inputKeyCounter;
  }
};

const addPhotoField = () => {
  if (modelValue.value) {
    modelValue.value.push("");
    // Also add a corresponding empty state
    uploadStates.value.push({
      progress: 0,
      isUploading: false,
      error: null,
      file: null,
      inputKey: Math.random(),
    });
    nextTick(() => {
      const newIndex = modelValue.value.length - 1;
      const inputElement = document.getElementById(`file-input-${newIndex}`);
      inputElement?.focus();
    });
  }
};

const removePhotoField = (index: number) => {
  if (modelValue.value && modelValue.value.length > 1) {
    modelValue.value.splice(index, 1);
    uploadStates.value.splice(index, 1);
  }
};

/**
 * Retries the upload for a failed file.
 * @param index The index to retry
 */
const retryUpload = async (index: number) => {
  const state = uploadStates.value[index];
  if (!state || !state.file || !state.error) return;

  state.error = null;
  state.isUploading = true;
  state.progress = 0;

  try {
    const url = await uploadFileToCloudinary(state.file, (percent) => {
      state.progress = percent;
    });

    modelValue.value[index] = url;
    state.progress = 100;
  } catch (e: any) {
    state.error = e.message || "Upload failed.";
    state.progress = 0;
    modelValue.value[index] = "";
  } finally {
    state.isUploading = false;
    state.inputKey = ++inputKeyCounter;
  }
};

/**
 * Returns a user-friendly status message for the input label.
 * @param state The current upload state (may be undefined)
 * @param index The index of the input
 */
const getStatusLabel = (
  state: UploadState | undefined,
  index: number
): string => {
  if (!state) return `Upload Image ${index + 1}...`;
  if (state.isUploading) {
    return `Uploading: ${state.progress}%`;
  }
  if (state.error) {
    return `Error: ${state.error}`;
  }
  if (modelValue.value[index]) {
    return "File uploaded successfully!";
  }
  return `Upload Image ${index + 1}...`;
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
        <!-- File Input Wrapper -->
        <div class="relative grow">
          <label
            :for="`file-input-${index}`"
            class="flex flex-col px-3 py-2.5 bg-white border rounded-lg cursor-pointer transition-all"
            :class="{
              'border-green-500 ring-1 ring-green-500':
                uploadStates[index]?.progress === 100,
              'border-red-500 ring-1 ring-red-500': uploadStates[index]?.error,
              'border-gray-300 hover:border-green-500':
                !uploadStates[index]?.error &&
                uploadStates[index]?.progress !== 100,
            }"
          >
            <!-- Label and Icon -->
            <span class="text-sm font-medium flex items-center justify-between">
              <span :class="{ 'text-red-500': uploadStates[index]?.error }">
                {{ getStatusLabel(uploadStates[index], index) }}
              </span>

              <CheckCircle
                v-if="uploadStates[index]?.progress === 100"
                class="w-4 h-4 text-green-500 shrink-0 ml-2"
              />
              <Loader2
                v-else-if="uploadStates[index]?.isUploading"
                class="w-4 h-4 text-gray-500 shrink-0 ml-2 animate-spin"
              />
              <Upload v-else class="w-4 h-4 text-gray-500 shrink-0 ml-2" />
            </span>

            <!-- Progress Bar -->
            <div
              v-if="uploadStates[index]?.isUploading"
              class="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden"
            >
              <div
                class="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                :style="{ width: `${uploadStates[index]?.progress}%` }"
              ></div>
            </div>
          </label>
          <input
            :key="uploadStates[index]?.inputKey"
            :id="`file-input-${index}`"
            type="file"
            accept="image/*"
            @change="handleFileChange($event, index)"
            :disabled="uploadStates[index]?.isUploading"
            class="sr-only"
          />
        </div>

        <!-- Retry Button -->
        <Button
          v-if="uploadStates[index]?.error"
          variant="outline"
          size="sm"
          @click="retryUpload(index)"
          type="button"
          title="Retry upload"
          class="shrink-0 mr-2"
          :disabled="uploadStates[index]?.isUploading"
        >
          <Upload class="w-4 h-4 text-blue-500" />
        </Button>

        <!-- Remove Button -->
        <Button
          v-if="modelValue && modelValue.length > 1"
          variant="ghost"
          size="sm"
          @click="removePhotoField(index)"
          type="button"
          title="Remove image"
          class="shrink-0"
          :disabled="uploadStates[index]?.isUploading"
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
          <span class="text-xs">Image Preview (Upload a file)</span>
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
      <Plus class="w-4 h-4 mr-2" /> Add another image slot
    </Button>
  </div>
</template>
