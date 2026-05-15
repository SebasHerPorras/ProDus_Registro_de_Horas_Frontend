<template>
  <div class="page-root">
    <AppHeader
      title="ProDUS"
      subtitle="Administración de Jornadas"
      :user-role="roleLabel"
      :user-name="displayName"
      @logout="handleLogout"
    />

    <main class="page-body">
      <WelcomeBanner
        :title="`Hola, ${displayName}`"
        subtitle="Vista en preparación, sin backend todavía. Conserva el estilo general y solo muestra filtros básicos."
      />

      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>Filtros</h3>
            <p>Mes y persona específica cuando el catálogo esté disponible.</p>
          </div>
        </div>

        <div class="grid">
          <label>
            <span>Mes</span>
            <input v-model="selectedMonth" type="month" :disabled="!filterByMonth" :class="{ disabled: !filterByMonth }" />
          </label>

          <div class="toggle-field">
            <span>Tiempo</span>
            <label class="checkbox-row">
              <input v-model="filterByMonth" type="checkbox" />
              <span>{{ filterByMonth ? 'Mes específico' : 'Todo el tiempo (ALL)' }}</span>
            </label>
          </div>

          <label>
            <span>Persona</span>
            <select v-model="selectedAssistantId">
              <option value="ALL">Todos los asistentes</option>
              <option v-for="assistant in assistants" :key="assistant.id" :value="assistant.username">
                {{ assistant.full_name }} ({{ assistant.username }})
              </option>
            </select>
          </label>

          <label>
            <span>Estado</span>
            <select v-model="activeTab">
              <option value="PENDING">Pendientes</option>
              <option value="APPROVED">Aprobadas</option>
              <option value="ALL">Todas</option>
            </select>
          </label>
        </div>

        <div class="actions-row">
          <button type="button" class="apply-btn" @click="applyFilters">
            Aplicar filtros
          </button>
        </div>
      </section>

      <GenericDataList
        title="Jornadas"
        :items="tableItems"
        :columns="columns"
        emptyMessage="No hay jornadas cargadas todavía"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ROLES } from '@/config/roles'
import { useAuth } from '@/composables/useAuth'
import AppHeader from '@/components/AppHeader.vue'
import WelcomeBanner from '@/components/WelcomeBanner.vue'
import GenericDataList from '@/components/GenericDataList.vue'
import api from '@/services/api'

const router = useRouter()
const { userRole, userName } = useAuth()

const displayName = computed(() => userName.value || 'Usuario')
const roleLabel = computed(() => {
  if (!userRole.value) return 'Usuario'
  return ROLES[userRole.value]?.label || 'Usuario'
})

const assistants = ref<Array<{ id: number; full_name: string; username: string }>>([])
const filterByMonth = ref(false)
const selectedMonth = ref(defaultMonth())
const selectedAssistantId = ref<string>('ALL')
const activeTab = ref<'ALL' | 'PENDING' | 'APPROVED'>('PENDING')
const rawTimeLogs = ref<Array<{
  id: number
  assistant?: { username?: string | null; full_name?: string | null } | null
  month?: string | null
  status?: string | null
}>>([])
const tableItems = computed(() =>
  rawTimeLogs.value.map((item) => ({
    id: item.id,
    assistant: item.assistant?.full_name || item.assistant?.username || '-',
    month: item.month || '-',
    status: (item.status || '-').toUpperCase(),
  })),
)

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'assistant', label: 'Persona' },
  { key: 'month', label: 'Mes' },
  { key: 'status', label: 'Estado' },
]

function defaultMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function applyFilters() {
  const statusValue = activeTab.value === 'ALL' ? null : activeTab.value.toLowerCase() as 'pending' | 'approved'
  const payload = {
    month: filterByMonth.value ? selectedMonth.value : null,
    studentId: selectedAssistantId.value === 'ALL' ? null : selectedAssistantId.value,
    status: statusValue,
  }

  void api
    .filterAdminTimeLogs(payload)
    .then((response) => {
      rawTimeLogs.value = response.results || []
    })
    .catch((error) => {
      console.warn('No se pudo cargar jornadas con filtros:', error)
      rawTimeLogs.value = []
    })
}

const loadAssistants = async () => {
  try {
    const response = await api.listAssistants()
    assistants.value = (response.results || [])
      .map((assistant) => ({
        id: assistant.id,
        full_name: assistant.full_name,
        username: assistant.username,
      }))
      .sort((left, right) => left.full_name.localeCompare(right.full_name))
  } catch (error) {
    console.warn('No se pudo cargar la lista de asistentes:', error)
    assistants.value = []
  }
}

onMounted(() => {
  void loadAssistants()
  applyFilters()
})

function handleLogout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.page-root { min-height: 100vh; background: #f5f5f5; }
.page-body { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; }
.panel { background: #fff; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,.08); }
.panel-head h3 { margin: 0; color: #003d7a; }
.panel-head p { margin: .35rem 0 0; color: #64748b; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }
label { display: flex; flex-direction: column; gap: .4rem; color: #003d7a; font-weight: 600; }
input, select { border: 1px solid #dbe3ec; border-radius: 8px; padding: .8rem .95rem; }
.toggle-field { justify-content: flex-end; }
.checkbox-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
  font-weight: 600;
  color: #003d7a;
  margin-top: .15rem;
}
.checkbox-row input {
  width: 16px;
  height: 16px;
  padding: 0;
  margin: 0;
  accent-color: #003d7a;
  flex-shrink: 0;
}
.checkbox-row span {
  font-size: .95rem;
  line-height: 1.1;
}
.disabled { opacity: .45; background: #f8fafc; }
.actions-row { display: flex; justify-content: flex-end; margin-top: 1rem; }
.apply-btn {
  border: 1px solid #16803c;
  background: linear-gradient(135deg, #0052a3, #003d7a);
  color: #fff;
  padding: .8rem 1.15rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(0, 61, 122, 0.18);
}
.apply-btn:hover {
  filter: brightness(1.03);
  transform: translateY(-1px);
}
@media (max-width: 768px) { .page-body { padding: 1.5rem 1rem 2rem; } .grid { grid-template-columns: 1fr; } }
</style>
