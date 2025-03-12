<script setup lang="ts">
import ClipboardHistory from './components/ClipboardHistory.vue'
</script>

<template>
  <div class="app-container">
    <ClipboardHistory :max-history="10" />
  </div>
</template>

<style scoped>
.app-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
