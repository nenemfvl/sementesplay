import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { auth } from '../../../lib/auth'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação
  const user = auth.getUser()
  if (!user) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query

      if (!usuarioId || usuarioId !== user.id) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      const dadosBancarios = await prisma.dadosBancarios.findUnique({
        where: { usuarioId: String(usuarioId) }
      })

      if (!dadosBancarios) {
        return res.status(404).json({ error: 'Dados bancários não encontrados' })
      }

      res.status(200).json({
        id: dadosBancarios.id,
        banco: dadosBancarios.banco,
        agencia: dadosBancarios.agencia,
        conta: dadosBancarios.conta,
        tipoConta: dadosBancarios.tipoConta,
        cpfCnpj: dadosBancarios.cpfCnpj,
        nomeTitular: dadosBancarios.nomeTitular,
        validado: dadosBancarios.validado
      })

    } catch (error) {
      console.error('Erro ao buscar dados bancários:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'POST') {
    try {
      const { usuarioId, banco, agencia, conta, tipoConta, cpfCnpj, nomeTitular } = req.body

      if (!usuarioId || !banco || !agencia || !conta || !tipoConta || !cpfCnpj || !nomeTitular) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      if (usuarioId !== user.id) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      // Verificar se já existe dados bancários
      const dadosExistentes = await prisma.dadosBancarios.findUnique({
        where: { usuarioId: String(usuarioId) }
      })

      if (dadosExistentes) {
        return res.status(400).json({ error: 'Dados bancários já cadastrados' })
      }

      // Criar dados bancários
      const dadosBancarios = await prisma.dadosBancarios.create({
        data: {
          usuarioId: String(usuarioId),
          banco: String(banco),
          agencia: String(agencia),
          conta: String(conta),
          tipoConta: String(tipoConta),
          cpfCnpj: String(cpfCnpj),
          nomeTitular: String(nomeTitular),
          validado: false
        }
      })

      res.status(201).json({
        success: true,
        message: 'Dados bancários cadastrados com sucesso',
        dadosBancarios: {
          id: dadosBancarios.id,
          banco: dadosBancarios.banco,
          agencia: dadosBancarios.agencia,
          conta: dadosBancarios.conta,
          tipoConta: dadosBancarios.tipoConta,
          cpfCnpj: dadosBancarios.cpfCnpj,
          nomeTitular: dadosBancarios.nomeTitular,
          validado: dadosBancarios.validado
        }
      })

    } catch (error) {
      console.error('Erro ao cadastrar dados bancários:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { usuarioId, banco, agencia, conta, tipoConta, cpfCnpj, nomeTitular } = req.body

      if (!usuarioId || !banco || !agencia || !conta || !tipoConta || !cpfCnpj || !nomeTitular) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      if (usuarioId !== user.id) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      // Buscar dados bancários existentes
      const dadosExistentes = await prisma.dadosBancarios.findUnique({
        where: { usuarioId: String(usuarioId) }
      })

      if (!dadosExistentes) {
        return res.status(404).json({ error: 'Dados bancários não encontrados' })
      }

      // Atualizar dados bancários
      const dadosBancarios = await prisma.dadosBancarios.update({
        where: { id: dadosExistentes.id },
        data: {
          banco: String(banco),
          agencia: String(agencia),
          conta: String(conta),
          tipoConta: String(tipoConta),
          cpfCnpj: String(cpfCnpj),
          nomeTitular: String(nomeTitular),
          validado: false, // Resetar validação ao atualizar
          dataValidacao: null
        }
      })

      res.status(200).json({
        success: true,
        message: 'Dados bancários atualizados com sucesso',
        dadosBancarios: {
          id: dadosBancarios.id,
          banco: dadosBancarios.banco,
          agencia: dadosBancarios.agencia,
          conta: dadosBancarios.conta,
          tipoConta: dadosBancarios.tipoConta,
          cpfCnpj: dadosBancarios.cpfCnpj,
          nomeTitular: dadosBancarios.nomeTitular,
          validado: dadosBancarios.validado
        }
      })

    } catch (error) {
      console.error('Erro ao atualizar dados bancários:', error)
      res.status(500).json({ error: 'Erro interno do servidor' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT'])
    res.status(405).json({ error: 'Método não permitido' })
  }
} 