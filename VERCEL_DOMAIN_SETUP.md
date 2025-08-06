# Configuração do Domínio no Vercel

## Passo a Passo para sementesplay.com.br

### 1. Acesse o Painel da Vercel
- Vá para https://vercel.com/dashboard
- Selecione seu projeto SementesPLAY

### 2. Vá para Configurações de Domínio
- Clique em "Settings" (Configurações)
- Vá para a aba "Domains"

### 3. Adicione o Domínio
- Clique em "Add Domain"
- Digite: `sementesplay.com.br`
- Clique em "Add"

### 4. Configure os Nameservers na Hostinger

O Vercel vai te mostrar os nameservers necessários. Configure na Hostinger:

#### Nameservers do Vercel:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
ns3.vercel-dns.com
ns4.vercel-dns.com
```

### 5. Como Configurar na Hostinger:

1. **Acesse o Painel da Hostinger**
   - Faça login em https://hpanel.hostinger.com

2. **Vá para Gerenciamento de Domínios**
   - Clique em "Domains"
   - Selecione `sementesplay.com.br`

3. **Configure os Nameservers**
   - Clique em "DNS / Nameservers"
   - Selecione "Use custom nameservers"
   - Adicione os 4 nameservers do Vercel

4. **Aguarde a Propagação**
   - Pode levar até 24 horas
   - O domínio aparecerá como "Valid" no Vercel

### 6. Configurações Adicionais

#### Redirecionamento www:
- O Vercel automaticamente redireciona `www.sementesplay.com.br` para `sementesplay.com.br`

#### SSL/HTTPS:
- O Vercel fornece SSL automático
- Não precisa configurar nada adicional

### 7. Variáveis de Ambiente

Atualize no painel da Vercel:
```
NEXT_PUBLIC_BASE_URL=https://sementesplay.com.br
```

## Comandos para Aplicar as Mudanças

```bash
git add .
git commit -m "feat: adiciona guias de configuração de domínio"
git push
``` 