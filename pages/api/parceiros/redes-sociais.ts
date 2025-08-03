import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { parceiroId, redesSociais } = req.body;

    if (!parceiroId) {
      return res.status(400).json({ error: 'ID do parceiro é obrigatório' });
    }

    if (!redesSociais) {
      return res.status(400).json({ error: 'Dados das redes sociais são obrigatórios' });
    }

    // Validar URLs (opcional)
    const { instagram, twitch, youtube, tiktok } = redesSociais;
    
    const urlPattern = /^https?:\/\/.+/;
    
    if (instagram && !urlPattern.test(instagram)) {
      return res.status(400).json({ error: 'URL do Instagram inválida' });
    }
    
    if (twitch && !urlPattern.test(twitch)) {
      return res.status(400).json({ error: 'URL da Twitch inválida' });
    }
    
    if (youtube && !urlPattern.test(youtube)) {
      return res.status(400).json({ error: 'URL do YouTube inválida' });
    }
    
    if (tiktok && !urlPattern.test(tiktok)) {
      return res.status(400).json({ error: 'URL do TikTok inválida' });
    }

    // Atualizar o parceiro com as redes sociais
    const parceiroAtualizado = await prisma.parceiro.update({
      where: { id: parceiroId },
      data: {
        instagram: instagram || null,
        twitch: twitch || null,
        youtube: youtube || null,
        tiktok: tiktok || null,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            avatarUrl: true,
          }
        }
      }
    });

    return res.status(200).json({
      message: 'Redes sociais atualizadas com sucesso',
      parceiro: parceiroAtualizado
    });

  } catch (error) {
    console.error('Erro ao atualizar redes sociais:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 