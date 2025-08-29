import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Verificar autenticação via cookie
      let user = null
      const userCookie = req.cookies['sementesplay_user']
      
      if (userCookie) {
        try {
          user = JSON.parse(decodeURIComponent(userCookie))
        } catch (error) {
          console.error('Erro ao decodificar cookie do usuário:', error)
        }
      }

      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' })
      }

      const { usuarioId, valor } = req.body

      if (!usuarioId || !valor) {
        return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' })
      }

      if (usuarioId !== user.id) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      // Verificar se o usuário é um criador
      const criador = await prisma.criador.findUnique({
        where: { usuarioId: String(usuarioId) }
      })

      if (!criador) {
        return res.status(403).json({ error: 'Apenas criadores podem solicitar saques' })
      }

      if (valor < 50) {
        return res.status(400).json({ error: 'Valor mínimo para saque: R$ 50,00' })
      }

      // Verificar se usuário tem dados PIX cadastrados
      const dadosPix = await prisma.dadosPix.findUnique({
        where: { usuarioId: String(usuarioId) }
      })

      if (!dadosPix) {
        return res.status(400).json({ error: 'Dados PIX não cadastrados' })
      }

      // Buscar usuário para verificar sementes
      const usuario = await prisma.usuario.findUnique({
        where: { id: String(usuarioId) }
      })

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      // Converter valor para sementes (1 real = 1 semente)
      const sementesNecessarias = Math.floor(valor)

      if (usuario.sementes < sementesNecessarias) {
        return res.status(400).json({ error: 'Sementes insuficientes para o saque' })
      }

      // Calcular taxa (10% do valor)
      const taxa = valor * 0.10
      const valorLiquido = valor - taxa

      // Processar saque em transação
      const resultado = await prisma.$transaction(async (tx) => {
        // Criar registro de saque
        const saque = await tx.saque.create({
          data: {
            usuarioId: String(usuarioId),
            valor: parseFloat(valor),
            taxa,
            valorLiquido,
            dadosBancarios: JSON.stringify({
              chavePix: dadosPix.chavePix,
              tipoChave: dadosPix.tipoChave,
              nomeTitular: dadosPix.nomeTitular,
              cpfCnpj: dadosPix.cpfCnpj
            }),
            status: 'pendente',
            dataSolicitacao: new Date()
          }
        })

        // Deduzir sementes do usuário
        await tx.usuario.update({
          where: { id: String(usuarioId) },
          data: {
            sementes: { decrement: sementesNecessarias }
          }
        })

        // Registrar histórico de sementes
        await tx.semente.create({
          data: {
            usuarioId: String(usuarioId),
            quantidade: -sementesNecessarias,
            tipo: 'saque',
            descricao: `Saque solicitado - R$ ${valor}`
          }
        })

        return saque
      })

      res.status(201).json({
        success: true,
        saque: resultado,
        message: 'Saque solicitado com sucesso'
      })

    } catch (error) {
      console.error('Erro ao processar saque:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 