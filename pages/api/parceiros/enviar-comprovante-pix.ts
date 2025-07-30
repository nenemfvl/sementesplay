import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

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
      uploadDir: path.join(process.cwd(), 'public', 'uploads', 'comprovantes'),
      keepExtensions: true,
      maxFiles: 1,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    })

    // Criar diretório se não existir
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'comprovantes')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Erro ao processar upload:', err)
        return res.status(500).json({ error: 'Erro ao processar arquivo' })
      }

      const { repasseId, parceiroId } = fields
      const comprovante = files.comprovante as formidable.File

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

        // Salvar URL do comprovante
        const comprovanteUrl = `/uploads/comprovantes/${comprovante.newFilename}`

        // Atualizar o repasse com o comprovante
        await prisma.repasseParceiro.update({
          where: { id: String(repasseId) },
          data: {
            comprovanteUrl,
            status: 'confirmado',
            dataRepasse: new Date()
          }
        })

        // Criar notificação para o admin
        await prisma.notificacao.create({
          data: {
            usuarioId: 'admin', // Você pode ajustar isso conforme necessário
            tipo: 'repasse_confirmado',
            titulo: 'Novo Comprovante PIX Recebido',
            mensagem: `Parceiro enviou comprovante PIX para repasse de R$ ${repasse.valor.toFixed(2)}`,
            data: new Date()
          }
        })

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