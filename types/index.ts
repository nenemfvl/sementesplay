// Tipos para o sistema SementesPLAY

// Definições globais para TypeScript
declare global {
  interface Window {
    Notification: {
      permission: 'default' | 'granted' | 'denied';
      requestPermission(): Promise<'default' | 'granted' | 'denied'>;
    };
  }
  
  namespace NodeJS {
    interface Timeout {}
  }
  

}

export enum TipoUsuario {
  COMUM = 'comum',
  CRIADOR = 'criador',
  PARCEIRO = 'parceiro'
}

export enum NivelCriador {
  COMUM = 'comum',
  PARCEIRO = 'parceiro',
  SUPREMO = 'supremo'
}

export enum TipoTransacao {
  GERADA = 'gerada',
  DOADA = 'doada',
  RESGATADA = 'resgatada'
}

export enum StatusTransacao {
  PENDENTE = 'pendente',
  APROVADA = 'aprovada',
  REJEITADA = 'rejeitada',
  CANCELADA = 'cancelada'
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
  sementes: number;
  nivel: NivelCriador;
  pontuacao: number;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface Criador {
  id: string;
  usuarioId: string;
  descricao: string;
  categoria: string;
  seguidores: number;
  totalDoacoes: number;
  nivelAtual: NivelCriador;
  beneficios: string[];
  usuario?: Usuario;
}

export interface Parceiro {
  id: string;
  usuarioId: string;
  nomeCidade: string;
  comissaoMensal: number;
  totalVendas: number;
  codigosGerados: number;
  usuario?: Usuario;
}

export interface Semente {
  id: string;
  usuarioId: string;
  quantidade: number;
  tipo: TipoTransacao;
  data: Date;
  descricao: string;
  usuario?: Usuario;
}

export interface Doacao {
  id: string;
  doadorId: string;
  criadorId: string;
  quantidade: number;
  data: Date;
  mensagem?: string;
  doador?: Usuario;
  criador?: Criador;
}

export interface Transacao {
  id: string;
  usuarioId: string;
  tipo: string;
  valor: number;
  codigoParceiro?: string;
  status: StatusTransacao;
  data: Date;
  usuario?: Usuario;
}

export interface CodigoCashback {
  id: string;
  parceiroId: string;
  codigo: string;
  valor: number;
  usado: boolean;
  dataGeracao: Date;
  dataUso?: Date;
  parceiro?: Parceiro;
}

export interface RankingCriador {
  posicao: number;
  criador: Criador;
  pontuacao: number;
  doacoesRecebidas: number;
  apoiadoresUnicos: number;
}

export interface RelatorioParceiro {
  parceiroId: string;
  periodo: {
    inicio: Date;
    fim: Date;
  };
  estatisticas: {
    totalVendas: number;
    totalCashback: number;
    codigosGerados: number;
    codigosUsados: number;
    comissaoTotal: number;
  };
  vendas: Transacao[];
}

export interface Notificacao {
  id: string;
  usuarioId: string;
  tipo: 'doacao' | 'ranking' | 'cashback' | 'sistema';
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: Date;
}

export interface BeneficioNivel {
  nivel: NivelCriador;
  beneficios: string[];
  requisitos: {
    pontuacaoMinima: number;
    doacoesMinimas: number;
    apoiadoresMinimos: number;
  };
}

// Tipos para formulários
export interface LoginForm {
  email: string;
  senha: string;
}

export interface RegistroForm {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  tipo: TipoUsuario;
}

export interface DoacaoForm {
  criadorId: string;
  quantidade: number;
  mensagem?: string;
}

export interface ResgateForm {
  codigo: string;
}

export interface CriadorForm {
  descricao: string;
  categoria: string;
}

export interface ParceiroForm {
  nomeCidade: string;
  comissaoMensal: number;
}

// Tipos para APIs
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para estatísticas
export interface EstatisticasGerais {
  totalUsuarios: number;
  totalCriadores: number;
  totalParceiros: number;
  totalSementes: number;
  totalDoacoes: number;
  totalCashback: number;
}

export interface EstatisticasUsuario {
  sementes: number;
  doacoesFeitas: number;
  doacoesRecebidas: number;
  nivel: NivelCriador;
  pontuacao: number;
  posicaoRanking?: number;
} 