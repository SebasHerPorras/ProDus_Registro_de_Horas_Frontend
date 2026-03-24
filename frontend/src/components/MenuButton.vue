<template>
  <button class="menu-option" @click="$emit('click')">
    <span class="menu-icon">{{ icon }}</span>
    <span class="menu-label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.menu-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background: var(--menu-button-bg);
  border: 2px solid var(--menu-button-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
  font-weight: 500;
  color: var(--menu-button-text);
}

.menu-option:hover {
  border-color: var(--menu-button-border-hover);
  background: var(--menu-button-bg-hover);
  transform: translateY(-4px);
  box-shadow: var(--menu-button-hover-shadow);
}

.menu-option:active {
  transform: translateY(-2px);
}

.menu-icon {
  font-size: 2.5rem;
}

.menu-label {
  text-align: center;
  color: var(--menu-button-label);
  font-weight: 600;
}
</style>
