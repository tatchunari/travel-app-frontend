<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { MapPin } from "lucide-vue-next";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
const props = defineProps<{
  latitude: number;
  longitude: number;
  title: string;
}>();

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let marker: L.Marker | null = null;

// Fix for default marker icons not showing up due to Webpack/Vite issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const initializeMap = () => {
  if (mapContainer.value && !map) {
    const coords: L.LatLngTuple = [props.latitude, props.longitude];

    // 1. Initialize Map
    map = L.map(mapContainer.value!).setView(coords, 13); // Zoom level 13

    // 2. Add Tile Layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // 3. Add Marker
    marker = L.marker(coords)
      .addTo(map)
      .bindPopup(`<b>${props.title}</b>`)
      .openPopup();

    // Fix map visibility issue often caused by flex layouts
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);
  } else if (map && marker) {
    // If map already exists, update position if necessary
    const newCoords: L.LatLngTuple = [props.latitude, props.longitude];
    marker.setLatLng(newCoords);
    map.setView(newCoords, 13);
    marker.bindPopup(`<b>${props.title}</b>`).openPopup();
  }
};

const openInGoogleMaps = () => {
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${props.latitude},${props.longitude}`,
    "_blank"
  );
};

// Re-initialize map if props change (though unlikely on detail page)
watch(() => [props.latitude, props.longitude], initializeMap, {
  immediate: true,
});

onMounted(() => {
  initializeMap();
});

// Clean up map instance when component is destroyed
// onUnmounted(() => {
//     if (map) {
//         map.remove();
//         map = null;
//     }
// });
</script>

<template>
  <div class="h-96 relative">
    <div ref="mapContainer" class="w-full h-full rounded-lg"></div>
    <div class="absolute bottom-4 left-4 z-40">
      <button
        @click="openInGoogleMaps"
        class="flex items-center text-sm font-semibold px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition"
      >
        <MapPin class="w-4 h-4 mr-1" /> View in Maps App
      </button>
    </div>
  </div>
</template>
