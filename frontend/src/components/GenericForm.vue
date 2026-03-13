<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import AppButton from '@/components/AppButton.vue'

interface GenericFormOption {
  label: string
  value: string | number | boolean
}

interface GenericFormField {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  pattern?: string
  patternMessage?: string
  options?: GenericFormOption[]
  order?: number
  span?: number
  spaceAfter?: string
  disabled?: boolean
  defaultValue?: string | number | boolean
}

const props = withDefaults(defineProps<{
  title: string
  fields: GenericFormField[]
  confirmText?: string
  cancelText?: string
}>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar'
})

const emit = defineEmits<{
  confirm: [payload: Record<string, unknown>]
  cancel: []
}>()

const formData = reactive<Record<string, any>>({})
const errors = reactive<Record<string, string>>({})

const sortedFields = computed(() => {
  return [...props.fields].sort((firstField, secondField) => {
    const firstOrder = firstField.order ?? 999
    const secondOrder = secondField.order ?? 999
    return firstOrder - secondOrder
  })
})

const initializeForm = () => {
  Object.keys(formData).forEach((key) => delete formData[key])
  Object.keys(errors).forEach((key) => delete errors[key])

  sortedFields.value.forEach((field) => {
    if (field.defaultValue !== undefined) {
      formData[field.name] = field.defaultValue
      return
    }

    if (field.type === 'checkbox') {      formData[field.name] = false
      return
    }

    formData[field.name] = ''
  })
}

watch(
  () => props.fields,
  () => initializeForm(),
  { immediate: true, deep: true }
)

const getFieldClasses = (field: GenericFormField): string[] => {
  const span = field.span === 2 ? 'field-span-2' : 'field-span-1'
  const spacing = `space-${field.spaceAfter ?? 'none'}`
  return ['form-field', span, spacing]
}

const validateField = (field: GenericFormField): string => {
  const value = formData[field.name]
  const normalizedValue = typeof value === 'string' ? value.trim() : value

  if (field.required) {
    const isEmptyString = typeof normalizedValue === 'string' && normalizedValue.length === 0
    const isEmptyNumber = field.type === 'number' && normalizedValue === ''
    if (isEmptyString || isEmptyNumber || normalizedValue === null || normalizedValue === undefined) {
      return `${field.label} es obligatorio`
    }
  }

  if (field.pattern && typeof normalizedValue === 'string' && normalizedValue.length > 0) {
    try {
      const regex = new RegExp(field.pattern)
      if (!regex.test(normalizedValue)) {
        return field.patternMessage || `${field.label} no cumple el formato requerido`
      }
    } catch {
      return `Patrón inválido en ${field.label}`
    }
  }

  return ''
}

const validateForm = (): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key])

  sortedFields.value.forEach((field) => {
    const error = validateField(field)
    if (error) {
      errors[field.name] = error
    }
  })

  return Object.keys(errors).length === 0
}

const onSubmit = () => {
  if (!validateForm()) return
  emit('confirm', { ...formData })
}

const onCancel = () => {
  initializeForm()
  emit('cancel')
}
</script>

<template>
  <section class="generic-form-container">
    <h3 class="form-title">{{ title }}</h3>

    <div class="form-grid">
      <div
        v-for="field in sortedFields"
        :key="field.name"
        :class="getFieldClasses(field)"
      >
        <label class="field-label" :for="field.name">
          {{ field.label }}
          <span class="required-indicator" v-if="field.required">*</span>
        </label>

        <textarea
          v-if="field.type === 'textarea'"
          :id="field.name"
          v-model="formData[field.name]"
          class="field-input field-textarea"
          :placeholder="field.placeholder || ''"
          :disabled="field.disabled"
          rows="3"
        />

        <select
          v-else-if="field.type === 'select'"
          :id="field.name"
          v-model="formData[field.name]"
          class="field-input"
          :disabled="field.disabled"
        >
          <option value="">Selecciona una opción</option>
          <option
            v-for="option in field.options || []"
            :key="`${field.name}-${String(option.value)}`"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <label v-else-if="field.type === 'checkbox'" class="checkbox-wrapper">
          <input
            :id="field.name"
            v-model="formData[field.name]"
            type="checkbox"
            :disabled="field.disabled"
          />
          <span>Marcar</span>
        </label>

        <input
          v-else
          :id="field.name"
          v-model="formData[field.name]"
          class="field-input"
          :type="field.type || 'text'"
          :placeholder="field.placeholder || ''"
          :disabled="field.disabled"
        />

        <p class="field-error" v-if="errors[field.name]">{{ errors[field.name] }}</p>
      </div>
    </div>

    <div class="form-actions">
      <AppButton variant="secondary" size="md" @click="onCancel">
        {{ cancelText }}
      </AppButton>
      <AppButton variant="primary" size="md" @click="onSubmit">
        {{ confirmText }}
      </AppButton>
    </div>
  </section>
</template>

<style scoped>
.generic-form-container {
  margin-bottom: 3rem;
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
}

.form-title {
  font-size: 1.25rem;
  color: #003d7a;
  margin-bottom: 1rem;
  font-weight: 700;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.field-span-1 {
  grid-column: span 1;
}

.field-span-2 {
  grid-column: span 2;
}

.space-none {
  margin-bottom: 0;
}

.space-sm {
  margin-bottom: 0.4rem;
}

.space-md {
  margin-bottom: 0.8rem;
}

.space-lg {
  margin-bottom: 1.25rem;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.35rem;
}

.required-indicator {
  color: #dc2626;
  margin-left: 0.2rem;
}

.field-input {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  font-size: 0.9rem;
  color: #1e293b;
  background: #ffffff;
}

.field-input:focus {
  outline: none;
  border-color: #0052a3;
  box-shadow: 0 0 0 3px rgba(0, 82, 163, 0.12);
}

.field-textarea {
  resize: vertical;
}

.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.2rem;
  color: #334155;
}

.field-error {
  margin-top: 0.35rem;
  color: #dc2626;
  font-size: 0.8rem;
}

.form-actions {
  margin-top: 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .field-span-1,
  .field-span-2 {
    grid-column: span 1;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
