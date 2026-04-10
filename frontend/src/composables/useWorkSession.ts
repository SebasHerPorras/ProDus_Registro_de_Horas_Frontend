import { ref } from 'vue';
import { api } from '@/services/api';

const isActive = ref(false);
const startTime = ref<Date | null>(null);
const elapsedTime = ref<string>('00:00:00');
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const elapsedSecondsAtSync = ref(0);
const localSyncTimestamp = ref<number | null>(null);

let timerInterval: number | null = null;

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
};

const updateTimer = () => {
  if (!isActive.value || localSyncTimestamp.value === null) return;

  const secondsSinceSync = Math.floor((Date.now() - localSyncTimestamp.value) / 1000);
  const totalSeconds = Math.max(0, elapsedSecondsAtSync.value + secondsSinceSync);
  elapsedTime.value = formatTime(totalSeconds * 1000);
};

const clearTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

const resetSessionState = () => {
  isActive.value = false;
  startTime.value = null;
  elapsedSecondsAtSync.value = 0;
  localSyncTimestamp.value = null;
  elapsedTime.value = '00:00:00';
  clearTimer();
};

const startTimer = () => {
  clearTimer();
  updateTimer(); // Initial call
  timerInterval = window.setInterval(updateTimer, 1000);
};

export function useWorkSession() {
  const fetchSessionState = async () => {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const response = await api.getWorkSessionState();
      
      if (response?.active_session && response.session) {
        isActive.value = true;
        startTime.value = new Date(response.session.check_in);
        elapsedSecondsAtSync.value = response.elapsed_seconds ?? response.session.elapsed_seconds ?? 0;
        localSyncTimestamp.value = Date.now();
        startTimer();
      } else {
        resetSessionState();
      }
    } catch (error: any) {
      const isExpectedForbidden =
        error?.status === 403 ||
        String(error?.message || '').includes('No eres un asistente registrado en el sistema');

      if (!isExpectedForbidden) {
        console.error('Error fetching work session state:', error);
      }

      resetSessionState();
    } finally {
      isLoading.value = false;
    }
  };

  const startSession = async () => {
    if (isActive.value) {
      return;
    }

    isLoading.value = true;
    errorMessage.value = null;
    try {
      const response = await api.startWorkSession();
      if (response && response.session) {
        isActive.value = true;
        startTime.value = new Date(response.session.check_in);
        elapsedSecondsAtSync.value = response.session.elapsed_seconds ?? 0;
        localSyncTimestamp.value = Date.now();
        startTimer();
      }
    } catch (error: any) {
      errorMessage.value = error?.message || 'No fue posible iniciar la jornada.';
    } finally {
      isLoading.value = false;
    }
  };

  const closeSession = async () => {
    if (!isActive.value) {
      return;
    }

    isLoading.value = true;
    errorMessage.value = null;
    try {
      await api.closeWorkSession();
      resetSessionState();
    } catch (error: any) {
      errorMessage.value = error?.message || 'No fue posible finalizar la jornada.';
    } finally {
      isLoading.value = false;
    }
  };

  // Stop running the timer globally if the components are unmounted. 
  // Normally this stays alive while the app is alive since it's a global ref setup.

  return {
    isActive,
    startTime,
    elapsedTime,
    isLoading,
    errorMessage,
    fetchSessionState,
    startSession,
    closeSession,
  };
}
