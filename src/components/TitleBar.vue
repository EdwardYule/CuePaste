<template>
  <div class="title-bar" :class="position">
    <div class="product-name">CuePaste</div>
    <div class="controls">
      <button 
        class="pin-button"
        :class="{ active: isPinned }"
        @click="togglePin"
      >
        📌
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义组件属性
interface Props {
  // 标题栏位置：top, left, right, bottom
  position?: 'top' | 'left' | 'right' | 'bottom'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top'
})

// 置顶状态
const isPinned = ref(false)

// 切换置顶状态
const togglePin = () => {
  isPinned.value = !isPinned.value
  // TODO: 实现实际的置顶逻辑
  window.ipcRenderer.send('toggle-pin', isPinned.value)
}
</script>

<style scoped>
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #1a1a1a;
  color: #fff;
  user-select: none;
  -webkit-app-region: drag; /* 允许拖拽窗口 */
}

/* 位置样式 */
.title-bar.top {
  width: 100%;
  border-bottom: 1px solid #333;
}

.title-bar.left {
  width: 40px;
  height: 100vh;
  flex-direction: column;
  border-right: 1px solid #333;
}

.title-bar.right {
  width: 40px;
  height: 100vh;
  flex-direction: column;
  border-left: 1px solid #333;
}

.title-bar.bottom {
  width: 100%;
  border-top: 1px solid #333;
}

.product-name {
  font-weight: 500;
  font-size: 14px;
}

.controls {
  -webkit-app-region: no-drag; /* 控制按钮不可拖拽 */
}

.pin-button {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  transition: all 0.3s;
}

.pin-button:hover {
  color: #fff;
}

.pin-button.active {
  color: #646cff;
}

/* 响应式布局 */
.title-bar.left .controls,
.title-bar.right .controls {
  margin-top: auto;
}

.title-bar.left .product-name,
.title-bar.right .product-name {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}
</style> 