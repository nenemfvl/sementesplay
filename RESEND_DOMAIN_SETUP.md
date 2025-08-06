# Configuração do Domínio no Resend

## Passo a Passo para sementesplay.com.br

### 1. Acesse o Painel do Resend
- Vá para https://resend.com/domains
- Faça login na sua conta

### 2. Adicione o Domínio
- Clique em "Add Domain"
- Digite: `sementesplay.com.br`
- Clique em "Add Domain"

### 3. Configure os Registros DNS na Hostinger

O Resend vai te mostrar os registros DNS necessários. Configure na Hostinger:

#### Registros TXT para verificação:
```
Tipo: TXT
Nome: @
Valor: resend-verification=abc123... (valor fornecido pelo Resend)
TTL: 3600
```

#### Registros CNAME para subdomínios:
```
Tipo: CNAME
Nome: email
Valor: track.resend.com
TTL: 3600
```

```
Tipo: CNAME
Nome: link
Valor: track.resend.com
TTL: 3600
```

#### Registros MX para recebimento:
```
Tipo: MX
Nome: @
Valor: inbound.resend.com
Prioridade: 10
TTL: 3600
```

### 4. Aguarde a Verificação
- Pode levar até 24 horas
- O status mudará para "Verified" quando estiver pronto

### 5. Atualize o Código
Após a verificação, você poderá usar:
- `noreply@sementesplay.com.br`
- `suporte@sementesplay.com.br`
- `contato@sementesplay.com.br`

## Comandos para Aplicar as Mudanças

```bash
git add .
git commit -m "feat: configura domínio sementesplay.com.br no vercel.json"
git push
``` 