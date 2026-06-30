<script setup lang="ts">
const { isLoggedIn, init } = useAuth()
onMounted(() => init())
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <div class="w-8 h-8 rounded-lg bg-diamond-500 flex items-center justify-center shadow-sm group-hover:bg-diamond-600 transition-colors duration-200">
          <!-- Route sinueuse bas-gauche → haut-droite -->
          <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none">
            <path d="M0 17 C3 13 7 8 13 4 L20 7 C13 11 8 16 5 20 Z" fill="white" opacity="0.2"/>
            <path d="M0 17 C3 13 7 8 13 4" stroke="white" stroke-width="1.2" fill="none" opacity="0.85"/>
            <path d="M5 20 C8 16 13 11 20 7" stroke="white" stroke-width="1.2" fill="none" opacity="0.85"/>
            <path d="M2.5 18.5 C5.5 14.5 9.5 9.5 16.5 5.5" stroke="white" stroke-width="0.85" stroke-dasharray="2.5 2" fill="none" opacity="1"/>
          </svg>
        </div>
        <span class="font-semibold text-gray-900 text-lg tracking-tight">Neotravel</span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="flex items-center gap-3">
        <template v-if="isLoggedIn">
          <NuxtLink to="/dashboard" class="btn-outline">Mon espace</NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="btn-outline">Connexion</NuxtLink>
        </template>
        <NuxtLink to="/chat" class="btn-primary">
          Obtenir un devis
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
