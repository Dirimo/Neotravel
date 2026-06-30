<template>
  <div class="ml-11 max-w-lg">
    <article class="relative bg-psf-cream-100 border border-psf-green-900 overflow-hidden flex flex-col group transition-colors duration-300 hover:bg-psf-green-900 hover:text-psf-cream-100">
      
      <!-- Header -->
      <div class="px-6 py-6 border-b border-psf-green-900 group-hover:border-psf-lime-300/30">
        <div class="flex items-center justify-between mb-2">
          <span class="badge bg-psf-pink text-white">Devis NeoTravel</span>
          <span class="font-mono text-xs opacity-70">{{ devis.reference }}</span>
        </div>
        <div class="flex items-end gap-3 mt-4">
          <span class="font-display text-5xl leading-none uppercase">{{ devis.prixTTC.toLocaleString('fr-FR') }} €</span>
          <span class="font-heading text-xl mb-1 text-psf-lime-300 hidden group-hover:inline-block">TTC</span>
          <span class="font-heading text-xl mb-1 text-psf-green-900 group-hover:hidden">TTC</span>
        </div>
        <p class="font-body text-sm mt-3 opacity-90">{{ devis.trajet }}</p>
      </div>

      <!-- Details -->
      <div class="px-6 py-6 space-y-4">
        
        <div class="product-stat border-t border-psf-green-900/20 group-hover:border-psf-lime-300/30 pt-3 flex justify-between items-baseline">
          <span class="text-[11px] uppercase font-bold tracking-widest opacity-80">Départ</span>
          <span class="font-semibold">{{ devis.dateDepart }}</span>
        </div>
        
        <div class="product-stat border-t border-psf-green-900/20 group-hover:border-psf-lime-300/30 pt-3 flex justify-between items-baseline">
          <span class="text-[11px] uppercase font-bold tracking-widest opacity-80">Passagers</span>
          <span class="font-semibold">{{ devis.passagers }} personnes</span>
        </div>

        <div class="product-stat border-t border-psf-green-900/20 group-hover:border-psf-lime-300/30 pt-3 flex justify-between items-baseline">
          <span class="text-[11px] uppercase font-bold tracking-widest opacity-80">Véhicule</span>
          <span class="font-semibold">{{ devis.typeVehicule }}</span>
        </div>

        <!-- Options -->
        <div v-if="devis.options.length" class="flex flex-wrap gap-2 pt-2">
          <span
            v-for="opt in devis.options"
            :key="opt"
            class="badge bg-psf-green-900 text-psf-lime-300 group-hover:bg-psf-lime-300 group-hover:text-psf-green-900"
          >
            {{ opt }}
          </span>
        </div>
        
        <!-- Breakdown -->
        <div class="mt-4 pt-4 border-t border-psf-green-900/20 group-hover:border-psf-lime-300/30 space-y-1 text-sm opacity-80">
          <div class="flex justify-between">
            <span>Prix HT</span>
            <span>{{ devis.prixHT.toLocaleString('fr-FR') }} €</span>
          </div>
          <div class="flex justify-between">
            <span>TVA (10%)</span>
            <span>{{ devis.tva.toLocaleString('fr-FR') }} €</span>
          </div>
        </div>

        <p class="text-[11px] uppercase tracking-widest font-bold mt-4 opacity-70">
          Valable {{ devis.validiteDevis }}
        </p>
      </div>

      <!-- Actions -->
      <div class="px-6 pb-6 mt-auto flex gap-3">
        <button
          @click="$emit('accept', devis)"
          class="button button--dark flex-1 group-hover:bg-psf-lime-300 group-hover:text-psf-green-900"
        >
          Accepter
        </button>
        <button
          @click="$emit('refuse')"
          class="button button--ghost border border-psf-green-900 flex-1 group-hover:border-psf-cream-100 group-hover:text-psf-cream-100"
        >
          Modifier
        </button>
      </div>
    </article>
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
