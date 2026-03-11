/**
 * Configuración de roles y permisos del sistema ProDUS
 */

export type UserRole = 'admin' | 'coordinador' | 'asistente'

export interface RoleConfig {
  label: string
  description: string
  permissions: string[]
  features: string[]
}

export const ROLES: Record<UserRole, RoleConfig> = {
  asistente: {
    label: 'Asistente',
    description: 'Usuario asistente que registra sus horas',
    permissions: [
      'view_own_hours',
      'edit_own_hours',
      'view_own_schedule'
    ],
    features: [
      'registro_horas',
      'mis_horarios',
      'mis_reportes'
    ]
  },
  coordinador: {
    label: 'Coordinador',
    description: 'Coordinador de proyecto',
    permissions: [
      'view_team_hours',
      'approve_hours',
      'manage_team',
      'view_team_schedule',
      'generate_reports'
    ],
    features: [
      'registro_horas',
      'gestionar_equipo',
      'reportes_proyecto',
      'horarios_equipo'
    ]
  },
  admin: {
    label: 'Administrador',
    description: 'Administrador del sistema',
    permissions: [
      'manage_users',
      'manage_roles',
      'system_configuration',
      'view_all_data',
      'manage_ip_ranges',
      'generate_global_reports'
    ],
    features: [
      'registro_horas',
      'gestionar_usuarios',
      'configuracion_sistema',
      'reportes_globales',
      'rangos_ip'
    ]
  }
}

export const hasPermission = (role: UserRole, permission: string): boolean => {
  return ROLES[role]?.permissions.includes(permission) || false
}

export const hasFeature = (role: UserRole, feature: string): boolean => {
  return ROLES[role]?.features.includes(feature) || false
}
