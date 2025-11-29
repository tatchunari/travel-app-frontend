<script setup lang="ts">
import { ref } from "vue";
import { AlertTriangle, Loader2 } from "lucide-vue-next";
import Button from "./Button.vue";
import Modal from "./Modal.vue";
import { deleteTrip } from "../api/tripsApi";
import { useAuth } from "@clerk/vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  tripId: {
    type: [Number, null] as any,
    default: null,
  },
  tripTitle: {
    type: String,
    default: "Unknown Trip",
  },
});

const emit = defineEmits(["close", "tripDeleted"]);

const { getToken } = useAuth();
const isDeleting = ref(false);

const handleClose = () => {
  emit("close");
};

const handleDeleteConfirmed = async () => {
  if (props.tripId === null || isDeleting.value) {
    console.warn("Deletion aborted: tripId is null or already deleting.");
    return;
  }

  if (typeof props.tripId !== "number" || props.tripId <= 0) {
    console.error(
      "Deletion aborted: Invalid tripId type or value:",
      props.tripId
    );
    handleClose();
    return;
  }

  // Set loading state *after* all primary guards
  isDeleting.value = true;

  try {
    const token = await getToken.value();
    if (!token) {
      console.error(
        "Authentication Error: Token not available. User may be signed out."
      );
      throw new Error("User not signed in or token retrieval failed.");
    }

    await deleteTrip(props.tripId, token);

    emit("tripDeleted", props.tripId);
  } catch (error: any) {
    // This catch block is essential to see network errors
    console.error("Delete API call failed:", error);

    let message = `Could not delete the trip. It may not belong to you.`;
    if (error.message.includes("403") || error.message.includes("401")) {
      message =
        "Authorization failed. This trip was likely created by another user.";
    }
  } finally {
    isDeleting.value = false;
    handleClose();
  }
};
</script>

<template>
  <Modal
    :show="show"
    @close="handleClose"
    max-width="md"
    :closeable="!isDeleting"
  >
    <template v-slot:header>
      <div class="flex items-center gap-3 text-red-600">
        <AlertTriangle class="w-6 h-6 shrink-0" />
        <span>Confirm Deletion</span>
      </div>
    </template>

    <template v-slot:body>
      <div class="text-gray-600">
        <span class="font-semibold text-gray-900 block mb-1"
          >Are you sure you want to delete this trip?</span
        >
        <span class="text-sm text-gray-500">
          You are about to delete the trip:
          <span class="font-medium text-red-600">"{{ tripTitle }}"</span>. This
          action cannot be undone.
        </span>
      </div>
    </template>

    <template v-slot:footer>
      <Button variant="secondary" @click="handleClose" :disabled="isDeleting">
        Cancel
      </Button>
      <Button
        variant="danger"
        @click="handleDeleteConfirmed"
        :loading="isDeleting"
        class="ml-3"
      >
        <span v-if="!isDeleting">Delete Permanently</span>
        <span v-else>
          <Loader2 class="w-4 h-4 mr-2 animate-spin inline-block" />
          Deleting...
        </span>
      </Button>
    </template>
  </Modal>
</template>
