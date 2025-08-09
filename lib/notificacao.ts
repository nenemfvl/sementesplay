import { prisma } from './prisma'

// Função para enviar notificação no banco de dados
export async function enviarNotificacao(usuarioId: string, tipo: string, titulo: string, mensagem: string) {
  return prisma.notificacao.create({
    data: {
      usuarioId,
      tipo,
      titulo,
      mensagem,
      lida: false
    }
  })
}

// Função para reproduzir som de notificação no frontend
export function reproduzirSomNotificacao(tipo: string) {
  // Esta função será chamada no frontend quando uma notificação for recebida
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('playNotificationSound', { 
      detail: { type: mapearTipoParaSom(tipo) } 
    })
    window.dispatchEvent(event)
  }
}

// Função apenas para o frontend - reproduzir som manualmente
export function reproduzirSomFrontend(tipo: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('playNotificationSound', { 
      detail: { type: mapearTipoParaSom(tipo) } 
    })
    window.dispatchEvent(event)
  }
}

// Mapear tipos de notificação para tipos de som
function mapearTipoParaSom(tipo: string): string {
  const mapeamento: Record<string, string> = {
    'doacao': 'donation',
    'doacao_recebida': 'donation',
    'missao': 'mission',
    'missao_completa': 'mission',
    'chat': 'chat',
    'mensagem': 'chat',
    'ranking': 'ranking',
    'nivel_up': 'success',
    'fundo': 'success',
    'cashback': 'success',
    'erro': 'error',
    'sistema': 'system',
    'solicitacao_compra': 'system',
    'repasse_confirmado': 'system'
  }
  
  return mapeamento[tipo] || 'default'
}

// Função que apenas salva no banco (o som será reproduzido automaticamente pelo sistema global)
export async function enviarNotificacaoComSom(usuarioId: string, tipo: string, titulo: string, mensagem: string) {
  // Salvar no banco (o sistema global de notificações detectará a nova notificação e tocará o som)
  const notificacao = await enviarNotificacao(usuarioId, tipo, titulo, mensagem)
  
  return notificacao
} 