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

const customIcon = L.icon({
  className: "custom-map-pin",
  iconUrl: "/public/paper-plane.png",
  iconSize: [40, 40],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30],
});

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let marker: L.Marker | null = null;

const initializeMap = () => {
  if (mapContainer.value && !map) {
    const coords: L.LatLngTuple = [props.latitude, props.longitude];

    map = L.map(mapContainer.value!).setView(coords, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    marker = L.marker(coords, { icon: customIcon })
      .addTo(map)
      .bindPopup(`<b>${props.title}</b>`)
      .openPopup();

    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);
  } else if (map && marker) {
    const newCoords: L.LatLngTuple = [props.latitude, props.longitude];
    marker.setLatLng(newCoords);
    marker.setIcon(customIcon);
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

watch(() => [props.latitude, props.longitude], initializeMap, {
  immediate: true,
});

onMounted(() => {
  initializeMap();
});
</script>

<template>
  <div class="h-96 relative">
    <div ref="mapContainer" class="w-full h-full rounded-lg"></div>
    <div class="absolute bottom-4 left-4 z-50">
      <button
        @click="openInGoogleMaps"
        class="flex items-center text-sm font-semibold px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition"
      >
        <MapPin class="w-4 h-4 mr-1" /> View in Maps App
      </button>
    </div>
  </div>
</template>
<style></style>
