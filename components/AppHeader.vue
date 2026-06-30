<script setup lang="ts">
const { isLoggedIn, init } = useAuth()
const route = useRoute()
const isAdminView = computed(() => route.path.startsWith('/admin') || route.query.admin === 'true')

onMounted(() => init())
</script>

<template>
  <header class="sticky top-0 z-50 h-[84px] bg-psf-green-900 text-psf-lime-300 border-b border-psf-lime-300/20">
    <div class="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between gap-8">
      <!-- Logo -->
      <NuxtLink :to="isLoggedIn ? '/dashboard' : '/'" class="flex items-center gap-2.5 group no-underline text-inherit">
        <span class="font-display uppercase text-3xl sm:text-4xl tracking-tighter leading-none hover:opacity-90">Neotravel</span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="flex items-center gap-6">
        <template v-if="isAdminView">
          <!-- Pas de liens pour l'admin, pour garder l'interface épurée -->
        </template>
        <template v-else-if="isLoggedIn">
          <NuxtLink to="/dashboard" class="nav-link font-display uppercase tracking-widest text-base font-normal">Mon espace</NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="nav-link font-display uppercase tracking-widest text-base font-normal">Connexion</NuxtLink>
          <NuxtLink to="/chat" class="button button--lime ml-2">
            Nouvelle demande
          </NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template>
