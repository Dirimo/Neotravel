<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4">
    <div class="max-w-5xl mx-auto animate-fade-in">

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

      <template v-else>
        <!-- Vide -->
        <div v-if="tousLesDevis.length === 0" class="bg-white border border-gray-100 rounded-2xl px-6 py-16 text-center shadow-sm">
          <p class="text-sm text-gray-400">{{ t('pilotage.empty') }}</p>
        </div>

        <template v-else>
          <!-- KPIs -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <div class="grid lg:grid-cols-2 gap-4">
            <!-- Répartition par statut -->
            <div class="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
              <h2 class="font-semibold text-gray-900 text-sm mb-4">{{ t('pilotage.chart.status') }}</h2>
              <div class="space-y-3">
                <div v-for="s in repartitionStatuts" :key="s.statut" class="flex items-center gap-3">
                  <span class="text-xs text-gray-500 w-16 flex-shrink-0">{{ s.statut }}</span>
                  <div class="flex-1 h-2 rounded-full bg-gray-50 overflow-hidden">
                    <div :class="badgeBarClass(s.statut)" class="h-full rounded-full transition-all" :style="{ width: s.pct + '%' }"></div>
                  </div>
                  <span class="text-xs font-medium text-gray-900 w-6 text-right flex-shrink-0">{{ s.count }}</span>
                </div>
              </div>
            </div>

            <!-- Volume par mois -->
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
        </template>
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

async function chargerDevis() {
  try {
    const res = await fetch('http://localhost:3001/devis/all', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (res.ok) {
      devis.value = data.devis
    } else {
      erreur.value = data.error ?? 'Erreur lors du chargement des données'
    }
  } catch {
    erreur.value = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
  } finally {
    loading.value = false
  }
}

const tousLesDevis = computed(() => devis.value)

const kpis = computed(() => {
  const total = tousLesDevis.value.length
  const acceptes = tousLesDevis.value.filter((d: any) => d.fields['Statut'] === 'Accepté').length
  const enAttente = tousLesDevis.value.filter((d: any) => d.fields['Statut'] === 'Envoyé')
  const ageJours = enAttente.map((d: any) => {
    const creation = d.fields['Date_création'] ? new Date(d.fields['Date_création']) : null
    if (!creation) return 0
    return Math.max(0, Math.round((Date.now() - creation.getTime()) / 86400000))
  })
  const caPotentiel = tousLesDevis.value.reduce((sum: number, d: any) => sum + Number(d.fields['Prix_TTC'] ?? 0), 0)

  return {
    volume: total,
    tauxConversion: total > 0 ? Math.round((acceptes / total) * 100) : 0,
    delaiMoyen: ageJours.length > 0 ? Math.round(ageJours.reduce((a, b) => a + b, 0) / ageJours.length) : 0,
    caPotentiel
  }
})

const repartitionStatuts = computed(() => {
  const statuts = ['Envoyé', 'Accepté', 'Refusé', 'Expiré', 'Brouillon']
  const total = tousLesDevis.value.length || 1
  return statuts
    .map(statut => {
      const count = tousLesDevis.value.filter((d: any) => d.fields['Statut'] === statut).length
      return { statut, count, pct: Math.round((count / total) * 100) }
    })
    .filter(s => s.count > 0)
})

const volumeParMois = computed(() => {
  const compteurs = new Map<string, number>()
  for (const d of tousLesDevis.value) {
    const date = d.fields['Date_création']
    if (!date) continue
    const cle = String(date).slice(0, 7)
    compteurs.set(cle, (compteurs.get(cle) ?? 0) + 1)
  }
  const mois = [...compteurs.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const max = Math.max(1, ...mois.map(([, c]) => c))
  return mois.map(([cle, count]) => ({
    mois: cle,
    label: new Date(`${cle}-01`).toLocaleDateString('fr-FR', { month: 'short' }),
    pct: Math.round((count / max) * 100)
  }))
})

function formatPrix(val: unknown): string {
  if (!val) return '0 €'
  return `${Number(val).toLocaleString('fr-FR')} €`
}

function badgeBarClass(statut: string): string {
  if (statut === 'Accepté') return 'bg-green-500'
  if (statut === 'Refusé') return 'bg-red-400'
  if (statut === 'Envoyé') return 'bg-blue-400'
  if (statut === 'Expiré') return 'bg-gray-300'
  return 'bg-gray-200'
}

onMounted(() => {
  init()
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  if (!isAdmin.value) {
    router.push('/dashboard')
    return
  }
  chargerDevis()
})
</script>
