import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  // Verificar autenticação
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação necessário' })
  }

  const token = authHeader.replace('Bearer ', '')
  
  // Buscar usuário pelo token
  const user = await prisma.usuario.findUnique({
    where: { id: token }
  })

  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  try {
    const { enqueteId, opcaoIndex, tipo } = req.body

    if (!enqueteId || opcaoIndex === undefined || !tipo) {
      return res.status(400).json({ error: 'Dados inválidos' })
    }

    // Verificar se a enquete existe e está ativa
    const enquete = await prisma.enquete.findUnique({
      where: { id: enqueteId }
    })

    if (!enquete || !enquete.ativa) {
      return res.status(404).json({ error: 'Enquete não encontrada ou inativa' })
    }

    // Verificar se a data de fim não passou
    if (enquete.dataFim && new Date() > enquete.dataFim) {
      return res.status(400).json({ error: 'Enquete encerrada' })
    }

    // Verificar se o índice da opção é válido
    const opcoes = JSON.parse(enquete.opcoes)
    if (opcaoIndex < 0 || opcaoIndex >= opcoes.length) {
      return res.status(400).json({ error: 'Opção inválida' })
    }

    // Verificar se o usuário já votou nesta enquete
    const votoExistente = await prisma.votoEnquete.findUnique({
      where: {
        enqueteId_usuarioId: {
          enqueteId: enqueteId,
          usuarioId: user.id
        }
      }
    })

    if (votoExistente) {
      // Se já votou, atualizar o voto
      await prisma.votoEnquete.update({
        where: {
          enqueteId_usuarioId: {
            enqueteId: enqueteId,
            usuarioId: user.id
          }
        },
        data: {
          opcaoIndex: opcaoIndex
        }
      })
    } else {
      // Se não votou, criar novo voto
      await prisma.votoEnquete.create({
        data: {
          enqueteId: enqueteId,
          usuarioId: user.id,
          opcaoIndex: opcaoIndex
        }
      })
    }

    // Retornar a enquete atualizada com os votos
    const enqueteAtualizada = await prisma.enquete.findUnique({
      where: { id: enqueteId },
      include: {
        criador: {
          select: {
            id: true,
            nome: true
          }
        },
        votos: {
          select: {
            opcaoIndex: true
          }
        }
      }
    })

    if (!enqueteAtualizada) {
      return res.status(404).json({ error: 'Enquete não encontrada' })
    }

    const opcoesFormatadas = JSON.parse(enqueteAtualizada.opcoes)
    const totalVotos = enqueteAtualizada.votos.length
    
    // Calcular votos por opção
    const votosPorOpcao = opcoesFormatadas.map((opcao: string, index: number) => {
      const votos = enqueteAtualizada.votos.filter((voto: any) => voto.opcaoIndex === index).length
      return {
        opcao,
        votos,
        porcentagem: totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0
      }
    })

    const enqueteFormatada = {
      id: enqueteAtualizada.id,
      pergunta: enqueteAtualizada.pergunta,
      opcoes: votosPorOpcao,
      criador: enqueteAtualizada.criador.nome,
      totalVotos,
      dataCriacao: enqueteAtualizada.dataCriacao,
      dataFim: enqueteAtualizada.dataFim,
      ativa: enqueteAtualizada.ativa
    }

    return res.status(200).json({ 
      success: true, 
      enquete: enqueteFormatada,
      message: 'Voto registrado com sucesso!' 
    })

  } catch (error) {
    console.error('Erro ao votar na enquete:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 