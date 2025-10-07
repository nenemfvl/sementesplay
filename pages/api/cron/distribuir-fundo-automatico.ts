import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { enviarNotificacaoComSom } from '../../../lib/notificacao'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('🤖 INICIANDO DISTRIBUIÇÃO AUTOMÁTICA DO FUNDO...')

    // 1. Verificar se há fundo pendente de distribuição
    const fundoPendente = await prisma.fundoSementes.findFirst({ 
      where: { distribuido: false },
      orderBy: { dataInicio: 'desc' }
    })

    if (!fundoPendente) {
      console.log('ℹ️ Nenhum fundo pendente de distribuição')
      return res.status(200).json({ 
        message: 'Nenhum fundo pendente de distribuição',
        distribuido: false
      })
    }

    console.log(`💰 Fundo encontrado: R$ ${fundoPendente.valorTotal.toFixed(2)}`)
    console.log(`📅 Período: ${fundoPendente.dataInicio.toLocaleDateString()} a ${fundoPendente.dataFim.toLocaleDateString()}`)

    // 2. Verificar se o período do fundo já terminou
    const agora = new Date()
    if (fundoPendente.dataFim > agora) {
      console.log('⏰ Fundo ainda está no período ativo, aguardando...')
      return res.status(200).json({ 
        message: 'Fundo ainda está no período ativo',
        distribuido: false,
        dataFim: fundoPendente.dataFim
      })
    }

    console.log('✅ Período do fundo terminou, iniciando distribuição...')

    // 3. Executar distribuição
    const resultado = await distribuirFundoAutomatico(fundoPendente)

    // 4. Criar novo fundo para o próximo ciclo
    await criarNovoFundo()

    console.log('🎉 DISTRIBUIÇÃO AUTOMÁTICA CONCLUÍDA!')

    return res.status(200).json({
      message: 'Distribuição automática executada com sucesso!',
      distribuido: true,
      resultado
    })

  } catch (error) {
    console.error('❌ Erro na distribuição automática:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

async function distribuirFundoAutomatico(fundo: any) {
  const valorCriadores = fundo.valorTotal * 0.5
  const valorUsuarios = fundo.valorTotal * 0.5

  console.log(`📊 Distribuindo R$ ${valorCriadores.toFixed(2)} para criadores`)
  console.log(`📊 Distribuindo R$ ${valorUsuarios.toFixed(2)} para usuários`)

  // Buscar criadores ativos
  const criadores = await prisma.criador.findMany({
    include: {
      _count: {
        select: { conteudos: true }
      }
    },
    where: {
      conteudos: {
        some: { removido: false }
      }
    }
  })

  // Buscar usuários que fizeram compras no ciclo
  const compras = await prisma.compraParceiro.findMany({
    where: {
      dataCompra: {
        gte: fundo.dataInicio,
        lte: fundo.dataFim
      },
      status: 'cashback_liberado'
    },
    select: { usuarioId: true, valorCompra: true }
  })

  // Calcular gastos por usuário
  const gastoPorUsuario: Record<string, number> = {}
  let totalGasto = 0
  for (const compra of compras) {
    gastoPorUsuario[compra.usuarioId] = (gastoPorUsuario[compra.usuarioId] || 0) + compra.valorCompra
    totalGasto += compra.valorCompra
  }

  const usuariosUnicos = Array.from(new Set(compras.map(c => c.usuarioId)))
  const totalConteudos = criadores.reduce((sum, criador) => sum + criador._count.conteudos, 0)

  console.log(`👨‍🎨 Criadores elegíveis: ${criadores.length}`)
  console.log(`👤 Usuários elegíveis: ${usuariosUnicos.length}`)
  console.log(`📝 Total de conteúdos: ${totalConteudos}`)
  console.log(`💰 Total gasto por usuários: R$ ${totalGasto.toFixed(2)}`)

  let distribuicoesCriadores = 0
  let distribuicoesUsuarios = 0
  let totalDistribuido = 0

  await prisma.$transaction(async (tx) => {
    // Distribuir para criadores
    for (const criador of criadores) {
      const proporcao = totalConteudos > 0 ? criador._count.conteudos / totalConteudos : 0
      const valorCriador = valorCriadores * proporcao
      
      if (valorCriador > 0) {
        await tx.distribuicaoFundo.create({
          data: {
            fundoId: fundo.id,
            criadorId: criador.id,
            valor: valorCriador,
            tipo: 'criador'
          }
        })
        await tx.usuario.update({
          where: { id: criador.usuarioId },
          data: { sementes: { increment: valorCriador } }
        })
        distribuicoesCriadores++
        totalDistribuido += valorCriador
      }
    }

    // Distribuir para usuários
    for (const usuarioId of Object.keys(gastoPorUsuario)) {
      const proporcao = gastoPorUsuario[usuarioId] / totalGasto
      const valorUsuario = valorUsuarios * proporcao
      
      if (valorUsuario > 0) {
        await tx.distribuicaoFundo.create({
          data: {
            fundoId: fundo.id,
            usuarioId,
            valor: valorUsuario,
            tipo: 'usuario'
          }
        })
        await tx.usuario.update({
          where: { id: usuarioId },
          data: { sementes: { increment: valorUsuario } }
        })
        distribuicoesUsuarios++
        totalDistribuido += valorUsuario
      }
    }

    // Marcar fundo como distribuído
    await tx.fundoSementes.update({
      where: { id: fundo.id },
      data: { distribuido: true }
    })
  })

  // Enviar notificações
  console.log('📧 Enviando notificações...')
  
  for (const criador of criadores) {
    const proporcao = totalConteudos > 0 ? criador._count.conteudos / totalConteudos : 0
    const valorCriador = valorCriadores * proporcao
    
    if (valorCriador > 0) {
      await enviarNotificacaoComSom(
        criador.usuarioId, 
        'fundo', 
        '🎉 Fundo de sementes distribuído automaticamente!', 
        `Você recebeu ${valorCriador.toFixed(2)} sementes do fundo de sementes do ciclo ${fundo.ciclo}.`
      )
    }
  }

  for (const usuarioId of Object.keys(gastoPorUsuario)) {
    const proporcao = gastoPorUsuario[usuarioId] / totalGasto
    const valorUsuario = valorUsuarios * proporcao
    
    if (valorUsuario > 0) {
      await enviarNotificacaoComSom(
        usuarioId, 
        'fundo', 
        '🎉 Fundo de sementes distribuído automaticamente!', 
        `Você recebeu ${valorUsuario.toFixed(2)} sementes do fundo de sementes do ciclo ${fundo.ciclo}.`
      )
    }
  }

  console.log(`✅ Distribuição concluída:`)
  console.log(`   • Criadores: ${distribuicoesCriadores} distribuições`)
  console.log(`   • Usuários: ${distribuicoesUsuarios} distribuições`)
  console.log(`   • Total distribuído: R$ ${totalDistribuido.toFixed(2)}`)

  return {
    distribuicoesCriadores,
    distribuicoesUsuarios,
    totalDistribuido,
    valorFundo: fundo.valorTotal
  }
}

async function criarNovoFundo() {
  console.log('🆕 Criando novo fundo para o próximo ciclo...')

  // Buscar configuração de ciclos
  const configuracao = await prisma.configuracaoCiclos.findFirst({
    orderBy: { dataCriacao: 'desc' }
  })

  if (!configuracao) {
    console.log('❌ Configuração de ciclos não encontrada')
    return
  }

  const proximoCiclo = configuracao.numeroCiclo + 1
  const dataInicio = new Date()
  const dataFim = new Date()
  dataFim.setDate(dataFim.getDate() + 30) // Próximo ciclo de 30 dias

  const novoFundo = await prisma.fundoSementes.create({
    data: {
      ciclo: proximoCiclo,
      valorTotal: 0,
      dataInicio,
      dataFim,
      distribuido: false
    }
  })

  console.log(`✅ Novo fundo criado:`)
  console.log(`   • Ciclo: ${proximoCiclo}`)
  console.log(`   • Período: ${dataInicio.toLocaleDateString()} a ${dataFim.toLocaleDateString()}`)
  console.log(`   • ID: ${novoFundo.id}`)

  return novoFundo
}
