import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { limit = 10 } = req.query

    // Buscar conteúdos mais recentes dos criadores
    const conteudos = await prisma.conteudo.findMany({
      include: {
        criador: {
          include: {
            usuario: {
              select: {
                nome: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        dataPublicacao: 'desc'
      },
      take: parseInt(limit as string) || 10
    })

    // Função para gerar preview baseada no tipo e URL (mesma lógica do painel do criador)
    const gerarPreview = (conteudo: any) => {
      // Se já tem preview, usa ela
      if (conteudo.preview) {
        return conteudo.preview;
      }

      // Para vídeos do YouTube, usa a mesma lógica do painel do criador
      if (conteudo.tipo === 'video' && conteudo.url) {
        const yt = conteudo.url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
        if (yt) {
          return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
        }
      }

      // Para imagens, usa a própria URL
      if (conteudo.tipo === 'imagem' && conteudo.url) {
        return conteudo.url;
      }

      // Para outros tipos, retorna null (usará ícone)
      return null;
    };

    // Formatar os conteúdos para o formato de notícias
    const noticias = conteudos.map((conteudo, index) => ({
      id: conteudo.id,
      titulo: conteudo.titulo,
      descricao: conteudo.descricao || `Novo conteúdo de ${conteudo.criador.usuario.nome}`,
      data: conteudo.dataPublicacao?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR'),
      link: `/criador/${conteudo.criador.id}`,
      tipo: conteudo.tipo,
      url: conteudo.url,
      preview: gerarPreview(conteudo),
      criador: {
        nome: conteudo.criador.usuario.nome,
        avatarUrl: conteudo.criador.usuario.avatarUrl
      },
      categoria: conteudo.categoria
    }))

    return res.status(200).json({
      noticias,
      total: noticias.length
    })
  } catch (error) {
    console.error('Erro ao buscar conteúdos recentes:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 