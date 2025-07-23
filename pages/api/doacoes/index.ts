import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { doadorId, criadorId } = req.query

      // Construir filtros
      const where: any = {}
      if (doadorId) where.doadorId = String(doadorId)
      if (criadorId) where.criadorId = String(criadorId)

      // Buscar doações
      const doacoes = await prisma.doacao.findMany({
        where,
        include: {
          doador: true,
          criador: {
            include: { usuario: true }
          }
        },
        orderBy: { data: 'desc' }
      })

      // Formatar doações
      const doacoesFormatadas = doacoes.map(doacao => ({
        id: doacao.id,
        doador: doacao.doador.nome,
        criador: doacao.criador.usuario.nome,
        quantidade: doacao.quantidade,
        mensagem: doacao.mensagem,
        data: doacao.data
      }))

      return res.status(200).json(doacoesFormatadas)
    } catch (error) {
      console.error('Erro ao buscar doações:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { doadorId, criadorId, quantidade, mensagem } = req.body

      if (!doadorId || !criadorId || !quantidade) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
      }

      // Verificar se o doador tem sementes suficientes
      const doador = await prisma.usuario.findUnique({
        where: { id: String(doadorId) }
      })

      if (!doador || doador.sementes < quantidade) {
        return res.status(400).json({ error: 'Sementes insuficientes' })
      }

      // Processar doação em transação
      const resultado = await prisma.$transaction(async (tx) => {
        // Criar doação
        const doacao = await tx.doacao.create({
          data: {
            doadorId: String(doadorId),
            criadorId: String(criadorId),
            quantidade: parseInt(quantidade),
            mensagem: mensagem ? String(mensagem) : null,
            data: new Date()
          }
        })

        // Deduzir sementes do doador
        await tx.usuario.update({
          where: { id: String(doadorId) },
          data: { sementes: { decrement: quantidade } }
        })

        // Adicionar sementes ao criador
        await tx.criador.update({
          where: { id: String(criadorId) },
          data: { 
            sementes: { increment: quantidade },
            doacoes: { increment: 1 }
          }
        })

        // Registrar histórico de sementes
        await tx.semente.create({
          data: {
            usuarioId: String(doadorId),
            quantidade: -quantidade,
            tipo: 'doacao',
            descricao: `Doação para criador ${criadorId}`
          }
        })

        await tx.semente.create({
          data: {
            usuarioId: String(criadorId),
            quantidade: quantidade,
            tipo: 'recebida',
            descricao: `Doação recebida de ${doadorId}`
          }
        })

        return doacao
      })

      return res.status(201).json(resultado)
    } catch (error) {
      console.error('Erro ao criar doação:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 