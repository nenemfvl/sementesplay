export interface User {
  id: string
  nome: string
  email: string
  tipo: string
  sementes: number
  nivel: string
  pontuacao: number
  xp: number
  nivelUsuario: number
  dataCriacao?: string
  criador?: any
  parceiro?: any
  avatarUrl?: string // Adicionado campo para URL do avatar
}

// Usuário de teste padrão (não utilizado atualmente)
// const defaultUser: User = {
//   id: '1',
//   nome: 'Usuário Teste',
//   email: 'teste@sementesplay.com',
//   tipo: 'usuario',
//   sementes: 1000,
//   nivel: '5',
//   pontuacao: 500,
//   dataCriacao: new Date().toISOString()
// }

// Função para ler cookies no servidor
const getCookie = (name: string, cookies: string): string | null => {
  const value = `; ${cookies}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export const auth = {
  // Salvar usuário na sessão
  setUser: (user: User, token?: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sementesplay_user', JSON.stringify(user))
      // Salvar também em cookie para APIs
      document.cookie = `sementesplay_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400`
      if (token) {
        localStorage.setItem('sementesplay_token', token)
      }
    }
  },

  // Obter usuário da sessão (cliente)
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('sementesplay_user')
      if (user) {
        return JSON.parse(user)
      }
      return null
    }
    return null
  },

  // Obter usuário dos cookies (servidor)
  getUserFromCookies: (cookies: string): User | null => {
    try {
      const userCookie = getCookie('sementesplay_user', cookies)
      if (userCookie) {
        return JSON.parse(decodeURIComponent(userCookie))
      }
      return null
    } catch (error) {
      console.error('Erro ao ler usuário dos cookies:', error)
      return null
    }
  },

  // Verificar se está logado
  isAuthenticated: (): boolean => {
    return auth.getUser() !== null
  },

  // Verificar e renovar token se necessário
  checkAndRefreshToken: async (): Promise<boolean> => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sementesplay_token')
      if (!token) return false
      
      try {
        // Verificar se o token ainda é válido fazendo uma requisição
        const response = await fetch('/api/auth/session', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          return true
        } else {
          // Token inválido, fazer logout
          auth.logout()
          return false
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
        auth.logout()
        return false
      }
    }
    return false
  },

  // Fazer logout
  logout: async () => {
    if (typeof window !== 'undefined') {
      // Chamar API de logout para limpar cookies do servidor
      try {
        await fetch('/api/auth/logout', { method: 'POST' })
      } catch (error) {
        console.error('Erro ao fazer logout no servidor:', error)
      }
      
      localStorage.removeItem('sementesplay_user')
      localStorage.removeItem('sementesplay_token')
      // Remover cookies também
      document.cookie = 'sementesplay_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      window.location.href = '/'
    }
  },

  // Atualizar dados do usuário
  updateUser: (updates: Partial<User>) => {
    const user = auth.getUser()
    if (user) {
      const updatedUser = { ...user, ...updates }
      auth.setUser(updatedUser)
      return updatedUser
    }
    return null
  }
} 