import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import formidable from 'formidable'
import { uploadToCloudinary } from '../../../lib/cloudinary'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const form = formidable({
      maxFiles: 1,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    })

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Erro ao processar upload:', err)
        return res.status(500).json({ error: 'Erro ao processar arquivo' })
      }

      const { repasseId, parceiroId } = fields
      const comprovante = Array.isArray(files.comprovante) ? files.comprovante[0] : files.comprovante

      if (!repasseId || !parceiroId || !comprovante) {
        return res.status(400).json({ error: 'Dados obrigatórios ausentes' })
      }

      try {
        // Verificar se o repasse existe e pertence ao parceiro
        const repasse = await prisma.repasseParceiro.findFirst({
          where: {
            id: String(repasseId),
            parceiroId: String(parceiroId),
            status: 'pendente'
          }
        })

        if (!repasse) {
          return res.status(404).json({ error: 'Repasse não encontrado ou já processado' })
        }

        // Upload do arquivo para Cloudinary
        let comprovanteUrl = null
        if (comprovante.filepath) {
          try {
            const result = await uploadToCloudinary(comprovante.filepath, 'comprovantes-pix')
            comprovanteUrl = result.secure_url
          } catch (uploadError) {
            console.error('Erro no upload para Cloudinary:', uploadError)
            // Se falhar o upload, continua sem o comprovante
          }
        }

        // Atualizar o repasse com o comprovante
        await prisma.repasseParceiro.update({
          where: { id: String(repasseId) },
          data: {
            comprovanteUrl,
            status: 'confirmado',
            dataRepasse: new Date()
          }
        })

        // Atualizar status da compra relacionada
        await prisma.compraParceiro.update({
          where: { id: repasse.compraId },
          data: { status: 'cashback_liberado' }
        })

        // Criar notificação para o admin (se existir)
        try {
          await prisma.notificacao.create({
            data: {
              usuarioId: 'admin',
              tipo: 'repasse_confirmado',
              titulo: 'Novo Comprovante PIX Recebido',
              mensagem: `Parceiro enviou comprovante PIX para repasse de R$ ${repasse.valor.toFixed(2)}`,
              data: new Date()
            }
          })
        } catch (notifError) {
          console.log('Erro ao criar notificação (pode ser ignorado):', notifError)
        }

        res.status(200).json({ 
          success: true, 
          message: 'Comprovante enviado com sucesso',
          comprovanteUrl 
        })

      } catch (error) {
        console.error('Erro ao processar comprovante:', error)
        res.status(500).json({ error: 'Erro interno do servidor' })
      }
    })

  } catch (error) {
    console.error('Erro geral:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
} 