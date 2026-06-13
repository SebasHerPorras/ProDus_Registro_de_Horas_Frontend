<script setup lang="ts">
import AppButton from './AppButton.vue'

defineProps<{
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-message">{{ message }}</p>

      <div class="modal-actions">
        <AppButton 
          variant="secondary" 
          @click="emit('cancel')"
          :disabled="isLoading"
        >
          {{ cancelText || 'Cancelar' }}
        </AppButton>
        <AppButton 
          variant="primary" 
          @click="emit('confirm')"
          :disabled="isLoading"
          :loading="isLoading"
        >
          {{ confirmText || 'Confirmar' }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.modal-title {
  color: #003d7a;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.modal-message {
  color: #4a5568;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.modal-actions > * {
  flex: 1;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
