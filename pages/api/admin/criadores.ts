import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('🔍 Buscando criadores...')
    console.log('🍪 Cookies:', req.cookies)
    console.log('📋 Headers:', req.headers)

    // Verificar autenticação - tentar cookie primeiro, depois header
    let user = null
    let authMethod = ''

    // Método 1: Cookie
    const userCookie = req.cookies.sementesplay_user
    if (userCookie) {
      try {
        user = JSON.parse(decodeURIComponent(userCookie))
        authMethod = 'cookie'
        console.log('✅ Usuário autenticado via cookie:', { id: user.id, nome: user.nome, nivel: user.nivel })
      } catch (error) {
        console.log('❌ Erro ao decodificar cookie:', error)
      }
    }

    // Método 2: Header Authorization (fallback)
    if (!user && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '')
        user = JSON.parse(decodeURIComponent(token))
        authMethod = 'header'
        console.log('✅ Usuário autenticado via header:', { id: user.id, nome: user.nome, nivel: user.nivel })
      } catch (error) {
        console.log('❌ Erro ao decodificar header:', error)
      }
    }

    if (!user) {
      console.log('❌ Nenhum método de autenticação válido encontrado')
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Verificar se é admin
    if (Number(user.nivel) < 5) {
      console.log('❌ Usuário não é admin. Nível:', user.nivel)
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta área.' })
    }

    console.log(`✅ Usuário autenticado e autorizado via ${authMethod}`)

    // Buscar criadores (apenas usuários com nível de criador)
    const criadores = await prisma.criador.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            nivel: true,
            dataCriacao: true
          }
        }
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    })

    console.log(`📊 Encontrados ${criadores.length} criadores na tabela criadores`)
    
    // Filtrar apenas criadores com níveis válidos
    const criadoresFiltrados = criadores.filter(criador => 
      ['criador-iniciante', 'criador-comum', 'criador-parceiro', 'criador-supremo'].includes(criador.usuario.nivel)
    )

    console.log(`📊 Após filtro: ${criadoresFiltrados.length} criadores válidos`)
    
    // Debug: mostrar detalhes dos criadores encontrados
    if (criadoresFiltrados.length > 0) {
      console.log('🔍 Detalhes dos criadores encontrados:')
      criadoresFiltrados.forEach((criador, index) => {
        console.log(`${index + 1}. ${criador.usuario.nome} (${criador.usuario.email}) - Nível: ${criador.usuario.nivel}`)
      })
    } else {
      console.log('⚠️ Nenhum criador encontrado com níveis válidos')
      console.log('🔍 Todos os criadores na tabela:')
      criadores.forEach((criador, index) => {
        console.log(`${index + 1}. ${criador.usuario.nome} (${criador.usuario.email}) - Nível: ${criador.usuario.nivel}`)
      })
    }

    // Função para mapear nível do usuário para nível de criador
    const mapearNivelCriador = (nivelUsuario: string) => {
      switch (nivelUsuario) {
        case 'criador-supremo': return 'Supremo'
        case 'criador-parceiro': return 'Parceiro'
        case 'criador-comum': return 'Comum'
        case 'criador-iniciante': return 'Iniciante'
        default: return 'Comum'
      }
    }

    // Formatar dados
    const criadoresFormatados = criadoresFiltrados.map(criador => ({
      id: criador.id,
      nome: criador.usuario.nome,
      email: criador.usuario.email,
      nivel: mapearNivelCriador(criador.usuario.nivel), // Usar nível do usuário
      doacoesRecebidas: criador.doacoes || 0,
      apoiadores: criador.apoiadores || 0,
      favoritos: 0, // Campo não existe no schema
      status: 'ativo', // Todos os criadores na lista são ativos
      dataCriacao: criador.dataCriacao
    }))

    // Calcular estatísticas baseadas no nível do usuário
    const totalCriadores = criadoresFiltrados.length
    const ativos = criadoresFiltrados.length // Todos os criadores na lista são ativos
    const supremos = criadoresFiltrados.filter(c => c.usuario.nivel === 'criador-supremo').length
    const suspensos = 0 // Não há criadores suspensos na lista

    const estatisticas = {
      total: totalCriadores,
      ativos,
      supremos,
      suspensos
    }

    console.log('📈 Estatísticas calculadas:', estatisticas)

    return res.status(200).json({ 
      criadores: criadoresFormatados,
      estatisticas
    })
  } catch (error) {
    console.error('❌ Erro ao buscar criadores:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 