import { prisma } from '../../../lib/prisma'

import { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verificar autenticação via token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [RECADOS-TOGGLE] Token de autenticação não fornecido');
    return res.status(401).json({ error: 'Token de autenticação necessário' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Buscar usuário pelo token (ID do usuário)
  const user = await prisma.usuario.findUnique({
    where: { id: token }
  });

  console.log('🔍 [RECADOS-TOGGLE] Usuário autenticado:', user ? { id: user.id, nome: user.nome, nivel: user.nivel } : 'NÃO ENCONTRADO');
  
  if (!user) {
    console.log('❌ [RECADOS-TOGGLE] Usuário não encontrado');
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  // Verificar se é criador
  if (!user.nivel.includes('criador')) {
    console.log('❌ [RECADOS-TOGGLE] Acesso negado - usuário não é criador:', user.nivel);
    return res.status(403).json({ error: 'Acesso negado. Apenas criadores podem gerenciar visibilidade.' });
  }

  if (req.method === 'POST') {
    try {
      const { id, publico } = req.body;
      
      console.log('📝 [RECADOS-TOGGLE] Tentando alterar visibilidade:', { id, publico });

      if (id === undefined || publico === undefined) {
        console.log('❌ [RECADOS-TOGGLE] Campos obrigatórios faltando:', { id, publico });
        return res.status(400).json({ error: 'ID do recado e status público são obrigatórios' });
      }

      // Verificar se o recado existe e pertence ao criador
      const recado = await prisma.recado.findFirst({
        where: {
          id: String(id),
          destinatarioId: user.id
        }
      });

      if (!recado) {
        console.log('❌ [RECADOS-TOGGLE] Recado não encontrado ou não pertence ao criador:', id);
        return res.status(404).json({ error: 'Recado não encontrado' });
      }

      // Atualizar o recado com o status público
      const recadoAtualizado = await prisma.recado.update({
        where: { id: String(id) },
        data: {
          publico: Boolean(publico)
        }
      });

      console.log('✅ [RECADOS-TOGGLE] Visibilidade alterada com sucesso:', { id: recadoAtualizado.id, publico: recadoAtualizado.publico });
      return res.status(200).json({ ok: true, recado: recadoAtualizado });
    } catch (error) {
      console.error('❌ [RECADOS-TOGGLE] Erro ao alterar visibilidade:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
} 