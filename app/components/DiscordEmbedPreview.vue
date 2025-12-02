<template>
  <div class="bg-[#313338] rounded-md p-4 max-w-[432px] font-sans text-[#dbdee1] border-l-4 border-[#4F46E5] shadow-md">
    <div class="grid grid-cols-[1fr_80px] gap-4">
      <div class="space-y-2">
        <!-- Provider -->
        <div class="text-xs text-[#b5bac1]">Allied-Intel</div>
        
        <!-- Title -->
        <div class="font-bold text-[#00b0f4] hover:underline cursor-pointer truncate">
          {{ server.hostname || `${server.ip}:${server.port}` }}
        </div>

        <!-- Description -->
        <div class="text-sm space-y-1">
          <div><span class="font-bold text-[#b5bac1]">Map:</span> {{ server.mapname }}</div>
          <div><span class="font-bold text-[#b5bac1]">Players:</span> {{ server.numplayers }}/{{ server.maxplayers }}</div>
          <div><span class="font-bold text-[#b5bac1]">Game:</span> {{ server.gametype }}</div>
          <div><span class="font-bold text-[#b5bac1]">IP:</span> {{ server.ip }}:{{ server.port }}</div>
        </div>
      </div>

      <!-- Thumbnail -->
      <div class="w-20 h-20 rounded bg-[#2b2d31] overflow-hidden">
        <img 
          :src="mapImageUrl" 
          alt="Map Image" 
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  server: any;
  game?: string;
}>();

const mapImageUrl = computed(() => {
  if (!props.server?.mapname) return '';
  return `https://image.gametracker.com/images/maps/160x120/${props.game || 'mohaa'}/${props.server.mapname}.jpg`;
});

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x120/2b2d31/b5bac1?text=No+Image';
};
</script>
