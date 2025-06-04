<template>
    <div v-if="visible" class="toast">{{ message }}</div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const visible = ref(false);
  const message = ref('');
  
  function show(text: string, duration = 3000) {
    message.value = text;
    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, duration);
  }
  
  defineExpose({ show });
  </script>
  
  <style scoped>
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-primary);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    animation: fadeInOut 3s ease-in-out forwards;
  }
  
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
    10% { opacity: 1; transform: translateX(-50%) translateY(0); }
    90% { opacity: 1; }
    100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  }
  </style>
  