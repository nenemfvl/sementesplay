# 🚀 Configuração Completa do Mercado Pago - SementesPLAY

## 📋 **Pré-requisitos**
- Conta no Mercado Pago (https://www.mercadopago.com.br)
- Acesso ao painel administrativo do Vercel
- Projeto já configurado no Vercel

---

## 🔑 **1. Configuração das Variáveis de Ambiente**

### **No Vercel Dashboard:**
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto `SementesPLAY`
3. Vá em **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

```bash
# 🔑 Access Token do Mercado Pago (OBRIGATÓRIO)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 🌍 Ambiente (OPCIONAL - padrão: production)
MERCADOPAGO_ENVIRONMENT=production

# 🔔 URL do Webhook (OPCIONAL - padrão: automático)
MERCADOPAGO_WEBHOOK_URL=https://sementesplay.com.br/api/mercadopago/webhook
```

---

## 🏗️ **2. Estrutura de Arquivos Já Implementada**

✅ **Arquivos existentes:**
- `pages/api/mercadopago/pix.ts` - Geração de PIX
- `pages/api/mercadopago/webhook.ts` - Processamento de notificações
- `pages/api/mercadopago/verificar-pagamento.ts` - Verificação de status

---

## ⚙️ **3. Configuração no Mercado Pago**

### **3.1 Obter Access Token:**
1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Faça login na sua conta
3. Copie o **Access Token** (começa com `APP_USR-`)

### **3.2 Configurar Webhook (Opcional):**
1. No painel do Mercado Pago, vá em **Webhooks**
2. Adicione a URL: `https://sementesplay.com.br/api/mercadopago/webhook`
3. Selecione os eventos: `payment.created`, `payment.updated`

---

## 🧪 **4. Teste da Integração**

### **4.1 Teste Local (Desenvolvimento):**
```bash
# Instalar dependências
npm install

# Configurar variável local
export MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Testar endpoint PIX
curl -X POST http://localhost:3000/api/mercadopago/pix \
  -H "Content-Type: application/json" \
  -d '{
    "repasseId": "test-123",
    "parceiroId": "test-parceiro",
    "usuarioId": "test-user",
    "valor": 50.00
  }'
```

### **4.2 Teste em Produção:**
1. Faça deploy no Vercel
2. Teste o endpoint: `https://sementesplay.com.br/api/mercadopago/pix`
3. Verifique os logs no Vercel Dashboard

---

## 🔍 **5. Monitoramento e Logs**

### **5.1 Logs no Vercel:**
- Acesse: https://vercel.com/dashboard
- Selecione seu projeto
- Vá em **Functions** → **View Function Logs**

### **5.2 Logs do Mercado Pago:**
- Painel: https://www.mercadopago.com.br/developers/panel
- Seção: **Logs de API**

---

## 🚨 **6. Tratamento de Erros Comuns**

### **6.1 "Access Token não configurado":**
```bash
# Verificar se a variável está configurada no Vercel
# Settings → Environment Variables → MERCADOPAGO_ACCESS_TOKEN
```

### **6.2 "Erro na API do Mercado Pago":**
- Verificar se o Access Token é válido
- Confirmar se a conta está ativa
- Verificar limites de API

### **6.3 "Webhook não recebido":**
- Confirmar se a URL está correta
- Verificar se o domínio está acessível
- Testar com ferramentas como webhook.site

---

## 📱 **7. Integração no Frontend**

### **7.1 Componente de Pagamento:**
```tsx
import { useState } from 'react'

export default function PagamentoPIX() {
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [error, setError] = useState('')

  const gerarPIX = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mercadopago/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repasseId: 'repasse-123',
          parceiroId: 'parceiro-123',
          usuarioId: 'user-123',
          valor: 50.00
        })
      })
      
      const data = await response.json()
      if (data.qr_code) {
        setQrCode(data.qr_code)
      } else {
        setError(data.error || 'Erro ao gerar PIX')
      }
    } catch (err) {
      setError('Erro na requisição')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Pagamento via PIX</h2>
      
      <button
        onClick={gerarPIX}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Gerando...' : 'Gerar PIX'}
      </button>

      {qrCode && (
        <div className="mt-4 text-center">
          <img src={qrCode} alt="QR Code PIX" className="mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Escaneie o QR Code para pagar</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}
```

---

## 🔐 **8. Segurança e Boas Práticas**

### **8.1 Validações:**
- ✅ Sempre validar dados de entrada
- ✅ Verificar autenticação do usuário
- ✅ Usar HTTPS em produção
- ✅ Implementar rate limiting

### **8.2 Logs Seguros:**
- ❌ Não logar dados sensíveis
- ✅ Logar apenas IDs e status
- ✅ Usar variáveis de ambiente para configurações

---

## 📊 **9. Status da Implementação**

| Funcionalidade | Status | Arquivo |
|----------------|--------|---------|
| ✅ Geração de PIX | Implementado | `pages/api/mercadopago/pix.ts` |
| ✅ Webhook | Implementado | `pages/api/mercadopago/webhook.ts` |
| ✅ Verificação | Implementado | `pages/api/mercadopago/verificar-pagamento.ts` |
| 🔄 Frontend | Pendente | Criar componentes de UI |
| 🔄 Testes | Pendente | Implementar testes automatizados |

---

## 🎯 **10. Próximos Passos**

1. **Configurar variáveis no Vercel** ✅
2. **Testar endpoints** ✅
3. **Implementar UI de pagamento** 🔄
4. **Adicionar testes** 🔄
5. **Monitoramento em produção** 🔄

---

## 📞 **Suporte**

- **Mercado Pago:** https://www.mercadopago.com.br/developers/support
- **Vercel:** https://vercel.com/support
- **Documentação:** https://www.mercadopago.com.br/developers/docs

---

**🎉 Configuração concluída! Seu site agora está integrado ao Mercado Pago!**
