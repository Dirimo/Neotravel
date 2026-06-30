<script setup lang="ts">
import { onMounted } from 'vue'
const { isLoggedIn, isAdmin, init } = useAuth()
const { lang, setLang, t } = useLang()
onMounted(() => init())
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <div class="w-8 h-8 rounded-lg bg-diamond-500 flex items-center justify-center shadow-sm group-hover:bg-diamond-600 transition-colors duration-200">
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
      <div class="flex items-center gap-2">

        <!-- Switcher langue -->
        <div class="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-semibold">
          <button
            @click="setLang('fr')"
            :class="lang === 'fr' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
            class="px-2.5 py-1 rounded-md transition-all"
          >FR</button>
          <button
            @click="setLang('en')"
            :class="lang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'"
            class="px-2.5 py-1 rounded-md transition-all"
          >EN</button>
        </div>

        <!-- Nav -->
        <template v-if="isLoggedIn">
          <NuxtLink v-if="isAdmin" to="/pilotage" class="btn-outline">{{ t('nav.pilotage') }}</NuxtLink>
          <NuxtLink to="/dashboard" class="btn-outline">{{ t('nav.dashboard') }}</NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="btn-outline">{{ t('nav.login') }}</NuxtLink>
        </template>
        <NuxtLink to="/chat" class="btn-primary">{{ t('nav.quote') }}</NuxtLink>
      </div>

    </div>
  </header>
</template>
