<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppButton from '@/components/AppButton.vue'

const props = withDefaults(
  defineProps<{
    storageKey?: string
    heading?: string
    subheading?: string
  }>(),
  {
    storageKey: 'schedule_builder_blocks',
    heading: 'Hacer Horario',
    subheading: 'Selecciona días y un rango de horas para crear bloques de horario.'
  }
)

interface DayOption {
  code: string
  label: string
  order: number
}

interface ScheduleBlock {
  id: number
  day_of_week: string
  start_time: string
  end_time: string
  work_minutes: number
}

const dayOptions: DayOption[] = [
  { code: 'MONDAY', label: 'Lunes', order: 1 },
  { code: 'TUESDAY', label: 'Martes', order: 2 },
  { code: 'WEDNESDAY', label: 'Miércoles', order: 3 },
  { code: 'THURSDAY', label: 'Jueves', order: 4 },
  { code: 'FRIDAY', label: 'Viernes', order: 5 },
  { code: 'SATURDAY', label: 'Sábado', order: 6 },
  { code: 'SUNDAY', label: 'Domingo', order: 7 }
]

const selectedDays = ref<string[]>([])
const startTime = ref('')
const endTime = ref('')
const blocks = ref<ScheduleBlock[]>([])
const errorMessage = ref('')
const successMessage = ref('')

const dayLabelMap = computed(() => {
  return dayOptions.reduce<Record<string, string>>((acc, day) => {
    acc[day.code] = day.label
    return acc
  }, {})
})

const dayOrderMap = computed(() => {
  return dayOptions.reduce<Record<string, number>>((acc, day) => {
    acc[day.code] = day.order
    return acc
  }, {})
})

const totalWeeklyMinutes = computed(() => {
  return blocks.value.reduce((acc, block) => acc + block.work_minutes, 0)
})

const totalWeeklyHours = computed(() => {
  return (totalWeeklyMinutes.value / 60).toFixed(2)
})

const groupedBlocks = computed(() => {
  return dayOptions
    .map((day) => ({
      dayCode: day.code,
      dayLabel: day.label,
      items: blocks.value.filter((block) => block.day_of_week === day.code)
    }))
    .filter((group) => group.items.length > 0)
})

const toMinutes = (time: string): number => {
  const [hour = 0, minute = 0] = time.split(':').map(Number)
  return hour * 60 + minute
}

const hasOverlap = (dayCode: string, newStart: string, newEnd: string): boolean => {
  const newStartMinutes = toMinutes(newStart)
  const newEndMinutes = toMinutes(newEnd)

  return blocks.value
    .filter((block) => block.day_of_week === dayCode)
    .some((block) => {
      const existingStart = toMinutes(block.start_time)
      const existingEnd = toMinutes(block.end_time)
      return newStartMinutes < existingEnd && newEndMinutes > existingStart
    })
}

const normalizeAndSort = (): void => {
  blocks.value = [...blocks.value].sort((a, b) => {
    const dayOrderDiff = (dayOrderMap.value[a.day_of_week] || 99) - (dayOrderMap.value[b.day_of_week] || 99)
    if (dayOrderDiff !== 0) return dayOrderDiff
    return toMinutes(a.start_time) - toMinutes(b.start_time)
  })
}

const resetMessages = (): void => {
  errorMessage.value = ''
  successMessage.value = ''
}

const addBlocks = (): void => {
  resetMessages()

  if (!selectedDays.value.length) {
    errorMessage.value = 'Selecciona al menos un día.'
    return
  }

  if (!startTime.value || !endTime.value) {
    errorMessage.value = 'Debes seleccionar hora de inicio y hora de fin.'
    return
  }

  const startMinutes = toMinutes(startTime.value)
  const endMinutes = toMinutes(endTime.value)

  if (endMinutes <= startMinutes) {
    errorMessage.value = 'La hora de fin debe ser mayor a la hora de inicio.'
    return
  }

  const overlappedDays = selectedDays.value.filter((dayCode) => hasOverlap(dayCode, startTime.value, endTime.value))

  if (overlappedDays.length) {
    const labels = overlappedDays.map((dayCode) => dayLabelMap.value[dayCode]).join(', ')
    errorMessage.value = `Ya existe un bloque traslapado para: ${labels}.`
    return
  }

  const workMinutes = endMinutes - startMinutes
  const newBlocks: ScheduleBlock[] = selectedDays.value.map((dayCode) => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    day_of_week: dayCode,
    start_time: startTime.value,
    end_time: endTime.value,
    work_minutes: workMinutes
  }))

  blocks.value = [...blocks.value, ...newBlocks]
  normalizeAndSort()
  selectedDays.value = []
  successMessage.value = 'Bloque(s) agregado(s) correctamente.'
}

