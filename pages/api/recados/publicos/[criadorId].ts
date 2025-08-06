import { prisma } from '../../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { criadorId } = req.query;

  if (!criadorId || typeof criadorId !== 'string') {
    return res.status(400).json({ error: 'ID do criador é obrigatório' });
  }

  try {
    console.log('🔍 [RECADOS-PUBLICOS] Buscando perguntas públicas do criador:', criadorId);

    // Verificar se o criador existe
    const criador = await prisma.usuario.findUnique({
      where: { id: criadorId }
    });

    if (!criador) {
      console.log('❌ [RECADOS-PUBLICOS] Criador não encontrado:', criadorId);
      return res.status(404).json({ error: 'Criador não encontrado' });
    }

    // Buscar apenas recados públicos que têm resposta
    const recadosPublicos = await prisma.recado.findMany({
      where: {
        destinatarioId: criadorId,
        publico: true,
        resposta: {
          not: null
        }
      },
      include: {
        remetente: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        dataResposta: 'desc'
      }
    });

    console.log(`✅ [RECADOS-PUBLICOS] Encontrados ${recadosPublicos.length} recados públicos`);

    const recadosFormatados = recadosPublicos.map((recado: any) => ({
      id: recado.id,
      pergunta: recado.mensagem,
      resposta: recado.resposta,
      dataResposta: recado.dataResposta,
      remetenteNome: recado.remetente.nome
    }));

    return res.status(200).json({ 
      recados: recadosFormatados,
      total: recadosFormatados.length
    });

  } catch (error) {
    console.error('❌ [RECADOS-PUBLICOS] Erro ao buscar recados públicos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 