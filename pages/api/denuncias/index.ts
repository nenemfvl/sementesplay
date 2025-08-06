import { prisma } from '../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log('Dados recebidos na API:', req.body)
      
      const { denuncianteId, conteudoId, conteudoParceiroId, tipo, motivo, descricao } = req.body

      // Validações básicas
      if (!denuncianteId || !tipo || !motivo) {
        console.log('Erro de validação:', { denuncianteId, tipo, motivo })
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
      }

      if (!conteudoId && !conteudoParceiroId) {
        return res.status(400).json({ error: 'Deve especificar um conteúdo para denunciar' })
      }

      // Verificar se o usuário já denunciou este conteúdo
      const denunciaExistente = await prisma.denuncia.findFirst({
        where: {
          denuncianteId,
          OR: [
            { conteudoId: conteudoId || undefined },
            { conteudoParceiroId: conteudoParceiroId || undefined }
          ]
        }
      })

      if (denunciaExistente) {
        return res.status(400).json({ error: 'Você já denunciou este conteúdo' })
      }

      // Determinar prioridade baseada no tipo
      let prioridade = 'baixa'
      if (['violencia', 'assedio', 'direitos_autorais'].includes(tipo)) {
        prioridade = 'alta'
      } else if (['spam', 'conteudo_inadequado'].includes(tipo)) {
        prioridade = 'media'
      }

      // Criar a denúncia
      const denuncia = await prisma.denuncia.create({
        data: {
          denuncianteId,
          conteudoId: conteudoId || null,
          conteudoParceiroId: conteudoParceiroId || null,
          tipo,
          motivo,
          descricao: descricao || null,
          prioridade
        },
        include: {
          denunciante: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          },
          conteudo: {
            select: {
              id: true,
              titulo: true,
              criador: {
                select: {
                  nome: true
                }
              }
            }
          },
          conteudoParceiro: {
            select: {
              id: true,
              titulo: true,
              parceiro: {
                select: {
                  nomeCidade: true
                }
              }
            }
          }
        }
      })

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: denuncianteId,
          acao: 'DENUNCIAR_CONTEUDO',
          detalhes: `Denúncia criada. ID: ${denuncia.id}, Tipo: ${tipo}, Motivo: ${motivo}, Conteúdo: ${conteudoId || conteudoParceiroId}`,
          ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          nivel: 'info'
        }
      })

      return res.status(201).json({
        success: true,
        message: 'Denúncia enviada com sucesso',
        denuncia
      })

    } catch (error) {
      console.error('Erro ao criar denúncia:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'GET') {
    try {
      const { status, tipo, prioridade, limit = '50', offset = '0' } = req.query

      const where: any = {}

      if (status) {
        where.status = String(status)
      }

      if (tipo) {
        where.tipo = String(tipo)
      }

      if (prioridade) {
        where.prioridade = String(prioridade)
      }

      const denuncias = await prisma.denuncia.findMany({
        where,
        include: {
          denunciante: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          },
          conteudo: {
            select: {
              id: true,
              titulo: true,
              criador: {
                select: {
                  nome: true
                }
              }
            }
          },
          conteudoParceiro: {
            select: {
              id: true,
              titulo: true,
              parceiro: {
                select: {
                  nomeCidade: true
                }
              }
            }
          }
        },
        orderBy: {
          dataDenuncia: 'desc'
        },
        take: parseInt(String(limit)),
        skip: parseInt(String(offset))
      })

      const total = await prisma.denuncia.count({ where })

      return res.status(200).json({
        denuncias,
        total,
        pendentes: await prisma.denuncia.count({ where: { status: 'pendente' } }),
        em_analise: await prisma.denuncia.count({ where: { status: 'em_analise' } }),
        resolvidas: await prisma.denuncia.count({ where: { status: 'resolvida' } }),
        rejeitadas: await prisma.denuncia.count({ where: { status: 'rejeitada' } })
      })

    } catch (error) {
      console.error('Erro ao buscar denúncias:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
