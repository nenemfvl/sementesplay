import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../lib/auth'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Verificar autenticação
      const user = auth.getUser()
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const { usuarioId, tipo, valor } = req.body

      if (!usuarioId || !tipo || !valor) {
        return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
      }

      if (usuarioId !== user.id) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      if (valor < 1) {
        return res.status(400).json({ error: 'Valor mínimo de R$ 1,00' })
      }

      // Calcular sementes (1 real = 1 semente)
      const sementesGeradas = Math.floor(valor)

      // Processar pagamento em transação
      const resultado = await prisma.$transaction(async (tx) => {
        // Criar registro de pagamento
        const pagamento = await tx.pagamento.create({
          data: {
            usuarioId: String(usuarioId),
            tipo: String(tipo),
            valor: parseFloat(valor),
            sementesGeradas,
            gateway: 'simulado', // Em produção seria o gateway real
            status: 'aprovado',
            dadosPagamento: JSON.stringify({ tipo, valor }),
            dataProcessamento: new Date()
          }
        })

        // Adicionar sementes ao usuário
        await tx.usuario.update({
          where: { id: String(usuarioId) },
          data: {
            sementes: {
              increment: sementesGeradas
            }
          }
        })

        // Registrar sementes geradas
        await tx.semente.create({
          data: {
            usuarioId: String(usuarioId),
            quantidade: sementesGeradas,
            tipo: 'gerada',
            descricao: `Compra de ${sementesGeradas} sementes via ${tipo}`
          }
        })

        // Criar notificação
        await tx.notificacao.create({
          data: {
            usuarioId: String(usuarioId),
            tipo: 'pagamento',
            titulo: 'Pagamento Aprovado',
            mensagem: `Seu pagamento de ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi processado com sucesso! ${sementesGeradas} sementes foram adicionadas à sua conta.`
          }
        })

        return { pagamento, sementesGeradas }
      })

      res.status(200).json({
        success: true,
        message: 'Pagamento processado com sucesso',
        sementesGeradas: resultado.sementesGeradas
      })

    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 