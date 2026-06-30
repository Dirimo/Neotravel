<template>
  <div>
    <!-- Hero Section -->
    <section class="relative min-h-[calc(100vh-84px)] bg-psf-green-900 text-psf-lime-300 overflow-hidden grid place-items-center">
      <img
        src="/images/autocar.jpg"
        alt="Autocar Neotravel"
        class="absolute inset-0 w-full h-full object-cover opacity-75 contrast-105 saturate-110"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-psf-green-900/40 to-psf-green-900/80"></div>
      
      <div class="relative z-10 w-full max-w-[1320px] mx-auto px-6 text-center">
        <p class="kicker mb-6 text-psf-lime-300">Nouveau Service</p>
        <h1 class="display-title !tracking-widest !leading-[1.1] mt-8 mb-12">
          Transport<br>
          De Groupe
        </h1>
        <p class="mt-8 mx-auto max-w-[620px] text-psf-cream-100 text-lg sm:text-xl">
          Une solution moderne pour réserver votre autocar. Devis instantané, sans engagement et avec une qualité de service irréprochable.
        </p>
        <div class="mt-12">
          <NuxtLink to="/chat" class="button button--lime text-lg px-12 py-4">
            Démarrer
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Editorial Block (replaces How it Works / Advantages) -->
    <section class="relative bg-psf-green-900 text-psf-lime-300 min-h-[78vh] grid place-items-center overflow-hidden">
      <!-- Background pattern or subtle texture could go here -->
      <div class="relative z-10 w-full max-w-[980px] mx-auto px-6 text-center py-24">
        <h2 class="mb-8">L'Expérience<br>Neotravel</h2>
        <p class="text-psf-cream-100 text-xl sm:text-2xl max-w-[760px] mx-auto leading-relaxed">
          Oubliez les attentes interminables et les devis obscurs. Notre moteur intelligent analyse instantanément la distance, la saisonnalité et la capacité pour vous offrir le meilleur tarif. Transparent, rapide et fiable.
        </p>
        <div class="mt-12">
          <NuxtLink to="/chat" class="button button--ghost text-psf-lime-300 border-psf-lime-300 hover:bg-psf-lime-300 hover:text-psf-green-900">
            Explorer les options
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Newsletter / CTA simple -->
    <section class="bg-psf-cream-100 text-psf-green-900 py-24 sm:py-32">
      <div class="max-w-[1440px] mx-auto px-6 grid md:grid-cols-12 gap-12 items-start">
        <div class="md:col-span-5">
          <h2 class="text-5xl sm:text-7xl">Restez<br>Informé</h2>
        </div>
        <div class="md:col-span-7">
          <form class="grid sm:grid-cols-2 gap-4" @submit.prevent>
            <input type="text" placeholder="Prénom" class="w-full min-h-[54px] px-4 bg-transparent border border-psf-green-900 rounded-none focus:outline-none placeholder-psf-green-900/60" />
            <input type="email" placeholder="Adresse Email" class="w-full min-h-[54px] px-4 bg-transparent border border-psf-green-900 rounded-none focus:outline-none placeholder-psf-green-900/60" />
            <div class="sm:col-span-2 mt-2">
              <button class="button button--dark w-full sm:w-auto">S'inscrire</button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-psf-green-900 text-psf-cream-100 py-20">
      <div class="max-w-[1440px] mx-auto px-6">
        <div class="font-display text-[clamp(64px,13vw,190px)] uppercase leading-none tracking-tighter text-psf-lime-300 mb-16">
          NEOTRAVEL
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <h4 class="text-psf-lime-300 uppercase text-xs tracking-[0.1em] font-bold mb-4">Contact</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-psf-lime-300 transition-colors">hello@neotravel.fr</a></li>
              <li><a href="#" class="hover:text-psf-lime-300 transition-colors">+33 1 23 45 67 89</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-psf-lime-300 uppercase text-xs tracking-[0.1em] font-bold mb-4">Légal</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-psf-lime-300 transition-colors">Mentions légales</a></li>
              <li><a href="#" class="hover:text-psf-lime-300 transition-colors">Politique de confidentialité</a></li>
            </ul>
          </div>
          <div class="md:col-span-2 flex flex-col justify-end text-sm opacity-60 md:text-right">
            <p>© {{ new Date().getFullYear() }} Neotravel. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn, init } = useAuth()
onMounted(() => {
  init()
  if (isLoggedIn.value) {
    navigateTo('/dashboard')
  }
})
</script>
