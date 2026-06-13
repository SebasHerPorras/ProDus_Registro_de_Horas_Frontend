import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { useWorkSession } from '@/composables/useWorkSession'
import api from '@/services/api'
import { buildWorkSessionCloseFormFields } from '@/forms/workSessionCloseForm.schema'
import { workSessionCloseFormSchema } from '@/forms/workSessionCloseForm.validation'

interface SelectOption {
  id: number
  label: string
}

export function useWorkSessionCloseForm() {
  const router = useRouter()
  const {
    isActive,
    errorMessage,
    isLoading,
    fetchSessionState,
    closeSession,
  } = useWorkSession()

  const isLoadingCatalogs = ref(false)
  const isSubmitting = ref(false)
  const catalogError = ref<string | null>(null)
  const successMessage = ref('')
  const showSubmitConfirmModal = ref(false)
  const showCancelFormConfirmModal = ref(false)

  const projects = ref<SelectOption[]>([])
  const coordinators = ref<SelectOption[]>([])
  const formDraft = ref<Record<string, unknown>>({})
  const hasCapturedInitialState = ref(false)
  const initialSnapshot = ref('')
  const pendingPayload = ref<Record<string, unknown> | null>(null)

  const normalizeFormSnapshot = (draft: Record<string, unknown>): string => {
    const notes = String(draft.notes ?? '').trim().slice(0, 500)
    const activities = String(draft.activities ?? '').trim()
    const breakMinutes = Number(draft.break_minutes ?? 0)

    return JSON.stringify({
      project_id: draft.project_id ? Number(draft.project_id) : null,
      manager_user_id: draft.manager_user_id ? Number(draft.manager_user_id) : null,
      activities,
      notes,
      break_minutes:
        Number.isFinite(breakMinutes) && breakMinutes >= 0
          ? breakMinutes
          : 0,
    })
  }

  const isDirty = computed(() => normalizeFormSnapshot(formDraft.value) !== initialSnapshot.value)

  const fields = computed(() => {
    return buildWorkSessionCloseFormFields({
      projectOptions: projects.value.map((project) => ({
        label: project.label,
        value: project.id,
      })),
      coordinatorOptions: coordinators.value.map((coordinator) => ({
        label: coordinator.label,
        value: coordinator.id,
      })),
      disableProjectSelect: isLoadingCatalogs.value,
      disableCoordinatorSelect: isLoadingCatalogs.value,
    })
  })

  const loadCatalogs = async () => {
    isLoadingCatalogs.value = true
    catalogError.value = null

    try {
      const [projectsResponse, coordinatorsResponse] = await Promise.all([
        api.listActiveProjects(),
        api.listActiveCoordinators(),
      ])

      projects.value = (projectsResponse.results || []).map((project) => ({
        id: project.id,
        label: project.name,
      }))

      coordinators.value = (coordinatorsResponse.results || []).map((coordinator) => ({
        id: coordinator.id,
        label: `${coordinator.full_name} (@${coordinator.username})`,
      }))
    } catch (error) {
      console.error('Error cargando catalogos de cierre:', error)
      catalogError.value = 'No fue posible cargar los catalogos. Puedes continuar y enviar el formulario sin seleccionar Proyecto ni Encargado.'
    } finally {
      isLoadingCatalogs.value = false
    }
  }

  const buildClosePayload = (formData: Record<string, unknown>) => {
    const parsed = workSessionCloseFormSchema.parse(formData)
    const projectId = Number(parsed.project_id ?? '')
    const managerId = Number(parsed.manager_user_id ?? '')

    return {
      project_id: Number.isFinite(projectId) && projectId > 0 ? projectId : null,
      manager_user_id: Number.isFinite(managerId) && managerId > 0 ? managerId : null,
      activities: String(parsed.activities ?? '').trim(),
      notes: String(parsed.notes ?? '').trim(),
      break_minutes: parsed.break_minutes,
    }
  }

  const handleFormChange = (payload: Record<string, unknown>) => {
    formDraft.value = payload

    if (!hasCapturedInitialState.value) {
      initialSnapshot.value = normalizeFormSnapshot(payload)
      hasCapturedInitialState.value = true
    }
  }

  const handlePrepareSubmit = (formData: Record<string, unknown>) => {
    if (isSubmitting.value) return

    try {
      pendingPayload.value = buildClosePayload(formData)
    } catch (error) {
      console.error('Error validando formulario de cierre:', error)
      return
    }

    showSubmitConfirmModal.value = true
  }

  const handleConfirmSubmit = async () => {
    if (isSubmitting.value || !pendingPayload.value) return

    isSubmitting.value = true
    const closed = await closeSession(pendingPayload.value)
    isSubmitting.value = false

    if (!closed) {
      showSubmitConfirmModal.value = false
      return
    }

    showSubmitConfirmModal.value = false
    successMessage.value = 'Formulario enviado correctamente. La jornada fue finalizada.'
    initialSnapshot.value = normalizeFormSnapshot(formDraft.value)
    pendingPayload.value = null

    window.setTimeout(() => {
      router.push('/home')
    }, 1400)
  }

  const handleCancelSubmitConfirm = () => {
    showSubmitConfirmModal.value = false
  }

  const handleCancelForm = () => {
    if (isSubmitting.value) return

    if (!isDirty.value) {
      router.push('/home')
      return
    }

    showCancelFormConfirmModal.value = true
  }

  const handleConfirmCancelForm = () => {
    showCancelFormConfirmModal.value = false
    router.push('/home')
  }

  const handleDismissCancelForm = () => {
    showCancelFormConfirmModal.value = false
  }

  const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (!isDirty.value || isSubmitting.value) {
      return
    }

    event.preventDefault()
    event.returnValue = 'Tienes cambios sin enviar. Si sales, se perderan.'
  }

  onBeforeRouteLeave(() => {
    if (!isDirty.value || isSubmitting.value) {
      return true
    }

    return window.confirm('Tienes cambios sin enviar. Si sales del formulario, se perderan.')
  })

  onMounted(async () => {
    await fetchSessionState()

    if (!isActive.value) {
      router.push('/home')
      return
    }

    await loadCatalogs()
    initialSnapshot.value = normalizeFormSnapshot(formDraft.value)
    window.addEventListener('beforeunload', beforeUnloadHandler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', beforeUnloadHandler)
  })

  return {
    isActive,
    isLoading,
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
  }
}
