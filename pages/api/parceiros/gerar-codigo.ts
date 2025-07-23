import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function gerarCodigoUnico(): string {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = ''
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return codigo
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { valor, quantidade, usuarioId } = req.body

    if (!valor || !quantidade || !usuarioId) {
      return res.status(400).json({ error: 'Valor, quantidade e ID do usuário são obrigatórios' })
    }

    if (valor <= 0 || quantidade <= 0 || quantidade > 100) {
      return res.status(400).json({ error: 'Valores inválidos' })
    }

    // Buscar o parceiro
    const parceiro = await prisma.parceiro.findUnique({
      where: {
        usuarioId: String(usuarioId)
      }
    })

    if (!parceiro) {
      return res.status(404).json({ error: 'Parceiro não encontrado' })
    }

    const codigosGerados = []

    // Gerar códigos únicos
    for (let i = 0; i < quantidade; i++) {
      let codigoUnico = false
      let codigo = ''

      // Tentar gerar um código único
      while (!codigoUnico) {
        codigo = gerarCodigoUnico()
        
        // Verificar se o código já existe
        const codigoExistente = await prisma.codigoCashback.findUnique({
          where: { codigo }
        })

        if (!codigoExistente) {
          codigoUnico = true
        }
      }

      // Criar o código no banco
      const novoCodigo = await prisma.codigoCashback.create({
        data: {
          parceiroId: parceiro.id,
          codigo,
          valor: parseFloat(valor),
          usado: false
        }
      })

      codigosGerados.push(novoCodigo)
    }

    // Atualizar contador de códigos gerados
    await prisma.parceiro.update({
      where: { id: parceiro.id },
      data: {
        codigosGerados: {
          increment: quantidade
        }
      }
    })

    res.status(200).json({ 
      message: 'Códigos gerados com sucesso',
      codigos: codigosGerados 
    })
  } catch (error) {
    console.error('Erro ao gerar códigos:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 