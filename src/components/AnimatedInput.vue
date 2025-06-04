<template>
    <div class="input-wrapper">
      <component
        :is="type === 'textarea' ? 'textarea' : 'input'"
        :type="type !== 'textarea' ? type : undefined"
        :id="id"
        :rows="rows"
        :value="modelValue"
        :placeholder="isCleanType ? ' ' : ''"
        :required="required"
        @focus="focused = true"
        @blur="onBlur"
        @input="onInput"
        :class="[
          { error },
          isCleanType ? 'clean-input' : ''
        ]"
      />
      <label :for="id" :class="{ lifted: focused || !!modelValue }">{{ label }}</label>
      <p class="error-text" v-if="error">{{ errorText }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue';
  
  const props = defineProps<{
    modelValue: string;
    label: string;
    type?: string;
    id?: string;
    rows?: number;
    error?: boolean;
    errorText?: string;
    required?: boolean;
  }>();
  
  const emit = defineEmits(['update:modelValue']);
  const focused = ref(false);
  
  const isCleanType = computed(() =>
    props.type === 'date' || props.type === 'time'
  );
  
  function onBlur() {
    focused.value = false;
  }
  
  function onInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    emit('update:modelValue', target.value);
  }
  </script>
  
  <style scoped>
  .input-wrapper {
    position: relative;
    width: 100%;
    margin-bottom: 20px;
  }
  
  input,
  textarea {
    width: 100%;
    padding: 16px 12px 8px;
    font-size: 15px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-surface);
    color: var(--color-text-primary);
    outline: none;
    transition: border 0.3s;
  }
  
  input:focus,
  textarea:focus {
    border-color: var(--color-primary);
  }
  
  textarea {
    resize: none;
    height: 96px;
  }
  
  input.error,
  textarea.error {
    border-color: #e53935;
  }
  
  label {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: var(--color-text-secondary);
    pointer-events: none;
    transition: 0.25s ease;
  }
  
  label.lifted {
    top: 6px;
    font-size: 11px;
    color: var(--color-primary);
    background: var(--color-surface);
    padding: 0 4px;
    border-radius: 4px;
  }
  
  .clean-input {
    color: transparent;
    appearance: none;
    -webkit-appearance: none;
  }
  .clean-input:focus,
  .clean-input:valid {
    color: var(--color-text-primary);
  }
  
  .error-text {
    font-size: 12px;
    color: #e53935;
    margin-top: 4px;
  }
  </style>
  