<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import GenericForm from '@/components/GenericForm.vue'
import { useAuth } from '@/composables/useAuth'
import { useWorkSessionCloseForm } from '@/composables/useWorkSessionCloseForm'

const router = useRouter()
const { userRole, userName, logout } = useAuth()
const {
  errorMessage,
  isLoadingCatalogs,
  isSubmitting,
  catalogError,
  successMessage,
  showSubmitConfirmModal,
  showCancelFormConfirmModal,
  fields,
  handleFormChange,
  handlePrepareSubmit,
  handleConfirmSubmit,
  handleCancelSubmitConfirm,
  handleCancelForm,
  handleConfirmCancelForm,
  handleDismissCancelForm,
} = useWorkSessionCloseForm()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell">
    <AppHeader
      title="ProDUS"
      subtitle="Formulario de Cierre de Jornada"
      :user-role="userRole || 'Usuario'"
      :user-name="userName || 'Usuario'"
      @logout="handleLogout"
    />

    <main class="app-main-content app-main-content-sm">
      <section class="surface-card">
        <h2 class="page-title">Reporte del día</h2>
        <p class="page-subtitle">
          Completa los datos y confirma el envio para finalizar tu jornada.
        </p>

        <p v-if="successMessage" class="status-banner status-banner-success">{{ successMessage }}</p>
        <p v-if="errorMessage" class="status-banner status-banner-error">{{ errorMessage }}</p>
        <p v-if="catalogError" class="status-banner status-banner-warning">{{ catalogError }}</p>

        <p v-if="isLoadingCatalogs" class="catalog-loading">Cargando catalogos...</p>

        <GenericForm
          title="Formulario de cierre"
          :fields="fields"
          confirm-text="Validar y continuar"
          cancel-text="Cancelar"
          :reset-on-cancel="false"
          @change="handleFormChange"
          @confirm="handlePrepareSubmit"
          @cancel="handleCancelForm"
        />

        <ConfirmModal
          :is-open="showSubmitConfirmModal"
          title="¿Seguro que quieres enviar el formulario y finalizar tu sesión de trabajo?"
          message="Se registrara la hora de cierre del servidor y se cerrara la jornada activa."
          confirm-text="Si, enviar"
          cancel-text="Cancelar"
          :is-loading="isSubmitting"
          @confirm="handleConfirmSubmit"
          @cancel="handleCancelSubmitConfirm"
        />

        <ConfirmModal
          :is-open="showCancelFormConfirmModal"
          title="¿Salir sin enviar formulario?"
          message="Tu jornada seguira activa y el tiempo continuara contabilizandose."
          confirm-text="Salir"
          cancel-text="Seguir editando"
          :is-loading="false"
          @confirm="handleConfirmCancelForm"
          @cancel="handleDismissCancelForm"
        />
      </section>
    </main>
  </div>
</template>

<style scoped>
.catalog-loading {
  margin: 0.75rem 0;
  color: var(--color-text-muted);
}
</style>
