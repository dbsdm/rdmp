<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Roadmap from '@/components/TheRoadmap.vue';

const route = useRoute();
const uuid = ref(route.params.uuid as string);

watch(
  () => route.params.uuid,
  () => {
    uuid.value = route.params.uuid as string;
  }
);
</script>

<template>
  <Roadmap :roadmap-uuid="uuid" />
</template>
