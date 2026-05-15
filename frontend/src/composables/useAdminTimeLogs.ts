import { ref, computed } from 'vue';
import api from '@/services/api';

/**
 * Composable para administrar timelogs en el lado del cliente.
 *
 * Comportamiento clave:
 * - Soft sync: una única llamada por mes (cache en memory por mes).
 * - Filtrado en memoria (tabs: all / PENDING / APPROVED).
 * - Optimistic update controlado para aprobar (con rollback si falla).
 * - Exposición de métodos: fetchMonth, refresh, approve, setFilters.
 */

/* Tipos locales */
type Tab = 'ALL' | 'PENDING' | 'APPROVED';

interface TimeLogAssistant {
  id: number;
  full_name: string;
  username?: string;
}

interface TimeLogProject {
  id: number;
  name: string;
}

export interface TimeLogItem {
  id: number;
  assistant: TimeLogAssistant;
  project?: TimeLogProject | null;
  check_in: string;
  check_out: string | null;
  status: string;
  elapsed_seconds: number;
  approved_by?: { id: number; full_name: string } | null;
  approved_at?: string | null;
  decision_comment?: string | null;
}

/* Estado interno */
const timeLogs = ref<TimeLogItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const lastFetchedMonth = ref<string | null>(null); // 'YYYY-MM'
const stale = ref(false);

/* Filtros */
const activeTab = ref<Tab>('ALL');
const filterAssistantId = ref<number | null>(null);
const filterStartISO = ref<string | null>(null); // ISO date string
const filterEndISO = ref<string | null>(null);

/* Helpers de filtrado (pueden componerse) */
function byTab(items: TimeLogItem[], tab: Tab) {
  if (tab === 'ALL') return items;
  if (tab === 'PENDING') return items.filter((i) => i.status === 'PENDING');
  if (tab === 'APPROVED') return items.filter((i) => i.status === 'APPROVED');
  return items;
}

function byAssistant(items: TimeLogItem[], assistantId: number | null) {
  if (!assistantId) return items;
  return items.filter((i) => i.assistant?.id === assistantId);
}

function byDateRange(items: TimeLogItem[], startISO: string | null, endISO: string | null) {
  if (!startISO && !endISO) return items;
  const start = startISO ? new Date(startISO) : null;
  const end = endISO ? new Date(endISO) : null;
  return items.filter((i) => {
    const checkIn = new Date(i.check_in);
    if (start && checkIn < start) return false;
    if (end && checkIn > end) return false;
    return true;
  });
}

/* Computed: resultados filtrados (sin disparar requests) */
const filteredTimeLogs = computed(() => {
  let items = timeLogs.value.slice();
  items = byTab(items, activeTab.value);
  items = byAssistant(items, filterAssistantId.value);
  items = byDateRange(items, filterStartISO.value, filterEndISO.value);
  return items;
});

/* Fetch: solo hace request si month distinto o stale */
async function fetchMonth(month: string) {
  if (loading.value) return;
  // Si ya tenemos ese mes y no está stale, no volver a fetch
  if (lastFetchedMonth.value === month && !stale.value && timeLogs.value.length > 0) {
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    const resp = await api.getTimeLogs(month);
    if (resp && resp.results) {
      timeLogs.value = resp.results;
      lastFetchedMonth.value = month;
      stale.value = false;
    } else {
      timeLogs.value = [];
      lastFetchedMonth.value = month;
      stale.value = false;
    }
  } catch (e: any) {
    error.value = e?.message || String(e);
  } finally {
    loading.value = false;
  }
}

/* Refresh manual: fuerza reemplazo desde backend */
async function refresh() {
  if (!lastFetchedMonth.value) return;
  stale.value = false;
  await fetchMonth(lastFetchedMonth.value);
}

/* Approve: optimistic update con rollback en error */
async function approve(id: number, decision_comment?: string) {
  const idx = timeLogs.value.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('TimeLog not found');
  const currentItem = timeLogs.value[idx]!;

  // Snapshot para rollback
  const original: TimeLogItem = { ...currentItem };

  // Optimistic update
  const currentUser = api.getUser();
  const nowIso = new Date().toISOString();
  timeLogs.value[idx] = {
    ...currentItem,
    status: 'APPROVED',
    approved_by: currentUser ? { id: currentUser.id, full_name: currentUser.full_name } : currentItem.approved_by,
    approved_at: nowIso,
    decision_comment: decision_comment ?? currentItem.decision_comment,
  };

  try {
    const payload: Partial<{ status: string; decision_comment?: string }> = { status: 'APPROVED' };
    if (decision_comment) payload.decision_comment = decision_comment;
    await api.patchTimeLog(id, payload);
    // No refetch; backend is source of truth and will be reconciled en next refresh
    return { ok: true };
  } catch (e: any) {
    // Rollback
    timeLogs.value[idx] = original;
    return { ok: false, error: e?.message || String(e) };
  }
}

/* Setters de filtros */
function setTab(tab: Tab) {
  activeTab.value = tab;
}

function setAssistantFilter(id: number | null) {
  filterAssistantId.value = id;
}

function setDateRange(startISO: string | null, endISO: string | null) {
  filterStartISO.value = startISO;
  filterEndISO.value = endISO;
}

/* Invalidation utility (opcional: para invalidación por tiempo) */
function markStale() {
  stale.value = true;
}

/* Reset (para cambiar mes o limpiar) */
function reset() {
  timeLogs.value = [];
  lastFetchedMonth.value = null;
  stale.value = false;
  error.value = null;
  loading.value = false;
  activeTab.value = 'ALL';
  filterAssistantId.value = null;
  filterStartISO.value = null;
  filterEndISO.value = null;
}

export default function useAdminTimeLogs() {
  return {
    // state
    timeLogs,
    loading,
    error,
    lastFetchedMonth,
    stale,

    // filters & derived
    activeTab,
    filterAssistantId,
    filterStartISO,
    filterEndISO,
    filteredTimeLogs,

    // actions
    fetchMonth,
    refresh,
    approve,
    setTab,
    setAssistantFilter,
    setDateRange,
    markStale,
    reset,
  };
}