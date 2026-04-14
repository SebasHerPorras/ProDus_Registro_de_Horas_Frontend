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
  maxLength?: number
  showCounter?: boolean
  pattern?: string
  patternMessage?: string
  options?: GenericFormOption[]
  order?: number
  span?: number
  spaceAfter?: string
  disabled?: boolean
  defaultValue?: string | number | boolean
}

interface BuildCloseFormFieldsInput {
  projectOptions: GenericFormOption[]
  coordinatorOptions: GenericFormOption[]
  disableProjectSelect?: boolean
  disableCoordinatorSelect?: boolean
}

export const buildWorkSessionCloseFormFields = ({
  projectOptions,
  coordinatorOptions,
  disableProjectSelect = false,
  disableCoordinatorSelect = false,
}: BuildCloseFormFieldsInput): GenericFormField[] => {
  return [
    {
      name: 'project_id',
      label: 'Proyecto',
      type: 'select',
      required: false,
      options: projectOptions,
      disabled: disableProjectSelect,
      order: 1,
      span: 1,
      spaceAfter: 'sm',
    },
    {
      name: 'manager_user_id',
      label: 'Encargado',
      type: 'select',
      required: false,
      options: coordinatorOptions,
      disabled: disableCoordinatorSelect,
      order: 2,
      span: 1,
      spaceAfter: 'sm',
    },
    {
      name: 'activities',
      label: 'Actividades realizadas',
      type: 'textarea',
      required: false,
      maxLength: 100,
      showCounter: true,
      placeholder: 'Describe brevemente lo que realizaste durante la jornada',
      order: 3,
      span: 2,
      spaceAfter: 'sm',
    },
    {
      name: 'notes',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      maxLength: 500,
      showCounter: true,
      placeholder: 'Opcional (maximo 500 caracteres)',
      pattern: '^.{0,500}$',
      patternMessage: 'Observaciones no puede superar 500 caracteres',
      order: 4,
      span: 2,
      spaceAfter: 'sm',
    },
    {
      name: 'break_minutes',
      label: 'Minutos de descanso',
      type: 'number',
      required: false,
      defaultValue: 0,
      placeholder: '0',
      order: 5,
      span: 1,
      spaceAfter: 'none',
    },
  ]
}
