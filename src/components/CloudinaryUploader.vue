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

const modelValue = defineModel<string[]>({
  default: () => [""],
});

interface UploadState {
  progress: number;
  isUploading: boolean;
  error: string | null;
  file: File | null;
  inputKey: number;
}

const uploadStates = ref<UploadState[]>([]);
let inputKeyCounter = 0;

// Initialize uploadStates to match modelValue
const syncStates = () => {
  const diff = modelValue.value.length - uploadStates.value.length;
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      uploadStates.value.push({
        progress: 0,
        isUploading: false,
        error: null,
        file: null,
        inputKey: ++inputKeyCounter,
      });
    }
  } else if (diff < 0) {
    uploadStates.value.splice(diff);
  }
};

watch(modelValue, syncStates, { immediate: true });

// --- FILE UPLOAD LOGIC ---
const validateFile = (file: File) => {
  if (!file.type.startsWith("image/")) return "Please select an image file.";
  if (file.size > 10 * 1024 * 1024) return "File size must be less than 10MB.";
  return null;
};

const handleFileChange = async (event: Event, index: number) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const state = uploadStates.value[index];
  if (!state) return;

  const validationError = validateFile(file);
  if (validationError) {
    alert(validationError);
    state.inputKey = ++inputKeyCounter;
    return;
  }

  state.file = file;
  state.error = null;
  state.isUploading = true;
  state.progress = 0;

  try {
    const url = await uploadFileToCloudinary(
      file,
      (percent) => (state.progress = percent)
    );
    modelValue.value[index] = url;
    state.progress = 100;
  } catch (e: any) {
    state.error = e.message || "Upload failed.";
    modelValue.value[index] = "";
    state.progress = 0;
  } finally {
    state.isUploading = false;
    state.inputKey = ++inputKeyCounter;
  }
};

const addPhotoField = () => {
  modelValue.value.push("");
  uploadStates.value.push({
    progress: 0,
    isUploading: false,
    error: null,
    file: null,
    inputKey: ++inputKeyCounter,
  });
  nextTick(() => {
    const newIndex = modelValue.value.length - 1;
    const inputEl = document.getElementById(`file-input-${newIndex}`);
    (inputEl as HTMLInputElement)?.focus();
  });
};

const removePhotoField = (index: number) => {
  if (modelValue.value.length > 1) {
    modelValue.value.splice(index, 1);
    uploadStates.value.splice(index, 1);
  }
};

const retryUpload = async (index: number) => {
  const state = uploadStates.value[index];
  if (!state || !state.file || !state.error) return;

  state.error = null;
  state.isUploading = true;
  state.progress = 0;

  try {
    const url = await uploadFileToCloudinary(
      state.file,
      (percent) => (state.progress = percent)
    );
    modelValue.value[index] = url;
    state.progress = 100;
  } catch (e: any) {
    state.error = e.message || "Upload failed.";
    modelValue.value[index] = "";
    state.progress = 0;
  } finally {
    state.isUploading = false;
    state.inputKey = ++inputKeyCounter;
  }
};

const getStatusLabel = (state: UploadState | undefined, index: number) => {
  if (!state) return `Upload Image ${index + 1}...`;
  if (state.isUploading) return `Uploading: ${state.progress}%`;
  if (state.error) return `Error: ${state.error}`;
  if (modelValue.value[index]) return "File uploaded successfully!";
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
            <span class="text-sm font-medium flex items-center justify-between">
              <span :class="{ 'text-red-500': uploadStates[index]?.error }">{{
                getStatusLabel(uploadStates[index], index)
              }}</span>
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

        <Button
          v-if="uploadStates[index]?.error"
          variant="outline"
          size="sm"
          @click="retryUpload(index)"
          type="button"
          class="shrink-0 mr-2"
          :disabled="uploadStates[index]?.isUploading"
        >
          <Upload class="w-4 h-4 text-blue-500" />
        </Button>

        <Button
          v-if="modelValue.length > 1"
          variant="ghost"
          size="sm"
          @click="removePhotoField(index)"
          type="button"
          class="shrink-0"
          :disabled="uploadStates[index]?.isUploading"
        >
          <X class="w-4 h-4 text-red-500" />
        </Button>
      </div>

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
