<script setup lang="ts">
import { ref, computed } from "vue";
import { Search } from "lucide-vue-next";

interface Props {
  modelValue?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  showClearButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "Search...",
  size: "md",
  disabled: false,
  loading: false,
  showClearButton: true,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  search: [value: string];
  clear: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const inputClasses = computed(() => {
  const base =
    "pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed bg-white";

  const sizes = {
    sm: "py-1.5 text-sm",
    md: "py-2 text-base",
    lg: "py-3 text-lg",
  };

  return `${base} ${sizes[props.size]}`;
});

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emit("update:modelValue", value);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    emit("search", props.modelValue);
  }
};

const handleClear = () => {
  emit("update:modelValue", "");
  emit("clear");
  inputRef.value?.focus();
};

const focus = () => {
  inputRef.value?.focus();
};

defineExpose({ focus });
</script>

<template>
  <div
    class="relative w-full backdrop-blur-xl bg-white/40 rounded-2xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all"
  >
    <!-- Search Icon -->
    <div
      class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500/70"
    >
      <Search class="text-white" />
    </div>

    <!-- Input Field -->
    <input
      ref="inputRef"
      type="text"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      @input="handleInput"
      @keydown="handleKeyDown"
      :class="[
        'w-full bg-transparent text-gray-800 placeholder-gray-600/60',
        'pl-12 pr-12 py-3 rounded-2xl',
        'focus:outline-none focus:ring-2 focus:ring-white/60',
        'focus:bg-white/50 transition-all',
        disabled ? 'cursor-not-allowed opacity-60' : '',
      ]"
    />

    <!-- Loading Spinner / Clear Button -->
    <div class="absolute inset-y-0 right-0 flex items-center pr-4">
      <!-- Spinner -->
      <svg
        v-if="loading"
        class="animate-spin h-5 w-5 text-gray-500/70"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291
             A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 
             3 7.938l3-2.647z"
        ></path>
      </svg>

      <!-- Clear Button -->
      <button
        v-else-if="showClearButton && modelValue"
        type="button"
        class="text-gray-600/60 hover:text-gray-700 transition-colors"
        @click="handleClear"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>
