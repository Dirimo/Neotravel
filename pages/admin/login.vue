<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-sm animate-fade-in">

      <!-- Logo centré -->
      <div class="flex flex-col items-center mb-10">
        <div class="w-12 h-12 rounded-xl bg-diamond-500 flex items-center justify-center shadow-md mb-4 bg-psf-green-900">
          <svg class="w-7 h-7" viewBox="0 0 20 20" fill="none">
            <path d="M10 3 L17 7 L17 13 L10 17 L3 13 L3 7 Z" stroke="white" stroke-width="1.5" fill="none" opacity="0.85"/>
          </svg>
        </div>
        <h1 class="text-2xl font-display text-psf-green-900 uppercase tracking-widest">Admin</h1>
        <p class="text-sm text-gray-400 mt-1">Espace administrateur</p>
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-psf-lime-300 focus:ring-2 focus:ring-psf-lime-100 transition-all"
          />
        </div>

        <!-- Message d'erreur -->
        <p v-if="error" class="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary py-3 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Se connecter</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Connexion…
          </span>
        </button>
      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const password = ref('')
const loading = ref(false)
const error = ref('')

const { adminLogin } = useAdminAuth()
const router = useRouter()

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await fetch('http://localhost:3001/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mdp: password.value })
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error ?? 'Erreur de connexion'
      return
    }
    adminLogin(data.token)
    router.push('/admin/dashboard')
  } catch {
    error.value = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
  } finally {
    loading.value = false
  }
}
</script>
