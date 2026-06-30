export const useAuth = () => {
  const token = useState<string | null>('auth_token', () => null)
  const userEmail = useState<string | null>('auth_email', () => null)

  const isLoggedIn = computed(() => !!token.value)

  function init() {
    if (process.client) {
      const t = localStorage.getItem('neotravel_token')
      const e = localStorage.getItem('neotravel_email')
      if (t && e) {
        token.value = t
        userEmail.value = e
      }
    }
  }

  function login(t: string, email: string) {
    token.value = t
    userEmail.value = email
    if (process.client) {
      localStorage.setItem('neotravel_token', t)
      localStorage.setItem('neotravel_email', email)
    }
  }

  function logout() {
    token.value = null
    userEmail.value = null
    if (process.client) {
      localStorage.removeItem('neotravel_token')
      localStorage.removeItem('neotravel_email')
    }
  }

  return { token, userEmail, isLoggedIn, init, login, logout }
}
