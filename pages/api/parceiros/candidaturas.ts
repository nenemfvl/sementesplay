import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        nome,
        email,
        telefone,
        nomeCidade,
        siteCidade,
        descricao,
        experiencia,
        expectativa
      } = req.body

      // Validações básicas
      if (!nome || !email || !telefone || !nomeCidade || !descricao || !experiencia || !expectativa) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' })
      }

      // Verificar se já existe uma candidatura pendente para este email
      const candidaturaExistente = await prisma.candidaturaParceiro.findFirst({
        where: {
          email: email,
          status: 'pendente'
        }
      })

      if (candidaturaExistente) {
        return res.status(400).json({ error: 'Já existe uma candidatura pendente para este email' })
      }

      // Buscar ou criar usuário sistema para candidaturas
      let usuarioSistema = await prisma.usuario.findFirst({
        where: { tipo: 'sistema' }
      })

      if (!usuarioSistema) {
        usuarioSistema = await prisma.usuario.create({
          data: {
            nome: 'Sistema',
            email: 'sistema@sementesplay.com.br',
            senha: 'sistema123',
            tipo: 'sistema',
            nivel: 'sistema'
          }
        })
      }

      // Criar candidatura
      const candidatura = await prisma.candidaturaParceiro.create({
        data: {
          usuarioId: usuarioSistema.id,
          nome,
          email,
          telefone,
          nomeCidade,
          siteCidade: siteCidade || null,
          descricao,
          experiencia,
          expectativa,
          status: 'pendente'
        }
      })

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: usuarioSistema.id,
          acao: 'CANDIDATURA_PARCEIRO',
          detalhes: `Nova candidatura de parceiro: ${nome} (${email}) - Cidade: ${nomeCidade}`,
          nivel: 'info'
        }
      })

      res.status(201).json({
        message: 'Candidatura enviada com sucesso!',
        candidaturaId: candidatura.id
      })

    } catch (error) {
      console.error('Erro ao criar candidatura de parceiro:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'GET') {
    try {
      // Buscar candidaturas (apenas para admin)
      const candidaturas = await prisma.candidaturaParceiro.findMany({
        orderBy: {
          dataCandidatura: 'desc'
        }
      })

      const candidaturasFormatadas = candidaturas.map(candidatura => ({
        id: candidatura.id,
        nome: candidatura.nome,
        email: candidatura.email,
        telefone: candidatura.telefone,
        nomeCidade: candidatura.nomeCidade,
        siteCidade: candidatura.siteCidade,
        descricao: candidatura.descricao,
        experiencia: candidatura.experiencia,
        expectativa: candidatura.expectativa,
        status: candidatura.status,
        dataCandidatura: candidatura.dataCandidatura,
        dataRevisao: candidatura.dataRevisao,
        observacoes: candidatura.observacoes
      }))

      res.status(200).json({ candidaturas: candidaturasFormatadas })

    } catch (error) {
      console.error('Erro ao buscar candidaturas de parceiro:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET'])
    res.status(405).json({ error: `Método ${req.method} não permitido` })
  }
} 