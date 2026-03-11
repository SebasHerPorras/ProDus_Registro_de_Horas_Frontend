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
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.menu-option:hover {
  border-color: #0052a3;
  background: #f8f9fa;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 82, 163, 0.15);
}

.menu-option:active {
  transform: translateY(-2px);
}

.menu-icon {
  font-size: 2.5rem;
}

.menu-label {
  text-align: center;
  color: #003d7a;
  font-weight: 600;
}
</style>
