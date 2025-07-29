# 🌱 SementesPLAY

Sistema de cashback e doações baseado no SSS da Wemade para o ecossistema FiveM.

<!-- Forçar redeploy - $(date) -->

## 🚀 Como Funciona

O SementesPLAY é um sistema cíclico que conecta:
- **Jogadores**: Recebem 10% de cashback em compras FiveM
- **Criadores de Conteúdo**: Recebem doações dos jogadores
- **Parceiros**: Donos de cidades FiveM que geram códigos de cashback

## ✨ Funcionalidades

### Para Usuários
- ✅ Receber 10% de cashback em compras FiveM
- ✅ Doar Sementes para criadores favoritos
- ✅ Visualizar ranking de criadores
- ✅ Resgatar dinheiro real com códigos

### Para Criadores
- ✅ Receber doações dos usuários
- ✅ Sistema de níveis (Comum, Parceiro, Supremo)
- ✅ Benefícios baseados no ranking
- ✅ Estatísticas de engajamento

### Para Parceiros (Donos de Cidades)
- ✅ Painel exclusivo de administração
- ✅ Gerar códigos de cashback
- ✅ Relatórios de vendas e comissões
- ✅ Dashboard de performance

## 🛠️ Tecnologias

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: API Routes, Prisma
- **Banco de Dados**: SQLite (dev) / PostgreSQL (prod)
- **Autenticação**: NextAuth.js
- **Validação**: Zod
- **Animações**: Framer Motion

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/sementesplay.git
cd sementesplay
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

4. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

5. **Execute o projeto**
```bash
npm run dev
```

O site estará disponível em: http://localhost:3000

## 📁 Estrutura do Projeto

```
sementesplay/
├── components/          # Componentes React
├── pages/              # Páginas Next.js
│   ├── api/           # API Routes
│   ├── auth/          # Páginas de autenticação
│   ├── dashboard/     # Dashboards
│   └── ranking/       # Página de ranking
├── lib/               # Utilitários e configurações
├── prisma/            # Schema do banco de dados
├── styles/            # Estilos globais
├── types/             # Tipos TypeScript
└── public/            # Arquivos estáticos
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Build para produção
npm run start        # Executa em modo produção
npm run lint         # Executa o linter
npm run db:generate  # Gera cliente Prisma
npm run db:push      # Sincroniza banco de dados
npm run db:studio    # Abre Prisma Studio
```

## 🗄️ Banco de Dados

### Tabelas Principais

- **usuarios**: Dados dos usuários
- **criadores**: Perfis de criadores de conteúdo
- **parceiros**: Perfis de donos de cidades
- **sementes**: Histórico de transações de Sementes
- **doacoes**: Registro de doações entre usuários
- **transacoes**: Histórico de transações financeiras
- **codigos_cashback**: Códigos gerados pelos parceiros
- **notificacoes**: Sistema de notificações

## 🔐 Autenticação

O sistema usa NextAuth.js com:
- Login/Registro por email e senha
- Sessões seguras
- Proteção de rotas por tipo de usuário
- Middleware de autenticação

## 🎨 Design System

### Cores
- **Sementes**: Verde (#22c55e)
- **Cashback**: Dourado (#eab308)
- **Supremo**: Roxo (#a855f7)
- **Parceiro**: Azul (#3b82f6)
- **Comum**: Cinza (#6b7280)

### Componentes
- Botões primários e secundários
- Cards informativos
- Badges de status
- Formulários padronizados
- Tabelas responsivas

## 📊 Sistema de Ranking

### Cálculo de Pontuação
```
Pontuação = (Doações Recebidas × 0.1) + (Apoiadores Únicos × 10) + (Favoritos × 5)
```

### Níveis
- **Supremo**: Top 100 criadores
- **Parceiro**: Top 101-300 criadores  
- **Comum**: Demais criadores

## 💰 Sistema de Cashback

### Fluxo
1. Usuário compra em cidade FiveM parceira
2. Parceiro gera código único
3. Usuário recebe 10% em Sementes
4. Usuário pode doar ou resgatar

### Resgate
- Código único por transação
- Validação automática
- Processamento em 24h
- Taxa de 10% para manutenção

## 🔄 Ciclos e Temporadas

- **Duração**: 30 dias por ciclo
- **Reset**: Pontuações zeram a cada ciclo
- **Níveis**: Mantidos durante todo o ciclo
- **Recompensas**: Distribuídas no final do ciclo

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas
- Netlify
- Railway
- Heroku

## 📈 Monitoramento

- Logs de erro automáticos
- Métricas de performance
- Alertas de sistema
- Relatórios de uso

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: [docs.sementesplay.com](https://docs.sementesplay.com)
- **Email**: suporte@sementesplay.com
- **Discord**: [SementesPLAY Community](https://discord.gg/sementesplay)

## 🗺️ Roadmap

### Versão 1.0 (Atual)
- ✅ Sistema básico de autenticação
- ✅ Dashboard de usuários
- ✅ Sistema de doações
- ✅ Ranking de criadores

### Versão 1.1 (Próxima)
- 🔄 Painel de parceiros
- 🔄 Sistema de resgate
- 🔄 Notificações em tempo real
- 🔄 Relatórios avançados

### Versão 2.0 (Futuro)
- 📋 Integração com APIs FiveM
- 📋 Sistema de missões
- 📋 Marketplace de criadores
- 📋 App mobile

---

**Desenvolvido com ❤️ para a comunidade FiveM** 