<script setup lang="ts">
import ClipboardHistory from './components/ClipboardHistory.vue'
import TitleBar from './components/TitleBar.vue'
</script>

<template>
  <div class="app-container">
    <TitleBar position="top" />
    <div class="content">
      <ClipboardHistory :maxHistory="10" />
    </div>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style>
