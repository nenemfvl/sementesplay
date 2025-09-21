import { prisma } from './prisma'

/**
 * Utilitário para gerenciar o fundo de sementes de forma consistente
 * 
 * IMPORTANTE: Sempre use essas funções para interagir com o fundo
 * para garantir que apenas fundos ativos sejam utilizados.
 */

export interface FundoAtivo {
  id: string
  ciclo: number
  valorTotal: number
  dataInicio: Date
  dataFim: Date
  distribuido: boolean
}

/**
 * Busca o fundo ativo atual (não distribuído)
 * @returns Fundo ativo ou null se não existir
 */
export async function buscarFundoAtivo(): Promise<FundoAtivo | null> {
  return await prisma.fundoSementes.findFirst({
    where: { distribuido: false },
    orderBy: { dataInicio: 'desc' }
  })
}

/**
 * Busca o fundo ativo dentro de uma transação
 * @param tx Instância da transação do Prisma
 * @returns Fundo ativo ou null se não existir
 */
export async function buscarFundoAtivoTx(tx: any): Promise<FundoAtivo | null> {
  return await tx.fundoSementes.findFirst({
    where: { distribuido: false },
    orderBy: { dataInicio: 'desc' }
  })
}

/**
 * Cria um novo fundo ativo
 * @param ciclo Número do ciclo
 * @param valorInicial Valor inicial do fundo (padrão: 0)
 * @returns Novo fundo criado
 */
export async function criarFundoAtivo(ciclo: number = 1, valorInicial: number = 0): Promise<FundoAtivo> {
  return await prisma.fundoSementes.create({
    data: {
      ciclo,
      valorTotal: valorInicial,
      dataInicio: new Date(),
      dataFim: new Date(),
      distribuido: false
    }
  })
}

/**
 * Cria um novo fundo ativo dentro de uma transação
 * @param tx Instância da transação do Prisma
 * @param ciclo Número do ciclo
 * @param valorInicial Valor inicial do fundo (padrão: 0)
 * @returns Novo fundo criado
 */
export async function criarFundoAtivoTx(tx: any, ciclo: number = 1, valorInicial: number = 0): Promise<FundoAtivo> {
  return await tx.fundoSementes.create({
    data: {
      ciclo,
      valorTotal: valorInicial,
      dataInicio: new Date(),
      dataFim: new Date(),
      distribuido: false
    }
  })
}

/**
 * Adiciona valor ao fundo ativo
 * @param valor Valor a ser adicionado
 * @param cicloSeNaoExistir Ciclo a usar se precisar criar um novo fundo
 * @returns Fundo atualizado
 */
export async function adicionarAoFundoAtivo(valor: number, cicloSeNaoExistir: number = 1): Promise<FundoAtivo> {
  let fundo = await buscarFundoAtivo()
  
  if (!fundo) {
    console.log(`⚠️ Nenhum fundo ativo encontrado, criando novo para ciclo ${cicloSeNaoExistir}`)
    return await criarFundoAtivo(cicloSeNaoExistir, valor)
  } else {
    return await prisma.fundoSementes.update({
      where: { id: fundo.id },
      data: { valorTotal: { increment: valor } }
    })
  }
}

/**
 * Adiciona valor ao fundo ativo dentro de uma transação
 * @param tx Instância da transação do Prisma
 * @param valor Valor a ser adicionado
 * @param cicloSeNaoExistir Ciclo a usar se precisar criar um novo fundo
 * @returns Fundo atualizado
 */
export async function adicionarAoFundoAtivoTx(tx: any, valor: number, cicloSeNaoExistir: number = 1): Promise<FundoAtivo> {
  let fundo = await buscarFundoAtivoTx(tx)
  
  if (!fundo) {
    console.log(`⚠️ Nenhum fundo ativo encontrado, criando novo para ciclo ${cicloSeNaoExistir}`)
    return await criarFundoAtivoTx(tx, cicloSeNaoExistir, valor)
  } else {
    return await tx.fundoSementes.update({
      where: { id: fundo.id },
      data: { valorTotal: { increment: valor } }
    })
  }
}

/**
 * Verifica a integridade do sistema de fundos
 * @returns Objeto com informações sobre possíveis problemas
 */
export async function verificarIntegridadeFundo() {
  const fundosAtivos = await prisma.fundoSementes.findMany({
    where: { distribuido: false }
  })
  
  const repassesHoje = await prisma.repasseParceiro.findMany({
    where: {
      status: 'pago',
      dataRepasse: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }
  })
  
  const valorEsperadoFundo = repassesHoje.reduce((acc, repasse) => acc + (repasse.valor * 0.25), 0)
  const valorAtualFundo = fundosAtivos.reduce((acc, fundo) => acc + fundo.valorTotal, 0)
  
  return {
    fundosAtivos: fundosAtivos.length,
    repassesHoje: repassesHoje.length,
    valorEsperadoFundo,
    valorAtualFundo,
    diferenca: Math.abs(valorEsperadoFundo - valorAtualFundo),
    integridade: Math.abs(valorEsperadoFundo - valorAtualFundo) < 0.01, // Diferença menor que 1 centavo
    problemas: fundosAtivos.length > 1 ? ['Múltiplos fundos ativos encontrados'] : []
  }
}
