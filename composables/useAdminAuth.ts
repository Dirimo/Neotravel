import { ref, onMounted } from 'vue'

export function useAdminAuth() {
  const adminToken = ref<string | null>(null)
  const isAdminLoggedIn = ref(false)

  function initAdmin() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('neotravel_admin_token')
      if (stored) {
        adminToken.value = stored
        isAdminLoggedIn.value = true
      }
    }
  }

  function adminLogin(newToken: string) {
    adminToken.value = newToken
    isAdminLoggedIn.value = true
    if (typeof window !== 'undefined') {
      localStorage.setItem('neotravel_admin_token', newToken)
    }
  }

  function adminLogout() {
    adminToken.value = null
    isAdminLoggedIn.value = false
    if (typeof window !== 'undefined') {
      localStorage.removeItem('neotravel_admin_token')
    }
  }

  onMounted(() => {
    initAdmin()
  })

  return {
    adminToken,
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    initAdmin
  }
}
