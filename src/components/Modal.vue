<script setup lang="ts">
import { watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: "2xl",
  },
  closeable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close"]);

defineSlots<{
  header: () => any;
  body: () => any;
  footer: () => any;
}>();

const close = () => {
  if (props.closeable) {
    emit("close");
  }
};

// --- Keyboard Navigation ---
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.show) {
    close();
  }
};

onMounted(() => document.addEventListener("keydown", handleEscape));
onUnmounted(() => document.removeEventListener("keydown", handleEscape));

// --- Body Scroll Lock ---
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  },
  { immediate: true }
);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" scroll-region>
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          @click="close"
        ></div>

        <!-- Modal Container -->
        <div class="min-h-screen flex items-center justify-center p-4">
          <Transition name="modal-slide-in">
            <div
              v-show="show"
              class="bg-white rounded-xl shadow-2xl transform transition-all overflow-hidden relative z-50"
              :class="{
                'max-w-md': maxWidth === 'md',
                'max-w-2xl': maxWidth === '2xl',
              }"
            >
              <div class="p-6">
                <!-- Header Slot -->
                <div
                  class="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100"
                >
                  <slot name="header"> Modal Title </slot>
                </div>

                <!-- Body Slot -->
                <div class="text-gray-700">
                  <slot name="body"> Modal Content </slot>
                </div>
              </div>

              <!-- Footer Slot (Actions) -->
              <div class="bg-gray-50 px-6 py-4 flex justify-end">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Transition styles for modal overlay */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Transition styles for modal content slide */
.modal-slide-in-enter-active,
.modal-slide-in-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease;
}

.modal-slide-in-enter-from {
  opacity: 0;
  transform: translateY(-50px);
}

.modal-slide-in-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}
</style>
