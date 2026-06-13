import z from 'zod'

export const workSessionCloseFormSchema = z.object({
  project_id: z.union([z.string(), z.number()]).optional().nullable(),
  manager_user_id: z.union([z.string(), z.number()]).optional().nullable(),
  activities: z.string().max(100, 'Actividades realizadas no puede superar 100 caracteres.').optional().default(''),
  notes: z.string().max(500, 'Notas no puede superar 500 caracteres.').optional().default(''),
  break_minutes: z.coerce.number().min(0, 'Tiempo de ocio / almuerzo debe ser mayor o igual a 0.').optional().default(0),
})

export type WorkSessionCloseFormInput = z.infer<typeof workSessionCloseFormSchema>
