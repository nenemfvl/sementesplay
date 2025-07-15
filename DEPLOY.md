# 🚀 Guia de Deploy - SementesPLAY

## 📋 Pré-requisitos
- Conta no GitHub
- Conta no Railway (https://railway.app)
- Conta no Vercel (https://vercel.com)

## 🎯 Deploy Automático

### **1. Backend (Railway)**

1. **Acesse Railway**: https://railway.app
2. **Faça login** com GitHub
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha seu repositório**
6. **Configure as variáveis de ambiente**:
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://sementesplay.vercel.app
   ```
7. **Clique em "Deploy"**

**URL do Backend**: `https://sementesplay-backend.railway.app`

### **2. Frontend (Vercel)**

1. **Acesse Vercel**: https://vercel.com
2. **Faça login** com GitHub
3. **Clique em "New Project"**
4. **Importe seu repositório**
5. **Configure**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. **Adicione variável de ambiente**:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: URL do seu backend no Railway
7. **Clique em "Deploy"**

**URL do Frontend**: `https://sementesplay.vercel.app`

## 🔧 Configurações Adicionais

### **Domínio Personalizado**
- **Vercel**: Settings → Domains → Add Domain
- **Railway**: Settings → Domains → Add Domain

### **SSL/HTTPS**
- Automático em ambas as plataformas

### **Deploy Automático**
- Ative em ambas as plataformas
- Cada push no GitHub fará deploy automático

## 📊 Monitoramento

### **Vercel Analytics**
- Dashboard com métricas de performance
- Análise de usuários

### **Railway Logs**
- Logs em tempo real
- Métricas de uso

## 💰 Custos

### **Gratuito (Início)**
- **Vercel**: 100GB bandwidth/mês
- **Railway**: $5 crédito/mês (suficiente para desenvolvimento)

### **Pago (Crescimento)**
- **Vercel Pro**: $20/mês
- **Railway**: $5-50/mês (dependendo do uso)

## 🚨 Troubleshooting

### **Erro de CORS**
- Verifique se `FRONTEND_URL` está configurada no Railway
- Confirme se a URL do frontend está correta

### **Erro de Build**
- Verifique os logs no Vercel/Railway
- Teste localmente primeiro

### **Banco de Dados**
- SQLite será criado automaticamente no Railway
- Dados persistem entre deploys

## 📞 Suporte

- **Vercel**: https://vercel.com/support
- **Railway**: https://railway.app/docs
- **GitHub Issues**: Para problemas específicos do código

---

**🎉 Seu site estará no ar em menos de 10 minutos!** 