<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-start justify-center py-12 px-4">
    <div class="w-full max-w-2xl animate-fade-in">

      <!-- Banner dynamique selon la réponse du client -->
      <div v-if="reponse === 'Accepté'" class="flex items-center gap-4 bg-diamond-500 text-white rounded-2xl px-6 py-5 mb-8 shadow-lg">
        <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h2 class="font-bold text-lg">{{ t('devis.accepted') }}</h2>
          <p class="text-diamond-100 text-sm">{{ t('devis.accepted.sub') }}</p>
        </div>
      </div>

      <div v-else-if="reponse === 'Refusé'" class="flex items-center gap-4 bg-gray-700 text-white rounded-2xl px-6 py-5 mb-8 shadow-lg">
        <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h2 class="font-bold text-lg">{{ t('devis.refused') }}</h2>
          <p class="text-gray-300 text-sm">{{ t('devis.refused.sub') }}</p>
        </div>
      </div>

      <div v-else class="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-6 py-5 mb-8 shadow-sm">
        <div class="w-12 h-12 rounded-full bg-diamond-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <h2 class="font-bold text-lg text-gray-900">{{ t('devis.pending') }}</h2>
          <p class="text-gray-400 text-sm">{{ t('devis.pending.sub') }}</p>
        </div>
      </div>

      <!-- Main devis document -->
      <div id="devis-document" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Document header -->
        <div class="px-8 py-5 border-b border-gray-100">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-diamond-500 flex items-center justify-center">
                  <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none">
                    <path d="M0 17 C3 13 7 8 13 4 L20 7 C13 11 8 16 5 20 Z" fill="white" opacity="0.2"/>
                    <path d="M0 17 C3 13 7 8 13 4" stroke="white" stroke-width="1.2" fill="none" opacity="0.85"/>
                    <path d="M5 20 C8 16 13 11 20 7" stroke="white" stroke-width="1.2" fill="none" opacity="0.85"/>
                    <path d="M2.5 18.5 C5.5 14.5 9.5 9.5 16.5 5.5" stroke="white" stroke-width="0.85" stroke-dasharray="2.5 2" fill="none" opacity="1"/>
                  </svg>
                </div>
                <span class="font-bold text-gray-900 text-lg">Neotravel</span>
              </div>
              <h1 class="text-2xl font-bold text-gray-900">{{ t('devis.title') }}</h1>
              <p class="text-gray-400 text-sm mt-1">{{ t('devis.emitted') }} {{ today }}</p>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;text-align:center;">
              <span style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">{{ t('devis.ref') }}</span>
              <p style="font-family:monospace;font-weight:700;color:#111827;font-size:17px;margin:4px 0 0 0;">{{ devisRef }}</p>
              <span v-if="reponse === 'Accepté'" style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;background-color:#f0fdf4;color:#15803d;border:1.5px solid #86efac;border-radius:16px;padding:5px 14px;">
                <span style="width:7px;height:7px;border-radius:50%;background-color:#22c55e;display:block;"></span>
                Accepté
              </span>
              <span v-else-if="reponse === 'Refusé'" style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;background-color:#f9fafb;color:#6b7280;border:1.5px solid #e5e7eb;border-radius:16px;padding:5px 14px;">
                <span style="width:7px;height:7px;border-radius:50%;background-color:#9ca3af;display:block;"></span>
                Refusé
              </span>
              <span v-else style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;background-color:#eff6ff;color:#2563eb;border:1.5px solid #bfdbfe;border-radius:16px;padding:5px 14px;">
                <span style="width:7px;height:7px;border-radius:50%;background-color:#3b82f6;display:block;"></span>
                En attente
              </span>
            </div>
          </div>
        </div>

        <!-- Trip details -->
        <div class="px-8 py-4 border-b border-gray-100">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{{ t('devis.trip') }}</h3>
          <div class="grid sm:grid-cols-2 gap-4">
            <div v-for="detail in tripDetails" :key="detail.label" class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5" v-html="detail.icon"></div>
              <div>
                <p class="text-xs text-gray-400">{{ detail.label }}</p>
                <p class="text-sm font-medium text-gray-900">{{ detail.value }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Services -->
        <div class="px-8 py-4 border-b border-gray-100">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{{ t('devis.services') }}</h3>
          <div class="space-y-2">
            <div v-for="service in services" :key="service" class="flex items-center gap-2 text-sm text-gray-700">
              <svg class="w-4 h-4 text-diamond-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              {{ service }}
            </div>
          </div>
        </div>

        <!-- Price table -->
        <div class="px-8 py-4 border-b border-gray-100">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{{ t('devis.pricing') }}</h3>
          <table class="w-full text-sm">
            <tbody>
              <tr v-for="line in priceLines" :key="line.label" class="border-b border-gray-50">
                <td class="py-2.5 text-gray-600">{{ line.label }}</td>
                <td class="py-2.5 text-right text-gray-900">{{ line.amount }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200">
                <td class="pt-3 pb-2 font-bold text-gray-900 text-base">{{ t('devis.total') }}</td>
                <td class="pt-3 pb-2 text-right font-bold text-diamond-600 text-xl">{{ totalTTC }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Contact info -->
        <div class="px-8 py-4 bg-gray-50">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">{{ t('devis.contact') }}</h3>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-diamond-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-diamond-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ t('devis.team') }}</p>
              <p class="text-sm text-gray-500">contact@neotravel.fr · 01 23 45 67 89</p>
              <p class="text-xs text-gray-400 mt-0.5">Disponible du lundi au vendredi, 9h–18h</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions client : Accepter / Refuser -->
      <div v-if="!reponse" class="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          @click="repondreDevis('Refusé')"
          :disabled="enCours"
          class="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          {{ t('devis.btn.refuse') }}
        </button>
        <button
          @click="repondreDevis('Accepté')"
          :disabled="enCours"
          class="flex-1 flex items-center justify-center gap-2 bg-diamond-500 hover:bg-diamond-600 text-white rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <svg v-if="!enCours" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ t('devis.btn.accept') }}
        </button>
      </div>

      <!-- Message d'erreur réponse -->
      <p v-if="erreurReponse" class="mt-3 text-xs text-red-500 text-center">{{ erreurReponse }}</p>

      <!-- Actions secondaires (PDF + nouvelle demande) -->
      <div class="flex flex-col sm:flex-row gap-3 mt-3">
        <button
          @click="downloadPDF"
          :disabled="downloading"
          class="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg v-if="!downloading" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3"/>
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ downloading ? '…' : t('devis.download') }}
        </button>
        <NuxtLink
          to="/chat"
          class="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {{ t('devis.new') }}
        </NuxtLink>
      </div>

      <p class="text-center text-xs text-gray-300 mt-6">{{ t('devis.legal') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
definePageMeta({ layout: 'default', ssr: false })
const { t } = useLang()

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
const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const d = ref<StoredDevis | null>(null)
onMounted(() => {
  const raw = sessionStorage.getItem('neotravel_devis')
  if (raw) d.value = JSON.parse(raw)
})

const iconTrajet = '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'
const iconDate = '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>'
const iconPassagers = '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'
const iconVehicule = '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>'
const iconDuree = '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'

const tripDetails = computed(() => [
  { label: t('devis.label.trajet'),   value: d.value?.trajet ?? 'Paris → Lyon', icon: iconTrajet },
  { label: t('devis.label.date'),     value: d.value?.dateDepart ?? '—', icon: iconDate },
  { label: t('devis.label.pax'),      value: d.value ? `${d.value.passagers} ${t('devis.label.pax.unit')}` : '—', icon: iconPassagers },
  { label: t('devis.label.vehicle'),  value: d.value?.typeVehicule ?? '—', icon: iconVehicule },
  { label: t('devis.label.duration'), value: d.value?.duree ?? '—', icon: iconDuree },
])

const services = computed(() => [
  t('devis.svc.driver'),
  t('devis.svc.insur'),
  t('devis.svc.assist'),
])

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

const reponse = ref<'Accepté' | 'Refusé' | null>(null)
const enCours = ref(false)
const erreurReponse = ref('')

async function repondreDevis(statut: 'Accepté' | 'Refusé') {
  enCours.value = true
  erreurReponse.value = ''
  const ref = String(devisRef.value)
  console.log('[devis] repondreDevis', statut, 'référence:', ref)
  try {
    const res = await fetch('http://localhost:3001/devis/reponse', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: ref, statut })
    })
    const data = await res.json()
    console.log('[devis] réponse backend', res.status, data)
    if (res.ok) {
      reponse.value = statut
    } else {
      erreurReponse.value = data.error ?? `Erreur ${res.status}`
    }
  } catch (e) {
    console.error('[devis] erreur fetch', e)
    erreurReponse.value = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
  } finally {
    enCours.value = false
  }
}

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

