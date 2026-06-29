<template>
  <div>
    <!-- Hero -->
    <section class="relative bg-white overflow-hidden">

      <!-- Image pleine largeur -->
      <div class="relative w-full h-[56vh] min-h-[320px]">
        <img
          src="/images/autocar.jpg"
          alt="Autocar Neotravel"
          class="w-full h-full object-cover object-center"
        />
        <!-- Fondu vers le blanc en bas -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white"></div>
      </div>

      <div class="relative max-w-6xl mx-auto px-6 pb-24 pt-10 grid lg:grid-cols-2 gap-16 items-center">
        <!-- Left: Text -->
        <div class="animate-fade-in">

          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-diamond-50 border border-diamond-200 text-diamond-700 text-xs font-medium mb-6">
            <span class="w-1.5 h-1.5 rounded-full bg-diamond-500 animate-pulse-slow"></span>
            Assistant intelligent disponible 24h/24
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-gray-900 leading-tight tracking-tight mb-6">
            Transport de groupe&nbsp;:<br>
            <span class="text-diamond-500">Obtenez un devis</span><br>
            personnalisé en quelques minutes
          </h1>

          <p class="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg">
            Notre assistant intelligent recueille vos besoins et calcule instantanément le meilleur tarif parmi nos partenaires autocaristes.
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <NuxtLink to="/chat" class="btn-primary text-base px-10 py-4">
              Obtenir un devis
              <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/>
              </svg>
            </NuxtLink>
            <a href="#how-it-works" class="btn-ghost text-base px-6 py-4">
              Voir comment ça marche
            </a>
          </div>

          <div class="mt-12 flex items-center gap-6 text-sm text-gray-400">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-diamond-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Sans engagement</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-diamond-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Réponse en 5 minutes</span>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-diamond-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>RGPD conforme</span>
            </div>
          </div>
        </div>

        <!-- Right: Chat preview -->
        <div class="hidden lg:block animate-slide-up">
          <div class="relative">
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-sm mx-auto">
              <div class="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50">
                <div class="w-9 h-9 rounded-full bg-diamond-500 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">Assistant Neotravel</p>
                  <span class="inline-flex items-center gap-1 text-xs text-diamond-600">
                    <span class="w-1.5 h-1.5 rounded-full bg-diamond-500"></span>
                    En ligne
                  </span>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex gap-2">
                  <div class="w-7 h-7 rounded-full bg-diamond-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg class="w-3.5 h-3.5 text-diamond-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                    </svg>
                  </div>
                  <div class="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-700 max-w-[80%]">
                    Bonjour&nbsp;! Quel est votre itinéraire et le nombre de passagers&nbsp;?
                  </div>
                </div>
                <div class="flex gap-2 justify-end">
                  <div class="bg-diamond-500 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-white max-w-[80%]">
                    Paris → Lyon, 48 personnes, le 15 juillet
                  </div>
                </div>
                <div class="flex gap-2">
                  <div class="w-7 h-7 rounded-full bg-diamond-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg class="w-3.5 h-3.5 text-diamond-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                    </svg>
                  </div>
                  <div class="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-700 max-w-[80%]">
                    Parfait&nbsp;! Je calcule votre devis…
                    <div class="flex gap-1 mt-1.5">
                      <span class="typing-dot w-1.5 h-1.5 rounded-full bg-diamond-400 inline-block"></span>
                      <span class="typing-dot w-1.5 h-1.5 rounded-full bg-diamond-400 inline-block"></span>
                      <span class="typing-dot w-1.5 h-1.5 rounded-full bg-diamond-400 inline-block"></span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 flex gap-2">
                <input type="text" placeholder="Votre réponse…" class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none" readonly/>
                <button class="w-9 h-9 rounded-lg bg-diamond-500 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Badge devis validé uniquement -->
            <div class="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-diamond-50 flex items-center justify-center">
                <svg class="w-4 h-4 text-diamond-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-900">Devis validé</p>
                <p class="text-xs text-gray-400">À l'instant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Advantages -->
    <section class="max-w-6xl mx-auto px-6 py-24">
      <div class="text-center mb-14">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Avantages du service</h2>
        <p class="text-gray-500 max-w-xl mx-auto">Une solution pensée pour simplifier chaque étape de votre demande de transport de groupe.</p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="adv in advantages" :key="adv.title" class="card group">
          <div class="w-11 h-11 rounded-xl bg-diamond-50 flex items-center justify-center mb-5 group-hover:bg-diamond-100 transition-colors duration-200" v-html="adv.icon"></div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ adv.title }}</h3>
          <p class="text-sm text-gray-500 leading-relaxed">{{ adv.description }}</p>
        </div>
      </div>
    </section>

    <!-- Le Concept — section démo IA -->
    <section ref="conceptSection" class="bg-gray-50 border-y border-gray-100 py-24">
      <div class="max-w-3xl mx-auto px-6">
        <div class="text-center mb-10">
          <span class="inline-block text-xs font-semibold text-diamond-600 uppercase tracking-widest mb-3">Notre technologie</span>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Le concept en un coup d'œil</h2>
          <p class="text-gray-500">Tapez votre besoin en langage naturel. Notre IA extrait automatiquement chaque donnée clé.</p>
        </div>

        <!-- Example phrase -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm px-7 py-5 mb-8 flex items-start gap-4">
          <div class="w-8 h-8 rounded-full bg-diamond-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg class="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
          </div>
          <p class="text-gray-700 text-base leading-relaxed italic">
            "Nous sommes un groupe de 45 lycéens au départ de Paris pour aller à Lyon le 14 mai."
          </p>
        </div>

        <!-- Arrow -->
        <div class="flex justify-center mb-8">
          <div class="flex flex-col items-center gap-1">
            <div class="w-px h-6 bg-diamond-300"></div>
            <svg class="w-5 h-5 text-diamond-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
            <span class="text-xs text-diamond-500 font-medium">Extraction automatique</span>
          </div>
        </div>

        <!-- Animated badges -->
        <div class="flex flex-wrap justify-center gap-3">
          <TransitionGroup name="badge">
            <div
              v-for="(badge, i) in visibleBadges"
              :key="badge.label"
              class="flex items-center gap-2 bg-green-100 text-green-800 border border-green-200 rounded-full px-4 py-2 text-sm font-medium shadow-sm"
            >
              <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-green-600 font-semibold">{{ badge.label }} :</span>
              <span>{{ badge.value }}</span>
            </div>
          </TransitionGroup>
        </div>

        <p class="text-center text-xs text-gray-400 mt-8">Aucune saisie de formulaire. Juste une phrase.</p>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="bg-gradient-to-br from-diamond-500 to-diamond-700 py-24 text-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold mb-4">Comment ça marche ?</h2>
          <p class="text-diamond-100 max-w-xl mx-auto">En quelques étapes simples, obtenez votre devis et confirmez votre transport.</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="(step, i) in steps" :key="step.title" class="relative">
            <div class="flex flex-col items-center text-center">
              <div class="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-xl font-bold mb-4 backdrop-blur-sm">
                {{ i + 1 }}
              </div>
              <h3 class="font-semibold text-white mb-2">{{ step.title }}</h3>
              <p class="text-sm text-diamond-100 leading-relaxed">{{ step.description }}</p>
            </div>
            <div v-if="i < steps.length - 1" class="hidden lg:block absolute top-6 left-[calc(50%+2.5rem)] right-0 h-px bg-white/20"></div>
          </div>
        </div>

        <div class="text-center mt-14">
          <NuxtLink to="/chat" class="inline-flex items-center gap-2 bg-white text-diamond-600 font-semibold px-10 py-4 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
            Démarrer maintenant
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-100 bg-white">
      <div class="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded bg-diamond-500 flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="none">
              <path d="M0 17 C3 13 7 8 13 4 L20 7 C13 11 8 16 5 20 Z" fill="white" opacity="0.2"/>
              <path d="M0 17 C3 13 7 8 13 4" stroke="white" stroke-width="1.2" fill="none" opacity="0.85"/>
              <path d="M5 20 C8 16 13 11 20 7" stroke="white" stroke-width="1.2" fill="none" opacity="0.85"/>
              <path d="M2.5 18.5 C5.5 14.5 9.5 9.5 16.5 5.5" stroke="white" stroke-width="0.85" stroke-dasharray="2.5 2" fill="none" opacity="1"/>
            </svg>
          </div>
          <span class="font-medium text-gray-600">Neotravel</span>
          <span>© {{ new Date().getFullYear() }}</span>
        </div>
        <div class="flex gap-6">
          <a href="#" class="hover:text-diamond-600 transition-colors">Mentions légales</a>
          <a href="#" class="hover:text-diamond-600 transition-colors">Politique de confidentialité</a>
          <a href="#" class="hover:text-diamond-600 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const conceptSection = ref<HTMLElement | null>(null)
