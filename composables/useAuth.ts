export const useAuth = () => {
  const token = useState<string | null>('auth_token', () => null)
  const userEmail = useState<string | null>('auth_email', () => null)
  const role = useState<string | null>('auth_role', () => null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => role.value === 'admin')

  function init() {
    if (process.client) {
      const t = localStorage.getItem('neotravel_token')
      const e = localStorage.getItem('neotravel_email')
      const r = localStorage.getItem('neotravel_role')
      if (t && e) {
        token.value = t
        userEmail.value = e
        role.value = r
      }
    }
  }

  function login(t: string, email: string, r: string = 'user') {
    token.value = t
    userEmail.value = email
    role.value = r
    if (process.client) {
      localStorage.setItem('neotravel_token', t)
      localStorage.setItem('neotravel_email', email)
      localStorage.setItem('neotravel_role', r)
    }
  }

  function logout() {
    token.value = null
    userEmail.value = null
    role.value = null
    if (process.client) {
      localStorage.removeItem('neotravel_token')
      localStorage.removeItem('neotravel_email')
      localStorage.removeItem('neotravel_role')
    }
  }

  return { token, userEmail, role, isLoggedIn, isAdmin, init, login, logout }
}
