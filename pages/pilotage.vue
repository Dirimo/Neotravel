<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4">
    <div class="max-w-6xl mx-auto animate-fade-in">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('pilotage.title') }}</h1>
        <p class="text-sm text-gray-400 mt-1">{{ t('pilotage.sub') }}</p>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="flex items-center justify-center py-24 text-gray-300">
        <svg class="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <span class="text-sm">Chargement…</span>
      </div>

      <!-- Erreur -->
      <div v-else-if="erreur" class="bg-white border border-gray-100 rounded-2xl px-6 py-8 text-center text-sm text-red-400 shadow-sm">
        {{ erreur }}
      </div>

      <template v-else-if="tousLesDevis.length === 0">
        <div class="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center shadow-sm">
          <p class="text-sm text-gray-400">{{ t('pilotage.empty') }}</p>
        </div>
      </template>

      <template v-else>
        <!-- KPIs -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-white border border-gray-100 rounded-2xl px-5 py-5 shadow-sm">
            <p class="text-2xl font-bold text-gray-900">{{ kpis.volume }}</p>
            <p class="text-sm font-medium text-gray-700 mt-1">{{ t('pilotage.kpi.leads') }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ t('pilotage.kpi.leads.sub') }}</p>
          </div>
          <div class="bg-white border border-gray-100 rounded-2xl px-5 py-5 shadow-sm">
            <p class="text-2xl font-bold text-gray-900">{{ kpis.tauxConversion }}%</p>
            <p class="text-sm font-medium text-gray-700 mt-1">{{ t('pilotage.kpi.conv') }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ t('pilotage.kpi.conv.sub') }}</p>
          </div>
          <div class="bg-white border border-gray-100 rounded-2xl px-5 py-5 shadow-sm">
            <p class="text-2xl font-bold text-gray-900">{{ kpis.delaiMoyen }} j</p>
            <p class="text-sm font-medium text-gray-700 mt-1">{{ t('pilotage.kpi.delay') }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ t('pilotage.kpi.delay.sub') }}</p>
          </div>
          <div class="bg-white border border-gray-100 rounded-2xl px-5 py-5 shadow-sm">
            <p class="text-2xl font-bold text-gray-900">{{ formatPrix(kpis.caPotentiel) }}</p>
            <p class="text-sm font-medium text-gray-700 mt-1">{{ t('pilotage.kpi.ca') }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ t('pilotage.kpi.ca.sub') }}</p>
          </div>
        </div>

        <!-- Graphiques -->
        <div class="grid lg:grid-cols-2 gap-4 mb-6">
          <div class="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
            <h2 class="font-semibold text-gray-900 text-sm mb-4">{{ t('pilotage.chart.status') }}</h2>
            <div class="space-y-3">
              <div v-for="s in repartitionStatuts" :key="s.statut" class="flex items-center gap-3">
                <span class="text-xs text-gray-500 w-16 flex-shrink-0">{{ s.statut }}</span>
                <div class="flex-1 h-2 rounded-full bg-gray-50 overflow-hidden">
                  <div :class="barClass(s.statut)" class="h-full rounded-full transition-all" :style="{ width: s.pct + '%' }"></div>
                </div>
                <span class="text-xs font-medium text-gray-900 w-6 text-right flex-shrink-0">{{ s.count }}</span>
              </div>
            </div>
          </div>
          <div class="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
            <h2 class="font-semibold text-gray-900 text-sm mb-4">{{ t('pilotage.chart.monthly') }}</h2>
            <div class="flex items-end gap-2 h-32">
              <div v-for="m in volumeParMois" :key="m.mois" class="flex-1 flex flex-col items-center gap-1.5">
                <div class="w-full bg-diamond-100 rounded-md flex items-end justify-center" style="height: 96px;">
                  <div class="w-full bg-diamond-500 rounded-md transition-all" :style="{ height: m.pct + '%' }"></div>
                </div>
                <span class="text-[10px] text-gray-400">{{ m.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tableau des demandes -->
        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <!-- Entête tableau + filtre -->
          <div class="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-4">
            <h2 class="font-semibold text-gray-900 text-sm">{{ t('pilotage.table.title') }}</h2>
            <select
              v-model="filtreStatut"
              class="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-diamond-400 focus:ring-2 focus:ring-diamond-100 transition-all"
            >
              <option value="">{{ t('pilotage.table.all') }}</option>
              <option value="Envoyé">Envoyé</option>
              <option value="Accepté">Accepté</option>
              <option value="Refusé">Refusé</option>
              <option value="Expiré">Expiré</option>
              <option value="Brouillon">Brouillon</option>
            </select>
          </div>

          <!-- En-têtes colonnes -->
          <div class="hidden sm:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1.5fr] gap-4 px-6 py-2 bg-gray-50/60 border-b border-gray-50 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span>{{ t('pilotage.table.ref') }}</span>
            <span>{{ t('pilotage.table.trajet') }}</span>
            <span>{{ t('pilotage.table.date') }}</span>
            <span class="text-right">{{ t('pilotage.table.pax') }}</span>
            <span class="text-right">{{ t('pilotage.table.prix') }}</span>
            <span>{{ t('pilotage.table.statut') }}</span>
          </div>

          <!-- Lignes -->
          <div v-if="devisFiltres.length === 0" class="px-6 py-10 text-center text-sm text-gray-400">
            Aucun devis pour ce statut
          </div>
          <div
            v-for="d in devisFiltres"
            :key="d.id"
            class="grid sm:grid-cols-[1fr_2fr_1fr_1fr_1fr_1.5fr] gap-4 items-center px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors"
          >
            <span class="text-xs font-mono text-gray-500 truncate">{{ d.reference }}</span>
            <span class="text-sm font-medium text-gray-900 truncate">{{ d.trajet }}</span>
            <span class="text-xs text-gray-500">{{ formatDate(d.dateDepart) }}</span>
            <span class="text-xs text-gray-900 text-right">{{ d.passagers > 0 ? d.passagers + ' pers.' : '—' }}</span>
            <span class="text-sm font-semibold text-gray-900 text-right">{{ formatPrix(d.prixTTC) }}</span>

            <!-- Dropdown statut -->
            <div class="flex items-center gap-2">
              <select
                :value="d.statut"
                :disabled="d.enMaj"
                @change="changerStatut(d, ($event.target as HTMLSelectElement).value)"
                :class="selectStatutClass(d.statut)"
                class="text-xs font-medium rounded-full px-3 py-1 border outline-none cursor-pointer disabled:opacity-50 disabled:cursor-wait transition-all focus:ring-2 focus:ring-diamond-100"
              >
                <option value="Envoyé">Envoyé</option>
                <option value="Accepté">Accepté</option>
                <option value="Refusé">Refusé</option>
                <option value="Expiré">Expiré</option>
                <option value="Brouillon">Brouillon</option>
              </select>
              <svg v-if="d.enMaj" class="w-3.5 h-3.5 text-gray-300 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </div>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
definePageMeta({ layout: 'default', ssr: false })

const { token, isLoggedIn, isAdmin, init } = useAuth()
const { t } = useLang()
const router = useRouter()

const devis = ref<any[]>([])
const loading = ref(true)
const erreur = ref('')
const filtreStatut = ref('')

async function chargerDevis() {
  try {
    const res = await fetch('http://localhost:3001/devis/all', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (res.ok) {
      devis.value = data.devis.map((d: any) => ({
        id: d.id,
        reference: d.fields['Référence'] ?? `NEO-${d.id.slice(-6).toUpperCase()}`,
        trajet: d.fields['Lieu_arrivée']
          ? `${d.fields['Lieu_départ']} → ${d.fields['Lieu_arrivée']}`
          : (d.fields['Lieu_départ'] ?? '—'),
        dateDepart: d.fields['Date_départ'] ?? d.fields['Date_création'] ?? '—',
        passagers: Number(d.fields['Nombre_passagers'] ?? 0),
        prixTTC: Number(d.fields['Prix_TTC'] ?? 0),
        statut: d.fields['Statut'] ?? 'Envoyé',
        enMaj: false,
      }))
    } else {
      erreur.value = data.error ?? 'Erreur lors du chargement'
    }
  } catch {
    erreur.value = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
  } finally {
    loading.value = false
  }
}

async function changerStatut(d: any, nouveauStatut: string) {
  d.enMaj = true
  const ancienStatut = d.statut
  d.statut = nouveauStatut
  try {
    const res = await fetch(`http://localhost:3001/devis/${d.id}/statut`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`
      },
      body: JSON.stringify({ statut: nouveauStatut })
    })
    if (!res.ok) {
      d.statut = ancienStatut
    }
  } catch {
    d.statut = ancienStatut
  } finally {
    d.enMaj = false
  }
}

const tousLesDevis = computed(() => devis.value)

const devisFiltres = computed(() =>
  filtreStatut.value
    ? devis.value.filter(d => d.statut === filtreStatut.value)
    : devis.value
)

const kpis = computed(() => {
  const total = tousLesDevis.value.length
  const acceptes = tousLesDevis.value.filter(d => d.statut === 'Accepté').length
  const enAttente = tousLesDevis.value.filter(d => d.statut === 'Envoyé')
  const ages = enAttente
    .map(d => {
      const dt = new Date(d.dateDepart)
      if (isNaN(dt.getTime())) return null
      return Math.max(0, Math.round((Date.now() - dt.getTime()) / 86400000))
    })
    .filter((a): a is number => a !== null)
  const caPotentiel = tousLesDevis.value.reduce((sum, d) => sum + d.prixTTC, 0)
  return {
    volume: total,
    tauxConversion: total > 0 ? Math.round((acceptes / total) * 100) : 0,
    delaiMoyen: ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0,
    caPotentiel
  }
})

const repartitionStatuts = computed(() => {
  const statuts = ['Envoyé', 'Accepté', 'Refusé', 'Expiré', 'Brouillon']
  const total = tousLesDevis.value.length || 1
  return statuts
    .map(statut => ({ statut, count: tousLesDevis.value.filter(d => d.statut === statut).length, pct: 0 }))
    .map(s => ({ ...s, pct: Math.round((s.count / total) * 100) }))
    .filter(s => s.count > 0)
})

const volumeParMois = computed(() => {
  const compteurs = new Map<string, number>()
  for (const d of tousLesDevis.value) {
    const cle = String(d.dateDepart).slice(0, 7)
    if (cle && cle !== 'undefi') compteurs.set(cle, (compteurs.get(cle) ?? 0) + 1)
  }
  const mois = [...compteurs.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const max = Math.max(1, ...mois.map(([, c]) => c))
  return mois.map(([cle, count]) => ({
    mois: cle,
    label: new Date(`${cle}-01`).toLocaleDateString('fr-FR', { month: 'short' }),
    pct: Math.round((count / max) * 100)
  }))
})

function formatDate(val: unknown): string {
  if (!val || val === '—') return '—'
  const d = new Date(String(val))
  if (isNaN(d.getTime())) return String(val)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPrix(val: unknown): string {
  if (!val) return '0 €'
  return `${Number(val).toLocaleString('fr-FR')} €`
}

function barClass(statut: string): string {
  if (statut === 'Accepté') return 'bg-green-500'
  if (statut === 'Refusé') return 'bg-red-400'
  if (statut === 'Envoyé') return 'bg-blue-400'
  if (statut === 'Expiré') return 'bg-gray-300'
  return 'bg-gray-200'
}

function selectStatutClass(statut: string): string {
  if (statut === 'Accepté') return 'bg-green-50 text-green-700 border-green-100'
  if (statut === 'Refusé') return 'bg-red-50 text-red-600 border-red-100'
  if (statut === 'Envoyé') return 'bg-blue-50 text-blue-600 border-blue-100'
  if (statut === 'Expiré') return 'bg-gray-100 text-gray-400 border-gray-200'
  return 'bg-gray-50 text-gray-500 border-gray-100'
}

onMounted(() => {
  init()
  if (!isLoggedIn.value) { router.push('/login'); return }
  if (!isAdmin.value) { router.push('/dashboard'); return }
  chargerDevis()
})
</script>
