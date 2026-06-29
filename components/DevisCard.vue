<template>
  <div class="ml-11 max-w-lg">
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-diamond-500 to-diamond-600 px-6 py-5 text-white">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-diamond-100 uppercase tracking-wider">Devis Neotravel</span>
          <span class="text-xs bg-white/20 rounded-full px-2.5 py-0.5 font-mono">{{ devis.reference }}</span>
        </div>
        <div class="flex items-end gap-3">
          <span class="text-3xl font-bold">{{ devis.prixTTC.toLocaleString('fr-FR') }} €</span>
          <span class="text-diamond-200 text-sm mb-0.5">TTC</span>
        </div>
        <p class="text-diamond-100 text-sm mt-1">{{ devis.trajet }}</p>
      </div>

      <!-- Details -->
      <div class="px-6 py-5 space-y-3">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex items-center gap-2 text-gray-600">
            <svg class="w-4 h-4 text-diamond-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {{ devis.dateDepart }}
          </div>
          <div class="flex items-center gap-2 text-gray-600">
            <svg class="w-4 h-4 text-diamond-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Durée : {{ devis.duree }}
          </div>
          <div class="flex items-center gap-2 text-gray-600">
            <svg class="w-4 h-4 text-diamond-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ devis.passagers }} passagers
          </div>
          <div class="flex items-center gap-2 text-gray-600">
            <svg class="w-4 h-4 text-diamond-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
            {{ devis.typeVehicule }}
          </div>
        </div>

        <!-- Options -->
        <div v-if="devis.options.length" class="flex flex-wrap gap-1.5 pt-1">
          <span
            v-for="opt in devis.options"
            :key="opt"
            class="text-xs px-2.5 py-1 rounded-full bg-diamond-50 text-diamond-700 border border-diamond-100"
          >
            {{ opt }}
          </span>
        </div>

        <!-- Price breakdown -->
        <div class="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
          <div class="flex justify-between text-gray-500">
            <span>Prix HT</span>
            <span>{{ devis.prixHT.toLocaleString('fr-FR') }} €</span>
          </div>
          <div class="flex justify-between text-gray-500">
            <span>TVA (10%)</span>
            <span>{{ devis.tva.toLocaleString('fr-FR') }} €</span>
          </div>
          <div class="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-1.5">
            <span>Total TTC</span>
            <span class="text-diamond-600">{{ devis.prixTTC.toLocaleString('fr-FR') }} €</span>
          </div>
        </div>

        <p class="text-xs text-gray-400 flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Ce devis est valable {{ devis.validiteDevis }}.
        </p>
      </div>

      <!-- Actions -->
      <div class="px-6 pb-5 flex gap-3">
        <button
          @click="$emit('accept', devis)"
          class="flex-1 bg-diamond-500 hover:bg-diamond-600 text-white font-semibold text-sm rounded-xl py-3 transition-colors duration-150"
        >
          Accepter ce devis
        </button>
        <button
          @click="$emit('refuse')"
          class="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-medium text-sm rounded-xl py-3 transition-colors duration-150 hover:bg-gray-50"
        >
          Modifier
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DevisData {
  reference: string
  trajet: string
  dateDepart: string
  passagers: number
  typeVehicule: string
  prixHT: number
  tva: number
  prixTTC: number
  duree: string
  options: string[]
  validiteDevis: string
}

defineProps<{ devis: DevisData }>()
defineEmits<{
  (e: 'accept', devis: DevisData): void
  (e: 'refuse'): void
}>()
</script>
