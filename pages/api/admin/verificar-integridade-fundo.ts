import { NextApiRequest, NextApiResponse } from 'next'
import { verificarIntegridadeFundo, buscarFundoAtivo } from '../../../lib/fundo-utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('🔍 Verificando integridade do sistema de fundos...')
    
    // Verificar integridade
    const integridade = await verificarIntegridadeFundo()
    
    // Buscar fundo ativo
    const fundoAtivo = await buscarFundoAtivo()
    
    // Compilar relatório
    const relatorio = {
      timestamp: new Date().toISOString(),
      fundoAtivo: fundoAtivo ? {
        id: fundoAtivo.id,
        ciclo: fundoAtivo.ciclo,
        valorTotal: fundoAtivo.valorTotal,
        dataInicio: fundoAtivo.dataInicio
      } : null,
      integridade: {
        ...integridade,
        status: integridade.integridade ? 'OK' : 'PROBLEMA_DETECTADO'
      },
      recomendacoes: [] as string[]
    }

    // Adicionar recomendações baseadas nos problemas encontrados
    if (!fundoAtivo) {
      relatorio.recomendacoes.push('CRÍTICO: Nenhum fundo ativo encontrado. Criar novo fundo imediatamente.')
    }
    
    if (integridade.fundosAtivos > 1) {
      relatorio.recomendacoes.push(`ATENÇÃO: ${integridade.fundosAtivos} fundos ativos encontrados. Deve haver apenas 1.`)
    }
    
    if (integridade.diferenca > 0.01) {
      relatorio.recomendacoes.push(`INCONSISTÊNCIA: Diferença de R$ ${integridade.diferenca.toFixed(2)} entre valor esperado e atual do fundo.`)
    }
    
    if (relatorio.recomendacoes.length === 0) {
      relatorio.recomendacoes.push('✅ Sistema de fundos funcionando corretamente.')
    }

    // Log do resultado
    console.log('📊 Relatório de integridade:', {
      status: relatorio.integridade.status,
      fundosAtivos: integridade.fundosAtivos,
      diferenca: integridade.diferenca,
      problemas: integridade.problemas.length
    })

    return res.status(200).json(relatorio)
    
  } catch (error) {
    console.error('❌ Erro ao verificar integridade do fundo:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
