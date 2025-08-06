# 🚀 Configuração Completa do Domínio sementesplay.com.br

## 📋 Checklist de Configuração

### ✅ 1. Vercel (Principal)
- [ ] Adicionar domínio no painel da Vercel
- [ ] Configurar nameservers na Hostinger
- [ ] Atualizar `NEXT_PUBLIC_BASE_URL` para `https://sementesplay.com.br`
- [ ] Aguardar propagação DNS (até 24h)

### ✅ 2. Resend (Emails)
- [ ] Adicionar domínio no painel do Resend
- [ ] Configurar registros DNS na Hostinger:
  - TXT para verificação
  - CNAME para email e link
  - MX para recebimento
- [ ] Aguardar verificação (até 24h)
- [ ] Testar envio de emails

### ✅ 3. Railway (Banco de Dados)
- [ ] Verificar se o banco está funcionando
- [ ] Manter configuração atual (não precisa mudar)

## 🔧 Configurações DNS na Hostinger

### Nameservers do Vercel:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
ns3.vercel-dns.com
ns4.vercel-dns.com
```

### Registros do Resend (após adicionar no painel):
```
TXT: @ → resend-verification=abc123...
CNAME: email → track.resend.com
CNAME: link → track.resend.com
MX: @ → inbound.resend.com (prioridade 10)
```

## 🌐 URLs Finais

- **Site Principal**: https://sementesplay.com.br
- **Site com www**: https://www.sementesplay.com.br (redireciona automaticamente)
- **Emails**: noreply@sementesplay.com.br, suporte@sementesplay.com.br
- **Banco de Dados**: Railway (já configurado)

## 📧 Teste de Email

Após a verificação do Resend, teste o envio:

```bash
# O sistema já está configurado para usar:
# from: 'SementesPLAY <noreply@sementesplay.com.br>'
```

## 🚀 Comandos para Aplicar

```bash
git add .
git commit -m "feat: configura domínio sementesplay.com.br completo"
git push
```

## ⏰ Tempo Estimado

- **Vercel**: 1-2 horas (após configurar nameservers)
- **Resend**: 24 horas (verificação DNS)
- **Total**: 24-48 horas para estar 100% funcional

## 🔍 Verificações

1. **Site funcionando**: https://sementesplay.com.br
2. **SSL ativo**: https:// (automático no Vercel)
3. **Emails enviando**: Teste recuperação de senha
4. **Banco funcionando**: Verificar painel admin

## 📞 Suporte

Se precisar de ajuda:
- **Vercel**: https://vercel.com/support
- **Resend**: https://resend.com/support
- **Hostinger**: https://hpanel.hostinger.com/support 