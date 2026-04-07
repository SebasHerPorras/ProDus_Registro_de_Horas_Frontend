<script setup lang="ts">
import AppButton from './AppButton.vue'

const props = withDefaults(defineProps<{
  show: boolean
  title?: string
  messages: string[]
}>(), {
  title: 'Se ha producido un error'
})

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div v-if="show" class="error-modal-overlay" @click.self="handleClose">
    <div class="error-modal-card">
      <div class="error-modal-header">
        <h3>
          <!-- Ícono de alerta -->
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {{ title }}
        </h3>
        <button class="close-icon-btn" @click="handleClose" aria-label="Cerrar">&times;</button>
      </div>

      <div class="error-modal-body">
        <ul v-if="messages.length > 1" class="error-list">
          <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
        </ul>
        <p v-else class="error-single-msg">
          {{ messages[0] || 'Ocurrió un error inesperado al procesar la solicitud.' }}
        </p>
      </div>

      <div class="error-modal-footer">
        <AppButton variant="secondary" size="md" @click="handleClose">
          Entendido
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-modal-overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, var(--color-text, #1f2937) 45%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 2000;
  animation: fadeIn 0.15s ease-out;
}

.error-modal-card {
  width: min(480px, 100%);
  background: var(--color-surface, #ffffff);
  border-top: 4px solid var(--color-error, #ef4444);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: slideDown 0.2s ease-out;
}

.error-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
}

.error-modal-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-error-dark, #dc2626);
  font-size: 1.15rem;
}

.error-icon {
  width: 24px;
  height: 24px;
}

.close-icon-btn {
  background: none;
  border: none;
  font-size: 1.75rem;
  line-height: 1;
  color: var(--color-text-muted, #6b7280);
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.close-icon-btn:hover {
  color: var(--color-error-dark, #dc2626);
}

.error-modal-body {
  padding: 1.5rem;
  color: var(--color-text, #1f2937);
  font-size: 0.95rem;
  line-height: 1.5;
}

.error-list {
  margin: 0;
  padding-left: 1.25rem;
}

.error-list li {
  margin-bottom: 0.5rem;
}

.error-list li:last-child {
  margin-bottom: 0;
}

.error-single-msg {
  margin: 0;
}

.error-modal-footer {
  padding: 1rem 1.5rem;
  background: var(--color-background, #f5f5f5);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  display: flex;
  justify-content: flex-end;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-15px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
