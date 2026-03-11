<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-branding">
        <h1 class="brand-title">{{ title }}</h1>
        <p class="brand-subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-user">
        <div class="user-info">
          <span class="user-role">{{ userRole }}</span>
          <span class="user-name">{{ userName }}</span>
        </div>
        <button 
          @click="handleLogout" 
          class="logout-btn"
          :disabled="isLoggingOut"
        >
          {{ isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title: string
  subtitle: string
  userRole: string
  userName: string
}>()

const emit = defineEmits<{
  logout: []
}>()

const isLoggingOut = ref(false)

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    emit('logout')
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #003d7a 0%, #00254d 100%);
  color: white;
  padding: 1.5rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-branding h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  margin: 0;
}

.header-branding p {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-role {
  font-size: 0.875rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 600;
}

.logout-btn {
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.logout-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.logout-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .header-user {
    width: 100%;
    justify-content: space-between;
  }

  .user-info {
    align-items: flex-start;
  }
}
</style>
