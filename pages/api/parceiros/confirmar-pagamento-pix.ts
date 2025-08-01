import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { enviarNotificacao } from '../../../lib/notificacao'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { repasseId, comprovanteUrl } = req.body
    if (!repasseId) {
      return res.status(400).json({ error: 'ID do repasse obrigatório' })
    }

    // Busca o repasse e a compra vinculada
    const repasse = await prisma.repasseParceiro.findUnique({
      where: { id: repasseId },
      include: { 
        compra: {
          include: {
            parceiro: {
              include: {
                usuario: true
              }
            },
            usuario: true
          }
        }
      }
    })

    if (!repasse) {
      return res.status(404).json({ error: 'Repasse não encontrado' })
    }

    if (repasse.status !== 'pendente') {
      return res.status(400).json({ error: 'Repasse já processado' })
    }

    const compra = repasse.compra
    const parceiro = repasse.compra.parceiro
    const usuario = repasse.compra.usuario

    if (!compra || !parceiro || !usuario) {
      return res.status(400).json({ error: 'Dados inconsistentes' })
    }

    // Calcula as porcentagens
    const valor = repasse.valor
    const pctUsuario = Math.round(valor * 0.05)    // 5% para jogador (em sementes)
    const pctSistema = valor * 0.025               // 2,5% para sistema SementesPLAY
    const pctFundo = valor * 0.025                 // 2,5% para fundo de distribuição

    // Transação: atualiza tudo de uma vez
    await prisma.$transaction(async (tx) => {
      // Atualiza repasse para confirmado
      await tx.repasseParceiro.update({
        where: { id: repasseId },
        data: { 
          status: 'confirmado',
          comprovanteUrl: comprovanteUrl || null
        }
      })

      // Atualiza compra para cashback_liberado
      await tx.compraParceiro.update({
        where: { id: compra.id },
        data: { status: 'cashback_liberado' }
      })

      // Atualiza saldo devedor do parceiro
      await tx.parceiro.update({
        where: { id: parceiro.id },
        data: { saldoDevedor: { decrement: valor } }
      })

      // Credita sementes para usuário
      await tx.usuario.update({
        where: { id: compra.usuarioId },
        data: { sementes: { increment: pctUsuario } }
      })
      
      // Registra fundo de sementes
      const fundoExistente = await tx.fundoSementes.findFirst({
        where: { distribuido: false }
      })

      if (fundoExistente) {
        await tx.fundoSementes.update({
          where: { id: fundoExistente.id },
          data: { valorTotal: { increment: pctFundo } }
        })
      } else {
        await tx.fundoSementes.create({
          data: {
            ciclo: 1,
            valorTotal: pctFundo,
            dataInicio: new Date(),
            dataFim: new Date(),
            distribuido: false
          }
        })
      }

      // Registra histórico de sementes para o jogador
      await tx.semente.create({
        data: {
          usuarioId: compra.usuarioId,
          quantidade: pctUsuario,
          tipo: 'resgatada',
          descricao: `Cashback compra parceiro ${compra.id} - Repasse ${repasseId}`
        }
      })

      // Registra movimentação na carteira do usuário
      const carteira = await tx.carteiraDigital.findUnique({
        where: { usuarioId: compra.usuarioId }
      })
      
      if (carteira) {
        await tx.movimentacaoCarteira.create({
          data: {
            carteiraId: carteira.id,
            tipo: 'credito',
            valor: pctUsuario,
            saldoAnterior: carteira.saldo,
            saldoPosterior: carteira.saldo + pctUsuario,
            descricao: `Cashback liberado - Compra parceiro ${compra.id}`,
            referencia: repasseId
          }
        })
        
        // Atualiza saldo da carteira
        await tx.carteiraDigital.update({
          where: { id: carteira.id },
          data: { saldo: { increment: pctUsuario } }
        })
      }

      // Registra log do sistema
      await tx.logAuditoria.create({
        data: {
          usuarioId: parceiro.usuarioId,
          acao: 'REPASSE_CONFIRMADO',
          detalhes: JSON.stringify({
            repasseId,
            compraId: compra.id,
            parceiroId: parceiro.id,
            usuarioId: usuario.id,
            valor,
            pctUsuario,
            pctSistema,
            pctFundo
          }),
          ip: Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
        }
      })
    })

    // Notificações fora da transação
    await enviarNotificacao(
      compra.usuarioId, 
      'cashback', 
      'Cashback liberado!', 
      `Seu cashback da compra foi liberado e você recebeu ${pctUsuario} sementes.`
    )

    await enviarNotificacao(
      parceiro.usuarioId,
      'repasse',
      'Repasse confirmado!',
      `Seu repasse de R$ ${valor.toFixed(2)} foi confirmado e processado com sucesso.`
    )

    return res.status(200).json({ 
      success: true,
      message: 'Pagamento confirmado e valores distribuídos com sucesso!',
      dados: {
        valor,
        pctUsuario,
        pctSistema,
        pctFundo,
        usuario: usuario.nome,
        parceiro: parceiro.usuario.nome
      }
    })

  } catch (error) {
    console.error('Erro ao confirmar pagamento PIX:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 