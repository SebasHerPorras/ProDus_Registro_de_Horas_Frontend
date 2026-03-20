<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import GenericDataList from '@/components/GenericDataList.vue'
import GenericForm from '@/components/GenericForm.vue'
import { assistantFormFields } from '@/forms/assistantForm.schema'
import { useAuth } from '@/composables/useAuth'
import api from '@/services/api'

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

interface AssistantRow {
  id: number
  username: string
  name: string
  role: string
  status: string
  canDelete: boolean
}

const assistants = ref<AssistantRow[]>([])

const loadAssistants = async () => {
  try {
    const response = await api.listAssistants()
    assistants.value = response.results.map((item) => ({
      id: item.id,
      username: item.username,
      name: item.full_name,
      role: 'Asistente',
      status: item.is_active ? 'Activo' : 'Inactivo',
      canDelete: false,
    }))
  } catch (error) {
  }
}

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

const onConfirmAssistantForm = async (formData: Record<string, unknown>) => {
  try {
    const payload = {
      username: String(formData.username || '').trim(),
      full_name: String(formData.full_name || '').trim(),
      password: String(formData.password || ''),
      password_confirm: String(formData.password_confirm || ''),
      is_active: Boolean(formData.is_active),
      start_date: String(formData.start_date || ''),
      end_date: formData.end_date ? String(formData.end_date) : null,
      weekly_hours: Number(formData.weekly_hours),
    }
    await api.createAssistant(payload)

    showAssistantForm.value = false
    await loadAssistants()
  } catch (error) {
    alert(error instanceof Error ? error.message : 'No se pudo crear el asistente')
  }
}

const onCancelAssistantForm = () => {
  showAssistantForm.value = false
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadAssistants()
})
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
