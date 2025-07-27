import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação via token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [RECADOS-RESPONDER] Token de autenticação não fornecido');
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Buscar usuário pelo token (ID do usuário)
  const user = await prisma.usuario.findUnique({
    where: { id: token }
  });

  console.log('🔍 [RECADOS-RESPONDER] Usuário autenticado:', user ? { id: user.id, nome: user.nome, nivel: user.nivel } : 'NÃO ENCONTRADO');
  
  if (!user) {
    console.log('❌ [RECADOS-RESPONDER] Usuário não encontrado');
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  // Verificar se é criador para responder recados
  if (user.nivel !== 'criador') {
    console.log('❌ [RECADOS-RESPONDER] Acesso negado - usuário não é criador:', user.nivel);
    return res.status(403).json({ error: 'Acesso negado. Apenas criadores podem responder recados.' });
  }

  if (req.method === 'POST') {
    try {
      const { id, resposta } = req.body;
      
      console.log('📝 [RECADOS-RESPONDER] Tentando responder recado:', { id, resposta });

      if (!id || !resposta) {
        console.log('❌ [RECADOS-RESPONDER] Campos obrigatórios faltando:', { id, resposta });
        return res.status(400).json({ error: 'ID do recado e resposta são obrigatórios' });
      }

      // Verificar se o recado existe e pertence ao criador
      const recado = await prisma.recado.findFirst({
        where: {
          id: String(id),
          destinatarioId: user.id
        }
      });

      if (!recado) {
        console.log('❌ [RECADOS-RESPONDER] Recado não encontrado ou não pertence ao criador:', id);
        return res.status(404).json({ error: 'Recado não encontrado' });
      }

      // Atualizar o recado com a resposta
      const recadoAtualizado = await prisma.recado.update({
        where: { id: String(id) },
        data: {
          resposta: String(resposta),
          dataResposta: new Date()
        }
      });

      console.log('✅ [RECADOS-RESPONDER] Resposta enviada com sucesso:', recadoAtualizado.id);
      return res.status(200).json({ ok: true, recado: recadoAtualizado });
    } catch (error) {
      console.error('❌ [RECADOS-RESPONDER] Erro ao responder recado:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
} 