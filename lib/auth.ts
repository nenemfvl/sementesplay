export interface User {
  id: string
  nome: string
  email: string
  tipo: string
  sementes: number
  nivel: string
  pontuacao: number
  dataCriacao?: string
  criador?: any
  parceiro?: any
}

// Usuário de teste padrão
const defaultUser: User = {
  id: '1',
  nome: 'Usuário Teste',
  email: 'teste@sementesplay.com',
  tipo: 'doador',
  sementes: 1000,
  nivel: '5',
  pontuacao: 500,
  dataCriacao: new Date().toISOString()
}

export const auth = {
  // Salvar usuário na sessão
  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sementesplay_user', JSON.stringify(user))
    }
  },

  // Obter usuário da sessão
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('sementesplay_user')
      if (user) {
        return JSON.parse(user)
      }
      // Se não há usuário, criar um de teste
      auth.setUser(defaultUser)
      return defaultUser
    }
    return defaultUser
  },

  // Verificar se está logado
  isAuthenticated: (): boolean => {
    return auth.getUser() !== null
  },

  // Fazer logout
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sementesplay_user')
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