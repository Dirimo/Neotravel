<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4">
    <div class="max-w-4xl mx-auto animate-fade-in">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-display text-psf-green-900 uppercase tracking-widest">Administration</h1>
          <p class="text-sm text-gray-400 mt-1">Gestion des devis et relances</p>
        </div>
        <button @click="handleLogout" class="text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 transition-colors flex items-center gap-1.5 font-bold uppercase tracking-widest">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Déconnexion
        </button>
      </div>

      <!-- Liste des devis -->
      <div class="bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
          <h2 class="font-display text-psf-green-900 text-lg uppercase tracking-widest">Toutes les demandes</h2>
          <button @click="chargerDevis" class="text-xs text-psf-green-900 underline">Rafraîchir</button>
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
        <div v-else-if="devisList.length === 0" class="px-6 py-16 text-center">
          <p class="text-sm text-gray-400">Aucun devis trouvé sur Airtable</p>
        </div>

        <!-- Tableau -->
        <div v-else class="bg-psf-green-900">
          <div
            v-for="d in devisList"
            :key="d.id"
            class="flex items-center justify-between px-6 py-5 border-b-[1.5px] border-psf-lime-300/20 last:border-0 hover:bg-psf-green-800 transition-colors flex-wrap gap-4"
          >
            <div class="flex-1 min-w-[200px]">
              <div class="flex items-center gap-2">
                <p class="font-display uppercase tracking-widest text-psf-lime-300 text-base font-normal">Devis {{ d.fields['Numéro'] ?? d.id.slice(-6).toUpperCase() }}</p>
                <span :class="[
                  'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm',
                  d.fields['Statut'] === 'Accepté' ? 'bg-green-500/20 text-green-300' :
                  d.fields['Statut'] === 'Refusé' ? 'bg-red-500/20 text-red-300' :
                  'bg-psf-lime-300/20 text-psf-lime-300'
                ]">{{ d.fields['Statut'] ?? 'Envoyé' }}</span>
              </div>
              <p class="uppercase tracking-widest text-psf-lime-300/80 font-normal text-[10px] mt-1">
                Client : {{ d.fields['Utilisateurs'] ?? 'Inconnu' }} · 
                Créé le : {{ d.fields['Date_création'] ?? '—' }}
              </p>
            </div>

            <div class="flex items-center gap-6">
              <span class="font-display tracking-tight text-xl text-white font-normal">{{ formatPrix(d.fields['Prix_TTC']) }}</span>

              <div class="flex gap-2">
                <button @click="voirDevis(d)" class="uppercase font-bold tracking-widest text-[10px] border-[1.5px] border-psf-lime-300 text-psf-lime-300 hover:bg-psf-lime-300 hover:text-psf-green-900 px-3 py-1.5 transition-colors">
                  PDF
                </button>
                <div class="flex gap-2" v-if="d.fields['Statut'] === 'Envoyé' || !d.fields['Statut']">
                  <button 
                    @click="changerStatut(d.id, 'Accepté')" 
                    class="uppercase font-bold tracking-widest text-[10px] bg-green-600 text-white hover:bg-green-500 px-3 py-1.5 transition-colors disabled:opacity-50"
                    :disabled="updating === d.id"
                  >
                    Accepter
                  </button>
                  <button 
                    @click="changerStatut(d.id, 'Refusé')" 
                    class="uppercase font-bold tracking-widest text-[10px] bg-red-600 text-white hover:bg-red-500 px-3 py-1.5 transition-colors disabled:opacity-50"
                    :disabled="updating === d.id"
                  >
                    Refuser
                  </button>
                </div>
              </div>
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

const { adminToken, isAdminLoggedIn, adminLogout, initAdmin } = useAdminAuth()
const router = useRouter()

const devisList = ref<any[]>([])
const loading = ref(true)
const erreur = ref('')
const updating = ref<string | null>(null)

async function chargerDevis() {
  if (!adminToken.value) { loading.value = false; return }
  loading.value = true
  erreur.value = ''
  try {
    const res = await fetch('http://localhost:3001/admin/devis', {
      headers: { Authorization: `Bearer ${adminToken.value}` }
    })
    const data = await res.json()
    if (res.ok) {
      // Sort by newest first based on Date_création
      devisList.value = data.devis.sort((a: any, b: any) => {
        const dateA = new Date(a.fields['Date_création'] ?? 0).getTime()
        const dateB = new Date(b.fields['Date_création'] ?? 0).getTime()
        return dateB - dateA
      })
    } else {
      erreur.value = data.error ?? 'Erreur lors du chargement des devis'
      if (res.status === 401 || res.status === 403) handleLogout()
    }
  } catch { 
    erreur.value = 'Erreur réseau. Le backend est-il démarré ?'
  } finally {
    loading.value = false
  }
}

async function changerStatut(id: string, statut: string) {
  if (!adminToken.value) return
  updating.value = id
  try {
    const res = await fetch('http://localhost:3001/admin/devis', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken.value}` 
      },
      body: JSON.stringify({ id, statut })
    })
    if (res.ok) {
      // Update local state directly to avoid refetching everything
      const devis = devisList.value.find(d => d.id === id)
      if (devis) devis.fields['Statut'] = statut
    } else {
      alert('Erreur lors de la mise à jour du statut')
    }
  } catch {
    alert('Erreur de connexion au serveur')
  } finally {
    updating.value = null
  }
}

function handleLogout() {
  adminLogout()
  router.push('/admin/login')
}

function voirDevis(d: any) {
  const reference = `NEO-${d.id.slice(-6).toUpperCase()}`
  const dateDepart = d.fields['Date_création'] ?? '—'
  const prixHT = Number(d.fields['Prix_HT'] ?? 0)
  const tva = Number(d.fields['TVA'] ?? 0)
  const prixTTC = Number(d.fields['Prix_TTC'] ?? 0)

  sessionStorage.setItem('neotravel_devis', JSON.stringify({
    reference,
    trajet: '—',
    dateDepart,
    passagers: 0,
    typeVehicule: '—',
    prixHT,
    tva,
    prixTTC,
    duree: '—'
  }))
  router.push(`/devis?ref=${reference}&admin=true`)
}

function formatPrix(val: unknown): string {
  if (!val) return '—'
  return `${Number(val).toLocaleString('fr-FR')} €`
}

onMounted(() => {
  initAdmin()
  if (!isAdminLoggedIn.value) {
    router.push('/admin/login')
    return
  }
  chargerDevis()
})
</script>
