import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { criadorId, categoria, tipo } = req.query

      // Construir filtros
      const where: any = {}
      if (criadorId) where.criadorId = String(criadorId)
      if (categoria) where.categoria = String(categoria)
      if (tipo) where.tipo = String(tipo)

      // Buscar conteúdos
      const conteudos = await prisma.Conteudo.findMany({
        where,
        include: {
          criador: {
            include: { usuario: true }
          },
          comentarios: {
            include: { usuario: true },
            orderBy: { data: 'desc' },
            take: 5
          }
        },
        orderBy: { dataPublicacao: 'desc' }
      })

      // Formatar conteúdos
      const conteudosFormatados = conteudos.map(conteudo => ({
        id: conteudo.id,
        titulo: conteudo.titulo,
        url: conteudo.url,
        tipo: conteudo.tipo,
        categoria: conteudo.categoria,
        descricao: conteudo.descricao,
        preview: conteudo.preview,
        fixado: conteudo.fixado,
        dataPublicacao: conteudo.dataPublicacao,
        plataforma: conteudo.plataforma,
        visualizacoes: conteudo.visualizacoes,
        curtidas: conteudo.curtidas,
        compartilhamentos: conteudo.compartilhamentos,
        criador: conteudo.criador.usuario.nome,
        comentarios: conteudo.comentarios.map(comentario => ({
          id: comentario.id,
          texto: comentario.texto,
          data: comentario.data,
          usuario: comentario.usuario.nome
        }))
      }))

      return res.status(200).json(conteudosFormatados)
    } catch (error) {
      console.error('Erro ao buscar conteúdos:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { criadorId, titulo, url, tipo, categoria, descricao, preview, plataforma } = req.body

      if (!criadorId || !titulo || !url || !tipo || !categoria) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' })
      }

      // Criar novo conteúdo
      const novoConteudo = await prisma.Conteudo.create({
        data: {
          criadorId: String(criadorId),
          titulo: String(titulo),
          url: String(url),
          tipo: String(tipo),
          categoria: String(categoria),
          descricao: descricao ? String(descricao) : null,
          preview: preview ? String(preview) : null,
          plataforma: plataforma ? String(plataforma) : 'outro'
        }
      })

      return res.status(201).json(novoConteudo)
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 