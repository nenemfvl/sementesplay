import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação via token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [RECADOS] Token de autenticação não fornecido');
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }

  const token = authHeader.replace('Bearer ', '')
  
  // Buscar usuário pelo token (ID do usuário)
  const user = await prisma.usuario.findUnique({
    where: { id: token }
  });

  console.log('🔍 [RECADOS] Usuário autenticado:', user ? { id: user.id, nome: user.nome, nivel: user.nivel } : 'NÃO ENCONTRADO');
  
  if (!user) {
    console.log('❌ [RECADOS] Usuário não encontrado');
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  if (req.method === 'GET') {
    try {
      // Verificar se é criador para ver recados
      if (!user.nivel.includes('criador')) {
        console.log('❌ [RECADOS] Acesso negado - usuário não é criador:', user.nivel);
        return res.status(403).json({ error: 'Acesso negado. Apenas criadores podem acessar recados.' });
      }

      // Buscar recados recebidos pelo usuário criador
      const recados = await prisma.recado.findMany({
        where: {
          destinatarioId: user.id
        },
        include: {
          remetente: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        },
        orderBy: {
          dataEnvio: 'desc'
        }
      })

      const recadosFormatados = recados.map((recado: any) => ({
        id: recado.id,
        remetenteId: recado.remetenteId,
        remetenteNome: recado.remetente.nome,
        remetenteEmail: recado.remetente.email,
        titulo: recado.titulo,
        mensagem: recado.mensagem,
        lido: recado.lido,
        dataEnvio: recado.dataEnvio,
        dataLeitura: recado.dataLeitura,
        resposta: recado.resposta,
        dataResposta: recado.dataResposta
      }))

      return res.status(200).json({ recados: recadosFormatados })
    } catch (error) {
      console.error('❌ [RECADOS] Erro ao buscar recados:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { destinatarioId, titulo, mensagem } = req.body
      console.log('📝 [RECADOS] Tentando enviar recado:', { destinatarioId, titulo, mensagem });

      if (!destinatarioId || !titulo || !mensagem) {
        console.log('❌ [RECADOS] Campos obrigatórios faltando:', { destinatarioId, titulo, mensagem });
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
      }

      // Verificar se o destinatário existe
      const destinatario = await prisma.usuario.findUnique({
        where: { id: String(destinatarioId) }
      });

      if (!destinatario) {
        console.log('❌ [RECADOS] Destinatário não encontrado:', destinatarioId);
        return res.status(404).json({ error: 'Destinatário não encontrado' });
      }

      console.log('✅ [RECADOS] Destinatário encontrado:', destinatario.nome);

      const novoRecado = await prisma.recado.create({
        data: {
          remetenteId: user.id,
          destinatarioId: String(destinatarioId),
          titulo: String(titulo),
          mensagem: String(mensagem)
        }
      })

      console.log('✅ [RECADOS] Recado criado com sucesso:', novoRecado.id);
      return res.status(201).json({ recado: novoRecado })
    } catch (error) {
      console.error('❌ [RECADOS] Erro ao enviar recado:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
} 