<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-start justify-center py-12 px-4">
    <div class="w-full max-w-2xl animate-fade-in">

      <!-- Success banner -->
      <div v-if="!isAdminView" class="bg-psf-lime-300 text-psf-green-900 border-[1.5px] border-psf-green-900 px-6 py-5 mb-8 rounded-none shadow-sm">
        <div>
          <h2 class="font-display uppercase tracking-widest text-lg font-bold">Devis accepté !</h2>
          <p class="text-psf-green-900/80 font-medium text-sm mt-1">Votre demande de transport est enregistrée. Un conseiller vous contactera sous 24h.</p>
        </div>
      </div>

      <!-- Main devis document -->
      <div id="devis-document" class="bg-white border-[1.5px] border-psf-green-900 rounded-none overflow-hidden">

        <!-- Document header -->
        <div class="px-8 py-6 border-b-[1.5px] border-psf-green-900">
          <div class="flex items-start justify-between">
            <div>
              <div class="mb-4">
                <span class="font-display uppercase text-2xl tracking-tighter text-psf-green-900 leading-none">Neotravel</span>
              </div>
              <h1 class="text-2xl font-display text-psf-green-900 uppercase tracking-widest">Devis de transport de groupe</h1>
              <p class="text-gray-400 text-sm mt-1">Émis le {{ today }}</p>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;text-align:center;">
              <span style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Référence</span>
              <p style="font-family:monospace;font-weight:700;color:#111827;font-size:17px;margin:4px 0 0 0;">{{ devisRef }}</p>
            </div>
          </div>
        </div>

        <!-- Trip details -->
        <div class="px-8 py-6 border-b-[1.5px] border-psf-green-900">
          <h3 class="text-xs font-bold text-psf-green-900 uppercase tracking-widest mb-6">Détails du trajet</h3>
          <div class="grid sm:grid-cols-2 gap-6">
            <div v-for="detail in tripDetails" :key="detail.label">
              <p class="text-xs text-psf-green-900/60 uppercase tracking-widest font-bold">{{ detail.label }}</p>
              <p class="text-sm font-bold text-psf-green-900 uppercase mt-1">{{ detail.value }}</p>
            </div>
          </div>
        </div>

        <!-- Services -->
        <div v-if="!isAdminView" class="px-8 py-6 border-b-[1.5px] border-psf-green-900">
          <h3 class="text-xs font-bold text-psf-green-900 uppercase tracking-widest mb-6">Services inclus</h3>
          <div class="space-y-3">
            <div v-for="service in services" :key="service" class="flex items-center gap-3 text-sm font-medium text-psf-green-900 uppercase">
              <span class="w-2 h-2 bg-psf-lime-300 border border-psf-green-900 block flex-shrink-0"></span>
              {{ service }}
            </div>
          </div>
        </div>

        <!-- Price table -->
        <div class="px-8 py-6 border-b-[1.5px] border-psf-green-900">
          <h3 class="text-xs font-bold text-psf-green-900 uppercase tracking-widest mb-6">Récapitulatif tarifaire</h3>
          <table class="w-full text-sm font-medium">
            <tbody>
              <tr v-for="line in priceLines" :key="line.label" class="border-b border-psf-green-900/10">
                <td class="py-3 text-psf-green-900/70">{{ line.label }}</td>
                <td class="py-3 text-right text-psf-green-900">{{ line.amount }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-[1.5px] border-psf-green-900">
                <td class="pt-4 pb-2 font-bold text-psf-green-900 text-base uppercase tracking-widest">Total TTC</td>
                <td class="pt-4 pb-2 text-right font-display text-psf-green-900 text-2xl tracking-tight">{{ totalTTC }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Contact info -->
        <div v-if="!isAdminView" class="px-8 py-6 bg-psf-lime-300">
          <h3 class="text-xs font-bold text-psf-green-900 uppercase tracking-widest mb-4">Votre contact Neotravel</h3>
          <div class="flex items-center gap-4">
            <div>
              <p class="font-bold uppercase tracking-widest text-psf-green-900">Équipe commerciale Neotravel</p>
              <p class="text-sm font-medium text-psf-green-900/80 mt-1">contact@neotravel.fr · 01 23 45 67 89</p>
              <p class="text-xs text-psf-green-900/60 mt-0.5 uppercase tracking-wide">Disponible du lundi au vendredi, 9h–18h</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          @click="downloadPDF"
          :disabled="downloading"
          class="flex-1 button button--ghost border-psf-green-900 hover:bg-psf-green-900 hover:text-psf-cream-100 disabled:opacity-50"
        >
          {{ downloading ? 'GÉNÉRATION…' : 'TÉLÉCHARGER PDF' }}
        </button>
        <NuxtLink
          v-if="!isAdminView"
          to="/chat"
          class="flex-1 button button--dark"
        >
          NOUVELLE DEMANDE
        </NuxtLink>
      </div>

      <p v-if="!isAdminView" class="text-center text-xs text-gray-300 mt-6">
        Ce devis est non contractuel et reste valable 72 heures. Toute modification entraîne une révision tarifaire.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
definePageMeta({ layout: 'default', ssr: false })

interface StoredDevis {
  reference: string
  trajet: string
  dateDepart: string
  passagers: number
  typeVehicule: string
  prixHT: number
  tva: number
  prixTTC: number
  duree: string
  details?: Array<{ label: string; montant: number }>
}

const route = useRoute()
const devisRef = computed(() => route.query.ref || 'NEO-DEMO01')
const isAdminView = computed(() => route.query.admin === 'true')
const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const d = ref<StoredDevis | null>(null)
onMounted(() => {
  const raw = sessionStorage.getItem('neotravel_devis')
  if (raw) d.value = JSON.parse(raw)
})

const tripDetails = computed(() => [
  { label: 'Trajet', value: d.value?.trajet ?? 'Paris → Lyon' },
  { label: 'Date de départ', value: d.value?.dateDepart ?? '—' },
  { label: 'Passagers', value: d.value ? `${d.value.passagers} personnes` : '—' },
  { label: 'Véhicule', value: d.value?.typeVehicule ?? '—' },
  { label: 'Durée estimée', value: d.value?.duree ?? '—' },
])

const services = [
  'Chauffeur professionnel certifié',
  'Assurance responsabilité civile incluse',
  'Assistance 24h/24 en cas d\'incident'
]

const priceLines = computed(() => {
  if (d.value?.details?.length) {
    return d.value.details
      .filter(l => !['Prix TTC'].includes(l.label))
      .map(l => ({ label: l.label, amount: `${l.montant.toLocaleString('fr-FR')} €` }))
  }
  if (d.value) return [
    { label: 'Prix HT', amount: `${d.value.prixHT.toLocaleString('fr-FR')} €` },
    { label: 'TVA (10%)', amount: `+${d.value.tva.toLocaleString('fr-FR')} €` },
  ]
  return [
    { label: 'Tarif de base (transport)', amount: '1 560 €' },
    { label: 'Marge commerciale (15%)', amount: '+276 €' },
    { label: 'Sous-total HT', amount: '1 836 €' },
    { label: 'TVA (10%)', amount: '+184 €' },
  ]
})

const totalTTC = computed(() =>
  d.value ? `${d.value.prixTTC.toLocaleString('fr-FR')} €` : '2 020 €'
)

const downloading = ref(false)

async function downloadPDF() {
  downloading.value = true
  const html2pdf = (await import('html2pdf.js')).default
  const element = document.getElementById('devis-document')
  await html2pdf().set({
    margin: [8, 10, 8, 10],
    filename: `devis-${devisRef.value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 1.6, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: 'avoid-all' }
  }).from(element).save()
  downloading.value = false
}
</script>

