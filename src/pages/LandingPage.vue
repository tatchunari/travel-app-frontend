<script setup lang="ts">
import { useRouter } from "vue-router";
import { ArrowRight } from "lucide-vue-next";
import FeatureCardScroller from "../components/FeatureCardScroller.vue";

const router = useRouter();
</script>

<template>
  <div class="relative w-full overflow-hidden text-white">
    <!-- Background Image/Overlay (z-index 0, covers 100% viewport) -->
    <div
      class="fixed inset-0 bg-cover bg-center"
      style="
        background-image: url('https://cdn.pixabay.com/photo/2017/04/15/11/51/mt-fuji-2232246_1280.jpg');
        filter: brightness(0.7);
        z-index: 0;
      "
    ></div>

    <!-- Main Content Container (z-index 10) -->
    <div class="relative z-10 w-full flex flex-col mt-20">
      <!-- Hero Content Section -->

      <div class="flex items-center">
        <div class="flex flex-col md:flex-row w-full max-w-7xl mx-auto px-10">
          <div class="w-full md:w-1/2 flex py-20">
            <div class="relative pl-10">
              <div class="absolute left-0 top-0 h-full w-0.5 bg-white/50"></div>

              <h2
                class="text-6xl sm:text-7xl lg:text-7xl font-extrabold tracking-tight mb-6"
              >
                Chase The
                <span
                  class="bg-linear-to-r from-blue-500 to-green-200 text-transparent bg-clip-text"
                  >World</span
                >, <br />
                Not Deadlines.
              </h2>
              <p class="max-w-md text-base text-white/90 mb-8 leading-relaxed">
                Explore the world and create unforgettable memories. Live your
                life to the fullest and never stop exploring.
              </p>

              <button
                @click="router.push('/search')"
                class="group flex items-center text-md font-semibold px-6 py-3 rounded-full cursor-pointer transition-all duration-300 bg-gradient-to-b from-[#4d7dc2] to-[#3b67a3] shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
              >
                Explore
                <ArrowRight
                  class="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>

          <!-- Right: Featured Cards -->

          <div class="w-full md:w-1/2 flex items-center justify-center mt-10">
            <FeatureCardScroller />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-bar-hidden {
  scrollbar-width: none;
}

.scroll-bar-hidden::-webkit-scrollbar {
}
</style>
