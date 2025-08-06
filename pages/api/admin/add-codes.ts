import { prisma } from '../../../lib/prisma'


import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Buscar o primeiro parceiro
    const parceiro = await prisma.parceiro.findFirst()
    
    if (!parceiro) {
      return res.status(404).json({ error: 'Nenhum parceiro encontrado' })
    }

    // Códigos para adicionar
    const codes = [
      { codigo: 'WELCOME50', valor: 50 },
      { codigo: 'BONUS100', valor: 100 },
      { codigo: 'EXTRA200', valor: 200 },
      { codigo: 'GIFT500', valor: 500 }
    ]

    const results: any[] = []

    for (const code of codes) {
      try {
        // Verificar se o código já existe
        const existing = await prisma.codigoCashback.findUnique({
          where: { codigo: code.codigo }
        })

        if (!existing) {
          await prisma.codigoCashback.create({
            data: {
              parceiroId: parceiro.id,
              codigo: code.codigo,
              valor: code.valor,
              usado: false
            }
          })
          results.push({ codigo: code.codigo, status: 'adicionado' })
        } else {
          results.push({ codigo: code.codigo, status: 'já existe' })
        }
      } catch (error) {
        results.push({ codigo: code.codigo, status: 'erro', error: error instanceof Error ? error.message : 'Erro desconhecido' })
      }
    }

    return res.status(200).json({ 
      message: 'Códigos processados',
      results,
      parceiro: parceiro.nomeCidade
    })
  } catch (error) {
    console.error('Erro ao adicionar códigos:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 