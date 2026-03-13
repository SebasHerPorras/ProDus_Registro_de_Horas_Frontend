export const assistantFormFields = [
  {
    name: 'username',
    label: 'Usuario',
    type: 'text',
    placeholder: 'Ej: asistente.01',
    required: true,
    order: 1,
    span: 1,
    spaceAfter: 'sm'
  },
  {
    name: 'full_name',
    label: 'Nombre completo',
    type: 'text',
    placeholder: 'Ej: Ana Torres',
    required: true,
    order: 2,
    span: 1,
    spaceAfter: 'sm'
  },
  {
    name: 'email',
    label: 'Correo',
    type: 'email',
    placeholder: 'nombre@correo.com',
    required: false,
    order: 3,
    span: 2,
    spaceAfter: 'md'
  },
  {
    name: 'password',
    label: 'Contraseña temporal',
    type: 'password',
    placeholder: 'Mínimo 8, 1 mayúscula y 1 número',
    required: true,
    pattern: '^(?=.*[A-Z])(?=.*\\d).{8,}$',
    patternMessage: 'Debe tener mínimo 8 caracteres, una mayúscula y un número',
    order: 4,
    span: 2,
    spaceAfter: 'lg'
  },
  {
    name: 'is_active',
    label: 'Activo',
    type: 'checkbox',
    required: false,
    defaultValue: true,
    order: 5,
    span: 2,
    spaceAfter: 'none'
  }
]
