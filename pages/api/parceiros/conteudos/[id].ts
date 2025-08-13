import { prisma } from '../../../../lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID obrigatório' });
      }

      // Verificar se o conteúdo existe
      const conteudo = await prisma.conteudoParceiro.findUnique({
        where: { id },
        include: {
          parceiro: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true
                }
              }
            }
          }
        }
      });

      if (!conteudo) {
        return res.status(404).json({ error: 'Conteúdo não encontrado' });
      }

      // Remover o conteúdo
      await prisma.conteudoParceiro.delete({ 
        where: { id } 
      });

      // Log de auditoria
      await prisma.logAuditoria.create({
        data: {
          usuarioId: conteudo.parceiro.usuario.id,
          acao: 'DELETAR_CONTEUDO_PARCEIRO',
          detalhes: `Conteúdo de parceiro deletado. ID: ${id}, Título: ${conteudo.titulo}, Parceiro: ${conteudo.parceiro.usuario.nome}`,
          nivel: 'warning'
        }
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Erro ao remover conteúdo de parceiro:', error);
      return res.status(500).json({ error: 'Erro ao remover conteúdo' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