const visibleBadges = ref<{ label: string; value: string }[]>([])

const allBadges = [
  { label: 'Type', value: 'Scolaire' },
  { label: 'Passagers', value: '45' },
  { label: 'Départ', value: 'Paris' },
  { label: 'Destination', value: 'Lyon' }
]

function animateBadges() {
  visibleBadges.value = []
  allBadges.forEach((badge, i) => {
    setTimeout(() => {
      visibleBadges.value.push(badge)
    }, i * 500)
  })
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateBadges()
        } else {
          visibleBadges.value = []
        }
      })
    },
    { threshold: 0.4 }
  )
  if (conceptSection.value) observer.observe(conceptSection.value)
})

const advantages = [
  {
    title: 'Captation fluide, centralisation automatique',
    description: 'Chaque demande entrante est captée et centralisée instantanément, sans ressaisie manuelle.',
    icon: '<svg class="w-5 h-5 text-diamond-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
  },
  {
    title: 'Pas de perte de temps, qualification 24h/24',
    description: "L'assistant qualifie chaque demande à toute heure, sans délai d'attente ni intervention humaine.",
    icon: '<svg class="w-5 h-5 text-diamond-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  },
  {
    title: 'Calcul fiable et déterministe',
    description: 'Le moteur de tarification applique des matrices précises — saisonnalité, urgence, capacité — jamais estimées par le modèle IA.',
    icon: '<svg class="w-5 h-5 text-diamond-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>'
  },
  {
    title: 'Rigueur commerciale',
    description: 'Plus de relance oubliée : chaque devis émis est tracé et suivi automatiquement jusqu\'à sa validation.',
    icon: '<svg class="w-5 h-5 text-diamond-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  },
  {
    title: 'Réseau de partenaires',
    description: 'Accédez à un réseau d\'autocaristes partenaires sélectionnés pour leur fiabilité et leurs standards de qualité.',
    icon: '<svg class="w-5 h-5 text-diamond-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'
  },
  {
    title: 'Données protégées',
    description: 'Vos informations sont traitées de manière sécurisée et confidentielle, conformément au RGPD.',
    icon: '<svg class="w-5 h-5 text-diamond-600" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>'
  }
]

const steps = [
  { title: 'Décrivez votre besoin', description: 'Indiquez votre trajet, vos dates et le nombre de passagers à notre assistant.' },
  { title: 'Devis calculé', description: 'Notre moteur analyse vos critères et génère un prix personnalisé en temps réel.' },
  { title: 'Options & validation', description: 'Choisissez vos options (guide, nuit chauffeur…) et validez votre devis.' },
  { title: 'Confirmation', description: 'Recevez votre confirmation et les coordonnées de votre autocariste partenaire.' }
]
</script>

<style scoped>
.badge-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-enter-from {
  opacity: 0;
  transform: scale(0.7) translateY(8px);
}
</style>
