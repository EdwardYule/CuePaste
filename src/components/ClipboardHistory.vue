<template>
  <div class="clipboard-history">
    <h3>剪贴板历史</h3>
    <ul>
      <li v-for="(content, index) in clipboardHistory" :key="index">
        {{ content }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  maxHistory?: number
}>()

const clipboardHistory = ref<string[]>([])

const handleClipboardChange = (_event: any, content: string) => {
  clipboardHistory.value = [content, ...clipboardHistory.value]
    .slice(0, props.maxHistory || 10)
}

onMounted(() => {
  window.ipcRenderer.on('clipboard-change', handleClipboardChange)
})

onUnmounted(() => {
  window.ipcRenderer.off('clipboard-change', handleClipboardChange)
})
</script>

<style scoped>
.clipboard-history {
  margin: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.clipboard-history ul {
  list-style: none;
  padding: 0;
}

.clipboard-history li {
  padding: 8px;
  border-bottom: 1px solid #eee;
  word-break: break-all;
}

.clipboard-history li:last-child {
  border-bottom: none;
}
</style> 