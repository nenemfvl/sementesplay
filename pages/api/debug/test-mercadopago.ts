import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // Verificar variáveis de ambiente
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const environment = process.env.MERCADOPAGO_ENVIRONMENT || 'production'
    const vercelUrl = process.env.VERCEL_URL
    
    const config = {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken ? accessToken.length : 0,
      accessTokenPrefix: accessToken ? accessToken.substring(0, 10) + '...' : 'NÃO CONFIGURADO',
      environment: environment,
      vercelUrl: vercelUrl || 'NÃO CONFIGURADO',
      webhookUrl: `${vercelUrl ? `https://${vercelUrl}` : 'https://sementesplay.com.br'}/api/mercadopago/webhook`
    }

    // Se não tiver access token, retornar erro
    if (!accessToken) {
      return res.status(500).json({ 
        error: 'MERCADOPAGO_ACCESS_TOKEN não configurado',
        config: config,
        solution: 'Configure a variável MERCADOPAGO_ACCESS_TOKEN no Vercel Dashboard'
      })
    }

    // Testar conexão com a API do MercadoPago
    try {
      const testResponse = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (testResponse.ok) {
        const paymentMethods = await testResponse.json()
        
        return res.status(200).json({
          success: true,
          message: 'Configuração do MercadoPago está funcionando',
          config: config,
          apiTest: {
            status: 'SUCCESS',
            statusCode: testResponse.status,
            paymentMethodsCount: paymentMethods.length,
            pixAvailable: paymentMethods.some((method: any) => method.id === 'pix')
          }
        })
      } else {
        const errorData = await testResponse.json()
        return res.status(400).json({
          error: 'Erro na API do MercadoPago',
          config: config,
          apiTest: {
            status: 'ERROR',
            statusCode: testResponse.status,
            error: errorData
          }
        })
      }
    } catch (apiError) {
      return res.status(500).json({
        error: 'Erro ao conectar com a API do MercadoPago',
        config: config,
        apiTest: {
          status: 'CONNECTION_ERROR',
          error: apiError instanceof Error ? apiError.message : 'Erro desconhecido'
        }
      })
    }

  } catch (error) {
    console.error('Erro no teste do MercadoPago:', error)
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}
