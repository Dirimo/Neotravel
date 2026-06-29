<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-start justify-center py-12 px-4">
    <div class="w-full max-w-2xl animate-fade-in">

      <!-- Success banner -->
      <div class="flex items-center gap-4 bg-diamond-500 text-white rounded-2xl px-6 py-5 mb-8 shadow-lg">
        <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h2 class="font-bold text-lg">Devis accepté !</h2>
          <p class="text-diamond-100 text-sm">Votre demande de transport est enregistrée. Un conseiller vous contactera sous 24h.</p>
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
              <h1 class="text-2xl font-bold text-gray-900">Devis de transport de groupe</h1>
              <p class="text-gray-400 text-sm mt-1">Émis le {{ today }}</p>
            </div>
            <div class="flex flex-col items-center text-center">
              <span class="text-xs text-gray-400 uppercase tracking-wider">Référence</span>
              <p class="font-mono font-semibold text-gray-900 text-lg">{{ devisRef }}</p>
              <span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;background-color:#f0fdf4;color:#15803d;border:1.5px solid #86efac;border-radius:9999px;padding:4px 14px;margin-top:8px;">
                <span style="width:7px;height:7px;border-radius:50%;background-color:#22c55e;display:inline-block;flex-shrink:0;"></span>
                Accepté
              </span>
            </div>
          </div>
        </div>

        <!-- Trip details -->
        <div class="px-8 py-4 border-b border-gray-100">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Détails du trajet</h3>
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
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Services inclus</h3>
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
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Récapitulatif tarifaire</h3>
          <table class="w-full text-sm">
            <tbody>
              <tr v-for="line in priceLines" :key="line.label" class="border-b border-gray-50">
                <td class="py-2.5 text-gray-600">{{ line.label }}</td>
                <td class="py-2.5 text-right text-gray-900">{{ line.amount }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-200">
                <td class="pt-3 pb-2 font-bold text-gray-900 text-base">Total TTC</td>
                <td class="pt-3 pb-2 text-right font-bold text-diamond-600 text-xl">2 024 €</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Contact info -->
        <div class="px-8 py-4 bg-gray-50">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Votre contact Neotravel</h3>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-diamond-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-diamond-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Équipe commerciale Neotravel</p>
              <p class="text-sm text-gray-500">contact@neotravel.fr · 01 23 45 67 89</p>
              <p class="text-xs text-gray-400 mt-0.5">Disponible du lundi au vendredi, 9h–18h</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 mt-6">
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
          {{ downloading ? 'Génération…' : 'Télécharger PDF' }}
        </button>
        <NuxtLink
          to="/chat"
          class="flex-1 flex items-center justify-center gap-2 bg-diamond-500 hover:bg-diamond-600 text-white rounded-xl py-3 text-sm font-semibold transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Nouvelle demande
        </NuxtLink>
      </div>

      <p class="text-center text-xs text-gray-300 mt-6">
        Ce devis est non contractuel et reste valable 72 heures. Toute modification entraîne une révision tarifaire.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const devisRef = computed(() => route.query.ref || 'NEO-DEMO01')
const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

const tripDetails = [
  {
    label: 'Trajet',
    value: 'Paris (Gare de Lyon) → Lyon (Part-Dieu)',
    icon: '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'
  },
  {
    label: 'Date de départ',
    value: '15 juillet 2025, 08h00',
    icon: '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>'
  },
  {
    label: 'Passagers',
    value: '48 personnes',
    icon: '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'
  },
  {
    label: 'Véhicule',
    value: 'Autocar 53 places',
    icon: '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>'
  },
  {
    label: 'Durée estimée',
    value: '4h30',
    icon: '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  },
  {
    label: 'Saison',
    value: 'Haute saison (+10%)',
    icon: '<svg class="w-4 h-4 text-diamond-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 6.343l-.707-.707m12.728 12.728l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'
  }
]

const services = [
  'Autocar confort 53 places — climatisé, WiFi à bord',
  'Chauffeur professionnel certifié',
  'Guide à bord (journée complète)',
  'Assurance responsabilité civile incluse',
  'Assistance 24h/24 en cas d\'incident'
]

const priceLines = [
  { label: 'Tarif de base (transport)', amount: '1 560 €' },
  { label: 'Majoration haute saison (+10%)', amount: '+156 €' },
  { label: 'Guide à bord', amount: '+80 €' },
  { label: 'Marge commerciale (15%)', amount: '+269 €' },
  { label: 'Sous-total HT', amount: '1 840 €' },
  { label: 'TVA (10%)', amount: '+184 €' }
]

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

