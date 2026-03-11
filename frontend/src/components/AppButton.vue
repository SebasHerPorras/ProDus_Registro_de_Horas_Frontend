<template>
  <button :class="['btn', `btn-${variant}`, `btn-${size}`]" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'success' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false
  }
)
</script>

<style scoped>
.btn {
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

/* Variantes */
.btn-primary {
  background: linear-gradient(135deg, #0052a3 0%, #003d7a 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 82, 163, 0.15);
}

.btn-secondary {
  background: white;
  color: #003d7a;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #0052a3;
  background: #f8f9fa;
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.15);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.15);
}

/* Tamaños */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-md {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Disabled */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}
</style>
