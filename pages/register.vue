<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm animate-fade-in">

      <!-- Logo centré -->
      <div class="flex flex-col items-center mb-10">
        <div class="w-12 h-12 rounded-xl bg-diamond-500 flex items-center justify-center shadow-md mb-4">
          <svg class="w-7 h-7" viewBox="0 0 20 20" fill="none">
            <path d="M0 17 C3 13 7 8 13 4 L20 7 C13 11 8 16 5 20 Z" fill="white" opacity="0.2"/>
            <path d="M0 17 C3 13 7 8 13 4" stroke="white" stroke-width="1.2" fill="none" opacity="0.85"/>
            <path d="M5 20 C8 16 13 11 20 7" stroke="white" stroke-width="1.2" fill="none" opacity="0.85"/>
            <path d="M2.5 18.5 C5.5 14.5 9.5 9.5 16.5 5.5" stroke="white" stroke-width="0.85" stroke-dasharray="2.5 2" fill="none" opacity="1"/>
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gray-900">{{ t('register.title') }}</h1>
        <p class="text-sm text-gray-400 mt-1">{{ t('register.sub') }}</p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('register.first') }}</label>
            <input
              v-model="prenom"
              type="text"
              placeholder="Marie"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-diamond-400 focus:ring-2 focus:ring-diamond-100 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('register.last') }}</label>
            <input
              v-model="nom"
              type="text"
              placeholder="Dupont"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-diamond-400 focus:ring-2 focus:ring-diamond-100 transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('register.email') }}</label>
          <input
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-diamond-400 focus:ring-2 focus:ring-diamond-100 transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('register.pwd') }}</label>
          <input
            v-model="password"
            type="password"
            placeholder="8 caractères minimum"
            required
            minlength="8"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-diamond-400 focus:ring-2 focus:ring-diamond-100 transition-all"
          />
        </div>

        <!-- Message d'erreur -->
        <p v-if="error" class="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {{ error }}
        </p>

        <p class="text-xs text-gray-400 leading-relaxed">
          En créant un compte, vous acceptez nos
          <a href="#" class="text-diamond-600 hover:underline">conditions d'utilisation</a>
          et notre <a href="#" class="text-diamond-600 hover:underline">politique de confidentialité</a>.
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">{{ t('register.btn') }}</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Création…
          </span>
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        {{ t('register.has_account') }}
        <NuxtLink to="/login" class="text-diamond-600 font-medium hover:text-diamond-700 transition-colors">
          {{ t('register.login') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { t } = useLang()

const prenom = ref('')
const nom = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const router = useRouter()

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, mdp: password.value, prenom: prenom.value, nom: nom.value })
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error ?? 'Erreur lors de la création du compte'
      return
    }
    router.push('/login')
  } catch {
    error.value = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
  } finally {
    loading.value = false
  }
}
</script>
