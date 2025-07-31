import { NextApiRequest, NextApiResponse } from 'next'
import cloudinary from '../../lib/cloudinary'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { image } = req.body

    if (!image) {
      return res.status(400).json({ error: 'Imagem é obrigatória' })
    }

    // Upload para o Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'sementesplay/comprovantes',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    })

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    })

  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return res.status(500).json({ error: 'Erro ao fazer upload da imagem' })
  }
} 