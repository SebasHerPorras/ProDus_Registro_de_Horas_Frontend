import { ref, watch, onBeforeUnmount } from 'vue';
import { api } from '@/services/api';

const isActive = ref(false);
const startTime = ref<Date | null>(null);
const elapsedTime = ref<string>('00:00:00');
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

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
  if (startTime.value && isActive.value) {
    const diff = Date.now() - startTime.value.getTime();
    elapsedTime.value = formatTime(diff);
  }
};

const clearTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
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
      // Mocked endpoint behavior based on the backend API (or current API structure)
      // Ajustar dependiendo de cómo devuelva la data real
      const response = await api.getWorkSessionState();
      
      if (response && response.session && response.session.status === 'IN_PROGRESS') {
        isActive.value = true;
        startTime.value = new Date(response.session.check_in);
        startTimer();
      } else {
        isActive.value = false;
        startTime.value = null;
        elapsedTime.value = '00:00:00';
        clearTimer();
      }
    } catch (error: any) {
      if (error && error.status !== 404) {
        console.error('Error fetching work session state:', error);
      }
      // If 404, there is no active session, which is fine.
      isActive.value = false;
      startTime.value = null;
      elapsedTime.value = '00:00:00';
      clearTimer();
    } finally {
      isLoading.value = false;
    }
  };

  const startSession = async () => {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const response = await api.startWorkSession();
      if (response && response.session) {
        isActive.value = true;
        startTime.value = new Date(response.session.check_in);
        startTimer();
      }
    } catch (error: any) {
      errorMessage.value = error?.message || 'No puedes iniciar jornada desde esta red.';
    } finally {
      isLoading.value = false;
    }
  };

  const endSession = async () => {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      await api.endWorkSession();
      isActive.value = false;
      startTime.value = null;
      elapsedTime.value = '00:00:00';
      clearTimer();
    } catch (error: any) {
      errorMessage.value = error?.message || 'Hubo un error al finalizar la jornada.';
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
    endSession,
  };
}
