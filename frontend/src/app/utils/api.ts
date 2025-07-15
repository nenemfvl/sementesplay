const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: number;
  email: string;
  role: string;
  avatar?: string;
}

export interface Statistics {
  id: number;
  userId: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowers: number;
  totalStreams: number;
  totalHoursStreamed: number;
  averageViewers: number;
  engagementRate: number;
  user?: User;
}

export interface Ranking {
  id: number;
  userId: number;
  category: string;
  position: number;
  score: number;
  previousPosition: number;
  change: number;
  user?: User;
}

export interface Conquista {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  pontos: number;
  userId?: number;
  conquistada?: boolean;
}

export interface Favorito {
  id: number;
  nome: string;
  descricao: string;
  icone: string;
  userId?: number;
  favoritado?: boolean;
}

// Auth
export const register = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Erro no cadastro');
  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Credenciais inválidas');
  return response.json();
};

export const updateProfile = async (token: string, data: { email?: string; nome?: string }) => {
  const response = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao atualizar perfil');
  return response.json();
};

export const changePassword = async (token: string, atual: string, nova: string) => {
  const response = await fetch(`${API_BASE}/auth/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ atual, nova }),
  });
  if (!response.ok) throw new Error('Erro ao alterar senha');
  return response.json();
};

export const uploadAvatar = async (token: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/auth/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) throw new Error('Erro ao fazer upload');
  return response.json();
};

// Conquistas
export const getConquistas = async (token: string) => {
  const response = await fetch(`${API_BASE}/conquistas`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar conquistas');
  return response.json();
};

export const toggleConquista = async (token: string, conquistaId: number) => {
  const response = await fetch(`${API_BASE}/conquistas/${conquistaId}/toggle`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao atualizar conquista');
  return response.json();
};

// Favoritos
export const getFavoritos = async (token: string) => {
  const response = await fetch(`${API_BASE}/favoritos`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar favoritos');
  return response.json();
};

export const toggleFavorito = async (token: string, favoritoId: number) => {
  const response = await fetch(`${API_BASE}/favoritos/${favoritoId}/toggle`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao atualizar favorito');
  return response.json();
};

// Statistics
export const getUserStatistics = async (token: string): Promise<Statistics> => {
  const response = await fetch(`${API_BASE}/statistics/user`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar estatísticas');
  return response.json();
};

export const getTopStatistics = async (token: string, category: string): Promise<Statistics[]> => {
  const response = await fetch(`${API_BASE}/statistics/top/${category}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar top estatísticas');
  return response.json();
};

export const updateUserStatistics = async (token: string, updates: Partial<Statistics>): Promise<Statistics> => {
  const response = await fetch(`${API_BASE}/statistics/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Erro ao atualizar estatísticas');
  return response.json();
};

export const generateStatistics = async (token: string): Promise<Statistics> => {
  const response = await fetch(`${API_BASE}/statistics/generate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao gerar estatísticas');
  return response.json();
};

// Rankings
export const getAllRankings = async (token: string): Promise<{ [category: string]: Ranking[] }> => {
  const response = await fetch(`${API_BASE}/rankings`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar rankings');
  return response.json();
};

export const getRankingsByCategory = async (token: string, category: string): Promise<Ranking[]> => {
  const response = await fetch(`${API_BASE}/rankings/${category}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar rankings por categoria');
  return response.json();
};

export const getUserRanking = async (token: string, category: string): Promise<Ranking> => {
  const response = await fetch(`${API_BASE}/rankings/user/${category}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar ranking do usuário');
  return response.json();
};

export const getAllUserRankings = async (token: string): Promise<Ranking[]> => {
  const response = await fetch(`${API_BASE}/rankings/user/all`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar todos os rankings do usuário');
  return response.json();
};

export const updateRankings = async (token: string) => {
  const response = await fetch(`${API_BASE}/rankings/update`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao atualizar rankings');
  return response.json();
}; 