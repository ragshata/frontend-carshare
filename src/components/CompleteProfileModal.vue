<template>
  <div v-if="open" class="modal-overlay">
    <div class="modal">
      <h3 class="modal-title">Завершите регистрацию</h3>
      <div class="modal-desc">
        <div>Пожалуйста, перейдите во вкладку <b>Профиль</b> и заполните:</div>
        <ul>
          <li>Имя, фамилию и телефон</li>
          <li>Пол</li>
          <li v-if="role==='driver'">Марку, номер и фото машины</li>
        </ul>
      </div>
      <button class="btn" @click="$emit('goProfile')">Перейти в профиль</button>
      <button class="btn btn-outline" @click="$emit('close')">Закрыть</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ open: boolean; role: 'passenger'|'driver' }>();
defineEmits<{ (e:'goProfile'):void; (e:'close'):void }>();
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(18,24,36,0.16); display: flex; align-items: center; justify-content: center; }
.modal { background: #fff; border-radius: 18px; padding: 24px 20px; max-width: 90vw; text-align: center; box-shadow: 0 6px 24px rgba(0,0,0,0.10); }
.modal-title { font-size: 20px; font-weight: bold; color: #232323; margin-bottom: 10px; }
.modal-desc { font-size: 15px; color: #444; margin-bottom: 16px; text-align: left; }
.modal-desc ul { margin: 8px 0 0; padding-left: 18px; }
.btn { background: var(--color-primary, #007bff); color: white; border: none; padding: 10px 18px; border-radius: 9px; font-size: 16px; cursor: pointer; margin: 4px; }
.btn-outline { background: transparent; color: var(--color-primary, #007bff); border: 1.5px solid var(--color-primary, #007bff); }
</style>
