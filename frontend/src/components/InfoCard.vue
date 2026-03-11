<template>
  <div class="info-card">
    <span class="card-label">{{ label }}</span>
    <span class="card-value">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
}>()
</script>

<style scoped>
.info-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #0052a3;
}

.card-label {
  font-size: 0.875rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.card-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0052a3;
}
</style>
