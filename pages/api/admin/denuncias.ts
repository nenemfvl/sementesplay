import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { denunciaId, acao } = req.body

    if (!denunciaId || !acao) {
      return res.status(400).json({ error: 'ID da denúncia e ação são obrigatórios' })
    }

    if (!['aprovar', 'rejeitar'].includes(acao)) {
      return res.status(400).json({ error: 'Ação deve ser "aprovar" ou "rejeitar"' })
    }

    // Buscar a denúncia
    const denuncia = await prisma.denuncia.findUnique({
      where: { id: denunciaId },
      include: {
        conteudo: true,
        conteudoParceiro: true
      }
    })

    if (!denuncia) {
      return res.status(404).json({ error: 'Denúncia não encontrada' })
    }

    // Atualizar status da denúncia
    const novoStatus = acao === 'aprovar' ? 'resolvida' : 'rejeitada'
    
    await prisma.denuncia.update({
      where: { id: denunciaId },
      data: {
        status: novoStatus,
        dataResolucao: new Date()
      }
    })

    // Se aprovada, tomar ações automáticas
    if (acao === 'aprovar') {
      try {
        // Se é denúncia de conteúdo de criador
        if (denuncia.conteudoId) {
          // Remover o conteúdo denunciado
          await prisma.conteudo.update({
            where: { id: denuncia.conteudoId },
            data: { 
              removido: true,
              dataRemocao: new Date(),
              motivoRemocao: `Denúncia aprovada: ${denuncia.tipo}`
            }
          })
          
          // Adicionar advertência ao criador
          await prisma.advertencia.create({
            data: {
              usuarioId: denuncia.conteudo.criadorId,
              tipo: 'conteudo_removido',
              motivo: `Conteúdo removido por denúncia: ${denuncia.tipo}`,
              dataCriacao: new Date(),
              denunciaId: denuncia.id
            }
          })
          
          console.log(`Conteúdo de criador removido: ${denuncia.conteudoId}`)
        }
        
        // Se é denúncia de conteúdo de parceiro
        if (denuncia.conteudoParceiroId) {
          // Remover o conteúdo denunciado
          await prisma.conteudoParceiro.update({
            where: { id: denuncia.conteudoParceiroId },
            data: { 
              removido: true,
              dataRemocao: new Date(),
              motivoRemocao: `Denúncia aprovada: ${denuncia.tipo}`
            }
          })
          
          // Adicionar advertência ao parceiro
          await prisma.advertencia.create({
            data: {
              usuarioId: denuncia.conteudoParceiro.parceiroId,
              tipo: 'conteudo_removido',
              motivo: `Conteúdo removido por denúncia: ${denuncia.tipo}`,
              dataCriacao: new Date(),
              denunciaId: denuncia.id
            }
          })
          
          console.log(`Conteúdo de parceiro removido: ${denuncia.conteudoParceiroId}`)
        }
        
        // Verificar se o usuário tem muitas advertências
        const usuarioId = denuncia.conteudo?.criadorId || denuncia.conteudoParceiro?.parceiroId
        if (usuarioId) {
          const advertenciasCount = await prisma.advertencia.count({
            where: { 
              usuarioId,
              dataCriacao: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
              }
            }
          })
          
          // Se tem 3 ou mais advertências em 30 dias, suspender temporariamente
          if (advertenciasCount >= 3) {
            await prisma.usuario.update({
              where: { id: usuarioId },
              data: { 
                suspenso: true,
                dataSuspensao: new Date(),
                motivoSuspensao: 'Múltiplas denúncias aprovadas'
              }
            })
            
            console.log(`Usuário suspenso por múltiplas denúncias: ${usuarioId}`)
          }
        }
        
      } catch (error) {
        console.error('Erro ao executar ações automáticas:', error)
        // Não falhar a operação principal se as ações automáticas falharem
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Denúncia ${acao === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso` 
    })

  } catch (error) {
    console.error('Erro ao processar denúncia:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
