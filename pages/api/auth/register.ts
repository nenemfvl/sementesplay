import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { nome, email, senha, tipo } = req.body

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' })
    }

    // Verificar se o email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Email já cadastrado' })
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(senha, 12)

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        tipo: tipo || 'comum'
      }
    })

    // Criar perfil de criador se necessário
    if (tipo === 'criador') {
      await prisma.criador.create({
        data: {
          usuarioId: usuario.id,
          //descricao: '',
          categoria: 'Gaming',
          //seguidores: 0,
          //totalDoacoes: 0,
          //nivelAtual: 'comum',
          beneficios: '[]'
        }
      })
    }

    // Criar perfil de parceiro se necessário
    if (tipo === 'parceiro') {
      await prisma.parceiro.create({
        data: {
          usuarioId: usuario.id,
          nomeCidade: '',
          comissaoMensal: 0,
          totalVendas: 0,
          codigosGerados: 0
        }
      })
    }

    // Retornar usuário sem senha
    const { senha: _, ...usuarioSemSenha } = usuario

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: usuarioSemSenha
    })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 