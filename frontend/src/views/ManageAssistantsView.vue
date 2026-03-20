<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import GenericDataList from '@/components/GenericDataList.vue'
import GenericForm from '@/components/GenericForm.vue'
import { assistantFormFields } from '@/forms/assistantForm.schema'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { userRole, userName, logout } = useAuth()
const showAssistantForm = ref(false)

const assistantColumns = [
  { key: 'name', label: 'Usuario' },
  { key: 'role', label: 'Rol' },
  { key: 'status', label: 'Estado' }
]

const assistantActions = [
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Eliminar', disabledField: 'canDelete' }
]

const assistants = [
  { id: 1, name: 'Ana Torres', role: 'Asistente', status: 'Activo', canDelete: false },
  { id: 2, name: 'Luis Mendoza', role: 'Asistente', status: 'Activo', canDelete: false },
  { id: 3, name: 'Carla Ríos', role: 'Coordinador', status: 'Activo', canDelete: false },
  { id: 4, name: 'Pedro Salas', role: 'Asistente', status: 'Inactivo', canDelete: false },
  { id: 5, name: 'María Vega', role: 'Admin', status: 'Activo', canDelete: false }
]

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const onAddAssistant = () => {
  showAssistantForm.value = true
}

const onAssistantAction = (payload: { actionKey: string; item: Record<string, unknown> }) => {
  console.log(`Acción: ${payload.actionKey} en asistente:`, payload.item)
  // TODO: Implementar lógica de editar/eliminar
}

const onConfirmAssistantForm = (formData: any) => {
  console.log('Nuevo asistente:', formData)
  showAssistantForm.value = false
  // TODO: Enviar al backend
}

const onCancelAssistantForm = () => {
  showAssistantForm.value = false
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="manage-assistants-container">
    <!-- Header -->
    <AppHeader 
      title="ProDUS"
      subtitle="Gestión de Asistentes"
      :user-role="userRole || 'Usuario'"
      :user-name="userName || 'Usuario'"
      @logout="handleLogout"
    />

    <!-- Contenido principal -->
    <div class="main-content">
      <button @click="goBack" class="back-button">← Volver</button>

      <GenericDataList
        title="Gestión de Asistentes"
        :columns="assistantColumns"
        :items="assistants"
        :actions="assistantActions"
        add-button-label="Añadir nuevo asistente"
        @add="onAddAssistant"
        @action="onAssistantAction"
      />

      <GenericForm
        v-if="showAssistantForm"
        title="Nuevo Asistente"
        :fields="assistantFormFields"
        confirm-text="Confirmar"
        cancel-text="Cancelar"
        @confirm="onConfirmAssistantForm"
        @cancel="onCancelAssistantForm"
      />
    </div>
  </div>
</template>

<style scoped>
.manage-assistants-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.back-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  margin-bottom: 1.5rem;
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #d0d0d0;
}
</style>
