<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4">
    <div class="max-w-3xl mx-auto animate-fade-in">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mon espace</h1>
          <p class="text-sm text-gray-400 mt-1">{{ userEmail }}</p>
        </div>
        <button @click="handleLogout" class="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Déconnexion
        </button>
      </div>

      <!-- Actions rapides -->
      <div class="grid sm:grid-cols-2 gap-4 mb-8">
        <NuxtLink to="/chat" class="flex items-center gap-4 bg-diamond-500 hover:bg-diamond-600 text-white rounded-2xl px-6 py-5 transition-colors shadow-sm">
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-sm">Nouvelle demande</p>
            <p class="text-diamond-100 text-xs mt-0.5">Obtenir un devis en 2 minutes</p>
          </div>
        </NuxtLink>
        <div class="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
          <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <p class="font-semibold text-sm text-gray-900">{{ tousLesDevis.length }} devis</p>
            <p class="text-gray-400 text-xs mt-0.5">dans votre historique</p>
          </div>
        </div>
      </div>

      <!-- Liste des devis -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50">
          <h2 class="font-semibold text-gray-900 text-sm">Historique des devis</h2>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="flex items-center justify-center py-16 text-gray-300">
          <svg class="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <span class="text-sm">Chargement…</span>
        </div>

        <!-- Erreur -->
        <div v-else-if="erreur" class="px-6 py-8 text-center text-sm text-red-400">
          {{ erreur }}
        </div>

        <!-- Vide -->
        <div v-else-if="tousLesDevis.length === 0" class="px-6 py-16 text-center">
          <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="text-sm text-gray-400">Aucun devis pour l'instant</p>
          <NuxtLink to="/chat" class="text-diamond-600 text-sm font-medium hover:text-diamond-700 mt-1 inline-block">
            Faire une demande →
          </NuxtLink>
        </div>

        <!-- Tableau -->
        <div v-else>
          <div
            v-for="d in tousLesDevis"
            :key="d.id"
            class="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div class="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ d.trajet !== '—' ? d.trajet : d.reference }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ d.dateDepart }} · {{ d.passagers > 0 ? d.passagers + ' pers.' : '' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-semibold text-sm text-gray-900">{{ formatPrix(d.prixTTC) }}</span>
              <span :class="badgeClass(d.statut)" class="text-xs font-medium px-2.5 py-1 rounded-full">
                {{ d.statut }}
              </span>
              <button @click="voirDevis(d)" class="text-xs text-diamond-600 hover:text-diamond-700 font-medium flex items-center gap-1 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3"/>
                </svg>
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
definePageMeta({ layout: 'default', ssr: false })

const { userEmail, token, isLoggedIn, logout, init } = useAuth()
const router = useRouter()

const devis = ref<any[]>([])
const historiqueLocal = ref<any[]>([])
const loading = ref(true)
const erreur = ref('')

async function chargerDevis() {
  const raw = localStorage.getItem('neotravel_history')
  if (raw) {
    try { historiqueLocal.value = JSON.parse(raw) } catch { /* ignore */ }
  }

  if (!token.value) { loading.value = false; return }
  try {
    const res = await fetch('http://localhost:3001/devis/history', {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    const data = await res.json()
    if (res.ok) devis.value = data.devis
  } catch { /* silencieux si backend indisponible */ } finally {
    loading.value = false
  }
}

const tousLesDevis = computed(() => {
  const airtable = devis.value.map((d: any) => ({
    id: d.id,
    source: 'airtable',
    reference: `NEO-${d.id.slice(-6).toUpperCase()}`,
    trajet: '—',
    dateDepart: d.fields['date création'] ?? d.fields['Date création'] ?? '—',
    passagers: 0,
    prixTTC: d.fields['prix TTC'] ?? d.fields['Prix_TTC'] ?? 0,
    statut: d.fields['statut'] ?? d.fields['Statut'] ?? 'Brouillon',
    raw: d
  }))
  const local = historiqueLocal.value.map((d: any, i: number) => ({
    id: d.reference ?? `local-${i}`,
    source: 'local',
    reference: d.reference,
    trajet: d.trajet,
    dateDepart: d.dateDepart,
    passagers: d.passagers,
    prixTTC: d.prixTTC,
    statut: 'Envoyé',
    raw: d
  }))
  const refs = new Set(airtable.map(d => d.reference))
  const localUniques = local.filter(d => !refs.has(d.reference))
  return [...airtable, ...localUniques]
})

function handleLogout() {
  logout()
  router.push('/')
}

function voirDevis(d: any) {
  if (d.source === 'local') {
    sessionStorage.setItem('neotravel_devis', JSON.stringify(d.raw))
    router.push(`/devis?ref=${d.reference}`)
  } else {
    const prixHT = Number(d.raw.fields['prix HT'] ?? d.raw.fields['Prix_HT'] ?? 0)
    const tva = Number(d.raw.fields['tva'] ?? d.raw.fields['TVA'] ?? 0)
    const prixTTC = Number(d.raw.fields['prix TTC'] ?? d.raw.fields['Prix_TTC'] ?? 0)
    sessionStorage.setItem('neotravel_devis', JSON.stringify({
      reference: d.reference,
      trajet: '—',
      dateDepart: d.dateDepart,
      passagers: 0,
      typeVehicule: '—',
      prixHT,
      tva,
      prixTTC,
      duree: '—'
    }))
    router.push(`/devis?ref=${d.reference}`)
  }
}

function formatDate(val: unknown): string {
  if (!val) return '—'
  return new Date(String(val)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPrix(val: unknown): string {
  if (!val) return '—'
  return `${Number(val).toLocaleString('fr-FR')} €`
}

function badgeClass(statut: unknown): string {
  const s = String(statut ?? '')
  if (s === 'Accepté') return 'bg-green-50 text-green-700 border border-green-100'
  if (s === 'Refusé') return 'bg-red-50 text-red-600 border border-red-100'
  if (s === 'Envoyé') return 'bg-blue-50 text-blue-600 border border-blue-100'
  if (s === 'Expiré') return 'bg-gray-100 text-gray-400 border border-gray-200'
  return 'bg-gray-50 text-gray-500 border border-gray-100'
}

onMounted(() => {
  init()
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  chargerDevis()
})
</script>
