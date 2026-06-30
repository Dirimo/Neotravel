<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4">
    <div class="max-w-3xl mx-auto animate-fade-in">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-display text-psf-green-900 uppercase tracking-widest">Mon espace</h1>
          <p class="text-sm text-gray-400 mt-1">{{ userEmail }}</p>
        </div>
        <button @click="handleLogout" class="text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 transition-colors flex items-center gap-1.5 font-bold uppercase tracking-widest">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Déconnexion
        </button>
      </div>

      <!-- Actions rapides -->
      <div class="mb-8">
        <NuxtLink to="/chat" class="button button--dark mt-2">
          Nouvelle demande
        </NuxtLink>
      </div>

      <!-- Liste des devis -->
      <div class="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50">
          <h2 class="font-display text-psf-green-900 text-lg uppercase tracking-widest">Historique des devis</h2>
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
          <div class="w-12 h-12 bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="text-sm text-gray-400">Aucun devis pour l'instant</p>
          <NuxtLink to="/chat" class="text-psf-green-900 text-sm font-medium hover:text-psf-green-800 mt-1 inline-block">
            Créer un devis →
          </NuxtLink>
        </div>

        <!-- Tableau -->
        <div v-else class="bg-psf-green-900">
          <div
            v-for="d in tousLesDevis"
            :key="d.id"
            class="flex items-center justify-between px-6 py-5 border-b-[1.5px] border-psf-lime-300/20 last:border-0 hover:bg-psf-green-800 transition-colors"
          >
            <div>
              <p class="font-display uppercase tracking-widest text-psf-lime-300 text-base font-normal">{{ d.trajet !== '—' ? d.trajet : d.reference }}</p>
              <p class="uppercase tracking-widest text-psf-lime-300/80 font-normal text-[10px] mt-1">{{ d.dateDepart }} · {{ d.passagers > 0 ? d.passagers + ' pers.' : '' }}</p>
            </div>
            <div class="flex items-center gap-6">
              <span class="font-display tracking-tight text-xl text-white font-normal">{{ formatPrix(d.prixTTC) }}</span>

              <button @click="voirDevis(d)" class="uppercase font-bold tracking-widest text-[10px] border-[1.5px] border-psf-lime-300 text-psf-lime-300 hover:bg-psf-lime-300 hover:text-psf-green-900 px-3 py-1.5 transition-colors">
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
    dateDepart: d.fields['Date_création'] ?? '—',
    passagers: 0,
    prixTTC: d.fields['Prix_TTC'] ?? 0,
    statut: d.fields['Statut'] ?? 'Envoyé',
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
    const prixHT = Number(d.raw.fields['Prix_HT'] ?? 0)
    const tva = Number(d.raw.fields['TVA'] ?? 0)
    const prixTTC = Number(d.raw.fields['Prix_TTC'] ?? 0)
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



onMounted(() => {
  init()
  if (!isLoggedIn.value) {
    router.push('/login')
    return
  }
  chargerDevis()
})
</script>
