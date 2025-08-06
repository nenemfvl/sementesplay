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

      // Verificar se usuário tem dados bancários
      const dadosBancarios = await prisma.dadosBancarios.findUnique({
        where: { usuarioId: String(usuarioId) }
      })

      if (!dadosBancarios) {
        return res.status(400).json({ error: 'Dados bancários não cadastrados' })
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

      // Calcular taxa (2% do valor)
      const taxa = valor * 0.02
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
              banco: dadosBancarios.banco,
              agencia: dadosBancarios.agencia,
              conta: dadosBancarios.conta,
              tipoConta: dadosBancarios.tipoConta,
              cpfCnpj: dadosBancarios.cpfCnpj,
              nomeTitular: dadosBancarios.nomeTitular
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
            quantidade: sementesNecessarias,
            tipo: 'saque',
            descricao: `Solicitação de saque de ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
          }
        })

        // Criar notificação
        await tx.notificacao.create({
          data: {
            usuarioId: String(usuarioId),
            tipo: 'saque',
            titulo: 'Solicitação de Saque',
            mensagem: `Sua solicitação de saque de ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi recebida e está sendo processada.`
          }
        })

        return { saque, valorLiquido }
      })

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: String(usuarioId),
          acao: 'SOLICITAR_SAQUE',
          detalhes: `Solicitação de saque criada. ID: ${resultado.saque.id}, Valor: R$ ${valor.toFixed(2)}, Taxa: R$ ${taxa.toFixed(2)}, Valor líquido: R$ ${valorLiquido.toFixed(2)}, Sementes utilizadas: ${sementesNecessarias}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
        }
      })

      res.status(200).json({
        success: true,
        message: 'Solicitação de saque enviada com sucesso',
        valorLiquido: resultado.valorLiquido
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