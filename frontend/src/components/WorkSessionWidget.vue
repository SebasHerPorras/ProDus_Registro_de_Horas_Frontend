<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useWorkSession } from '@/composables/useWorkSession';
import AppButton from '@/components/AppButton.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

const {
  isActive,
  startTime,
  elapsedTime,
  isLoading,
  errorMessage,
  fetchSessionState,
  startSession,
  endSession
} = useWorkSession();

const isConfirmModalOpen = ref(false);

const openConfirmModal = () => {
  isConfirmModalOpen.value = true;
};

const handleConfirm = async () => {
  await startSession();
  isConfirmModalOpen.value = false;
};

const handleCancel = () => {
  isConfirmModalOpen.value = false;
};

onMounted(() => {
  fetchSessionState();
});

const formattedStartTime = computed(() => {
  if (!startTime.value) return '--:-- --';
  return startTime.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});
</script>

<template>
  <div class="work-session-widget">
    <div class="widget-header">
      <h3 class="widget-title">Estado de Jornada</h3>
      
      <div class="status-badge" :class="{ 'is-active': isActive, 'is-inactive': !isActive }">
        <span class="status-dot"></span>
        {{ isActive ? 'Jornada Activa' : 'No iniciada' }}
      </div>
    </div>

    <!-- Error state -->
    <div v-if="errorMessage" class="error-banner">
      {{ errorMessage }}
    </div>

    <div class="widget-content">
      <div v-if="isActive" class="active-session-details">
        <div class="detail-item">
          <span class="detail-label">Iniciada:</span>
          <span class="detail-value">{{ formattedStartTime }}</span>
        </div>
        <div class="detail-item time-display">
          <span class="detail-label">Tiempo:</span>
          <span class="timer-value">{{ elapsedTime }}</span>
        </div>

        <AppButton 
          variant="secondary" 
          @click="endSession"
          :loading="isLoading"
          :disabled="isLoading"
          class="action-button end-button"
        >
          Finalizar jornada
        </AppButton>
      </div>

      <div v-else class="inactive-session-details">
        <p class="inactive-text">Sin jornada activa</p>

        <AppButton 
          variant="primary" 
          @click="openConfirmModal"
          :loading="isLoading"
          :disabled="isLoading"
          class="action-button start-button"
        >
          Iniciar jornada
        </AppButton>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal 
      :is-open="isConfirmModalOpen"
      title="¿Iniciar Jornada?"
      message="¿Deseas iniciar tu jornada laboral ahora? Se registrará la hora actual como el momento de inicio."
      confirm-text="Iniciar Jornada"
      cancel-text="Cancelar"
      :is-loading="isLoading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.work-session-widget {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.widget-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.is-active {
  background-color: #f0fdf4;
  color: #166534;
}

.is-active .status-dot {
  background-color: #22c55e;
  animation: pulse 2s infinite;
}

.is-inactive {
  background-color: #f3f4f6;
  color: #4b5563;
}

.is-inactive .status-dot {
  background-color: #9ca3af;
}

.error-banner {
  background-color: #fef2f2;
  color: #b91c1c;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  border-left: 4px solid #ef4444;
}

.widget-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.active-session-details,
.inactive-session-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 1.25rem;
  font-weight: 500;
  color: #2d3748;
}

.time-display {
  margin: 0.5rem 0;
}

.timer-value {
  font-family: monospace;
  font-size: 2.5rem;
  font-weight: 700;
  color: #003d7a;
  line-height: 1;
}

.inactive-text {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.action-button {
  width: 100%;
  max-width: 250px;
  margin-top: 0.5rem;
}

.end-button {
  border: 1px solid #e2e8f0;
  color: #e53e3e;
}

.end-button:hover {
  background-color: #fff5f5;
  border-color: #fc8181;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@media (min-width: 768px) {
  .active-session-details {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }

  .detail-item {
    align-items: flex-start;
  }

  .action-button {
    margin-top: 0;
  }
}
</style>