const removeBlock = (blockId: number): void => {
  resetMessages()
  blocks.value = blocks.value.filter((block) => block.id !== blockId)
  successMessage.value = 'Bloque eliminado correctamente.'
}

const clearAllBlocks = (): void => {
  resetMessages()
  blocks.value = []
  selectedDays.value = []
  startTime.value = ''
  endTime.value = ''
  successMessage.value = 'Horario limpiado.'
}

const loadBlocks = (key: string): void => {
  const saved = localStorage.getItem(key)
  if (!saved) {
    blocks.value = []
    return
  }

  try {
    const parsed = JSON.parse(saved) as ScheduleBlock[]
    blocks.value = Array.isArray(parsed) ? parsed : []
    normalizeAndSort()
  } catch {
    blocks.value = []
  }
}

onMounted(() => {
  loadBlocks(props.storageKey)
})

watch(
  blocks,
  (value) => {
    localStorage.setItem(props.storageKey, JSON.stringify(value))
  },
  { deep: true }
)

watch(
  () => props.storageKey,
  (newKey) => {
    resetMessages()
    selectedDays.value = []
    startTime.value = ''
    endTime.value = ''
    loadBlocks(newKey)
  }
)
</script>

<template>
  <section class="schedule-builder">
    <h2 class="title">{{ heading }}</h2>
    <p class="subtitle">{{ subheading }}</p>

    <div class="builder-card">
      <div class="days-grid">
        <label v-for="day in dayOptions" :key="day.code" class="day-option">
          <input v-model="selectedDays" type="checkbox" :value="day.code" />
          <span>{{ day.label }}</span>
        </label>
      </div>

      <div class="time-row">
        <label class="time-field">
          <span>Hora inicio</span>
          <input v-model="startTime" type="time" />
        </label>

        <label class="time-field">
          <span>Hora fin</span>
          <input v-model="endTime" type="time" />
        </label>
      </div>

      <div class="actions-row">
        <AppButton variant="primary" @click="addBlocks">Agregar bloque</AppButton>
        <AppButton variant="secondary" @click="clearAllBlocks">Limpiar todo</AppButton>
      </div>

      <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="message success">{{ successMessage }}</p>
    </div>

    <div class="summary-card">
      <p><strong>Bloques creados:</strong> {{ blocks.length }}</p>
      <p><strong>Total semanal:</strong> {{ totalWeeklyMinutes }} min ({{ totalWeeklyHours }} h)</p>
      <p class="hint">Datos guardados localmente en este navegador.</p>
    </div>

    <div class="list-card">
      <h3>Bloques del horario</h3>

      <p v-if="!blocks.length" class="empty-state">Aún no hay bloques agregados.</p>

      <div v-for="group in groupedBlocks" :key="group.dayCode" class="day-group">
        <h4>{{ group.dayLabel }}</h4>

        <div v-for="block in group.items" :key="block.id" class="block-row">
          <span>{{ block.start_time }} - {{ block.end_time }}</span>
          <span>{{ block.work_minutes }} min</span>
          <AppButton variant="danger" size="sm" @click="removeBlock(block.id)">Eliminar</AppButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.schedule-builder {
  display: grid;
  gap: 1.25rem;
}

.title {
  margin: 0;
  color: var(--color-primary-dark);
}

.subtitle {
  margin: 0;
  color: var(--color-text-muted);
}

.builder-card,
.summary-card,
.list-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.day-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-gray-100, #f3f4f6);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.time-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.time-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: var(--color-text);
  font-weight: 500;
}

.time-field input {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.55rem 0.65rem;
}

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.message {
  margin-top: 0.75rem;
  margin-bottom: 0;
  font-weight: 600;
}

.error {
  color: var(--color-error);
}

.success {
  color: var(--color-success);
}

.hint {
  margin: 0.35rem 0 0;
  color: var(--color-text-muted);
  font-size: 0.92rem;
}

.list-card h3 {
  margin: 0 0 1rem;
  color: var(--color-primary-dark);
}

.empty-state {
  margin: 0;
  color: var(--color-text-muted);
}

.day-group {
  border-top: 1px solid var(--color-border);
  padding-top: 0.9rem;
  margin-top: 0.9rem;
}

.day-group h4 {
  margin: 0 0 0.75rem;
  color: var(--color-primary-dark);
}

.block-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  background: var(--color-gray-100, #f3f4f6);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .block-row {
    grid-template-columns: 1fr;
  }
}
</style>