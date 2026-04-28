<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AppHeader from '@/components/AppHeader.vue'
import AppButton from '@/components/AppButton.vue'
import api from '@/services/api'

const router = useRouter()
const { userRole, userName, logout } = useAuth()

const EMOJI_EYE_VISIBLE = '👀'
const EMOJI_EYE_HIDDEN = '🔒'

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showNewPasswordConfirm = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const getPasswordFieldType = (isVisible: boolean): 'password' | 'text' => {
  return isVisible ? 'text' : 'password'
}

async function handleChangePassword() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    await api.changePassword({
      current_password: currentPassword.value,
      new_password: newPassword.value,
      new_password_confirm: newPasswordConfirm.value,
      needs_password_change: false,
    })

    successMessage.value = 'Contraseña actualizada correctamente.'
    setTimeout(() => router.push('/home'), 1200)
  } catch (error: any) {
    errorMessage.value = error?.message || 'No se pudo cambiar la contraseña.'
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.back()
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell">
    <AppHeader
      title="ProDUS"
      subtitle="Cambiar contraseña"
      :user-role="userRole || 'Usuario'"
      :user-name="userName || 'Usuario'"
      @logout="handleLogout"
    />

    <main class="app-main-content app-main-content-sm">
      <section class="surface-card">
        <h2 class="page-title">Cambiar contraseña</h2>
        <p class="page-subtitle">
          Por tu seguridad, es necesario cambiar tu contraseña antes de continuar.
        </p>

        <p v-if="successMessage" class="status-banner status-banner-success">{{ successMessage }}</p>
        <p v-if="errorMessage" class="status-banner status-banner-error">{{ errorMessage }}</p>

        <form @submit.prevent="handleChangePassword" class="change-password-form">
          <div class="form-group">
            <label for="currentPassword" class="form-label">
              Contraseña actual
              <span class="required-indicator">*</span>
            </label>
            <div class="password-field-row">
              <input
                id="currentPassword"
                :type="getPasswordFieldType(showCurrentPassword)"
                v-model="currentPassword"
                class="form-control"
                required
              />
              <AppButton
                type="button"
                variant="secondary"
                size="sm"
                class="password-toggle-btn"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                {{ showCurrentPassword ? EMOJI_EYE_HIDDEN : EMOJI_EYE_VISIBLE }}
              </AppButton>
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword" class="form-label">
              Nueva contraseña
              <span class="required-indicator">*</span>
            </label>
            <div class="password-field-row">
              <input
                id="newPassword"
                :type="getPasswordFieldType(showNewPassword)"
                v-model="newPassword"
                class="form-control"
                placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
                required
              />
              <AppButton
                type="button"
                variant="secondary"
                size="sm"
                class="password-toggle-btn"
                @click="showNewPassword = !showNewPassword"
              >
                {{ showNewPassword ? EMOJI_EYE_HIDDEN : EMOJI_EYE_VISIBLE }}
              </AppButton>
            </div>
          </div>

          <div class="form-group">
            <label for="newPasswordConfirm" class="form-label">
              Confirmar nueva contraseña
              <span class="required-indicator">*</span>
            </label>
            <div class="password-field-row">
              <input
                id="newPasswordConfirm"
                :type="getPasswordFieldType(showNewPasswordConfirm)"
                v-model="newPasswordConfirm"
                class="form-control"
                required
              />
              <AppButton
                type="button"
                variant="secondary"
                size="sm"
                class="password-toggle-btn"
                @click="showNewPasswordConfirm = !showNewPasswordConfirm"
              >
                {{ showNewPasswordConfirm ? EMOJI_EYE_HIDDEN : EMOJI_EYE_VISIBLE }}
              </AppButton>
            </div>
          </div>

          <div class="form-actions">
            <AppButton
              variant="secondary"
              size="md"
              type="button"
              @click="handleCancel"
            >
              Cancelar
            </AppButton>
            <AppButton
              variant="primary"
              size="md"
              type="submit"
              :disabled="loading"
            >
              {{ loading ? 'Procesando...' : 'Cambiar contraseña' }}
            </AppButton>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>

<style scoped>
.change-password-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.password-field-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.password-field-row .form-control {
  flex: 1;
}

.password-toggle-btn {
  flex-shrink: 0;
  white-space: nowrap;
}

.required-indicator {
  color: var(--color-error-dark);
  margin-left: 0.2rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

@media (max-width: 640px) {
  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>