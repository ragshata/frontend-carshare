<template>
    <div
      v-if="!finished"
      id="preloader"
      :class="{ fadeOut: hide }"
      @transitionend="onTransitionEnd"
    >
      <div id="load">
        <span
          v-for="(char, index) in letters"
          :key="index"
          class="letter"
          :style="{ animationDelay: `${(letters.length - index) * 0.2}s` }"
        >
          {{ char }}
        </span>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, defineEmits } from 'vue';
  
  const emit = defineEmits(['done']);
  
  const letters = ['S', 'A', 'F', 'A', 'R', 'B', 'A', 'R'];
  const hide = ref(false);
  const finished = ref(false);
  
  onMounted(() => {
    setTimeout(() => {
      hide.value = true;
    }, 3000); // запуск плавного исчезновения
  });
  
  function onTransitionEnd() {
    finished.value = true;         // убираем компонент
    emit('done');                  // если хотим, можем сообщить родителю
  }
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Jua&display=swap');
  
  #preloader {
    position: fixed;
    inset: 0;
    background: var(--color-primary);
    font-family: 'Jua', sans-serif;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transform: scale(1.02);
    transition: opacity 1.2s ease-in-out, transform 1.2s ease-in-out;
  }
  
  #preloader.fadeOut {
    opacity: 0;
    transform: scale(1);
    pointer-events: none;
  }
  
  #load {
    display: flex;
    gap: 8px;
    font-size: 2.5rem;
  }
  
  .letter {
    display: inline-block;
    color: #fff;
    opacity: 0;
    transform: translateX(-150%) rotate(180deg);
    animation: fly 2.6s ease-in-out 1 forwards;
  }

  @keyframes fly {
    0% {
      transform: translateX(-150%) rotate(180deg);
      opacity: 0;
    }
    30% {
      transform: translateX(0%) rotate(0deg);
      opacity: 1;
    }
    70% {
      transform: translateX(0%) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateX(200%) rotate(-180deg);
      opacity: 0;
    }
  }

  </style>
  