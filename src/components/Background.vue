<template>
  <div class="background-img"></div>
</template>

<style scoped>
.background-img {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: url('@/assets/secondary.webp') center center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  animation: bg-fade-in 1s ease-in-out;
}

@keyframes bg-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
