import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar todos os criadores com suas doações recebidas
    const criadores = await prisma.criador.findMany({
      include: {
        usuario: {
          include: {
            missaoUsuarios: {
              where: {
                concluida: true
              }
            },
            conquistas: true
          }
        },
        doacoesRecebidas: true
      }
    })

    // Calcular pontuação composta para cada criador
    const criadoresComPontuacao = criadores.map(criador => {
      // Pontuação base: sementes recebidas (1 semente = 1 ponto)
      const sementesRecebidas = criador.doacoesRecebidas.reduce((total, doacao) => total + doacao.quantidade, 0)
      
      // Pontos extras por missões completadas (10 pontos por missão)
      const pontosMissoes = criador.usuario.missaoUsuarios.length * 10
      
      // Pontos extras por conquistas desbloqueadas (20 pontos por conquista)
      const pontosConquistas = criador.usuario.conquistas.length * 20
      
      // Pontos do campo pontuacao do usuário (se existir)
      const pontosUsuario = criador.usuario.pontuacao || 0
      
      // Pontuação total composta
      const pontuacaoTotal = sementesRecebidas + pontosMissoes + pontosConquistas + pontosUsuario

      return {
        id: criador.usuario.id,
        nome: criador.usuario.nome,
        pontuacaoTotal
      }
    })

    // Ordenar por pontuação total (maior para menor)
    criadoresComPontuacao.sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal)

    // Atualizar níveis baseado na posição no ranking
    const atualizacoes = []
    
    for (let i = 0; i < criadoresComPontuacao.length; i++) {
      const criador = criadoresComPontuacao[i]
      const posicao = i + 1
      let novoNivel = 'comum'
      
      // Definir nível baseado na posição
      if (posicao <= 50) {
        novoNivel = 'supremo'
      } else if (posicao <= 100) {
        novoNivel = 'parceiro'
      } else if (posicao <= 150) {
        novoNivel = 'criador'
      } else {
        novoNivel = 'comum'
      }

      // Atualizar no banco
      await prisma.usuario.update({
        where: { id: criador.id },
        data: { nivel: novoNivel }
      })

             // Buscar o nível atual do usuário
       const usuarioAtual = await prisma.usuario.findUnique({
         where: { id: criador.id },
         select: { nivel: true }
       })

       atualizacoes.push({
         id: criador.id,
         nome: criador.nome,
         posicao,
         nivelAnterior: usuarioAtual?.nivel || 'comum',
         nivelNovo: novoNivel,
         pontuacao: criador.pontuacaoTotal
       })
    }

    console.log(`Níveis atualizados para ${atualizacoes.length} criadores`)

    res.status(200).json({
      success: true,
      message: `Níveis atualizados para ${atualizacoes.length} criadores`,
      atualizacoes: atualizacoes.slice(0, 10) // Retornar apenas os primeiros 10 para não sobrecarregar
    })

  } catch (error) {
    console.error('Erro ao atualizar níveis:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 