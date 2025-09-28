# 🌱 SementesPLAY

> **Sistema de repasses automáticos** - Processamento imediato via webhook
> **Deploy estável** - Sistema funcionando perfeitamente
> **Proteção de rotas** - Autenticação robusta implementada
> **Reset para commit bab85225** - Sistema restaurado para estado estável

Sistema de cashback e doações baseado no SSS da Wemade para o ecossistema FiveM.

<!-- Sistema estável - Reset para commit 4059e7f - 2025-01-26 -->
<!-- Deploy funcionando - Processamento automático ativo -->
<!-- Proteção de autenticação implementada -->

## 🚀 Como Funciona

O SementesPLAY é um sistema cíclico que conecta:

- **Jogadores**: Recebem 10% de cashback em compras FiveM
- **Criadores de Conteúdo**: Recebem doações dos jogadores
- **Parceiros**: Donos de cidades FiveM que efetuam repasses de cashback

## ✨ Funcionalidades

### Para Usuários

- ✅ Receber 10% de cashback em compras FiveM
- ✅ Doar Sementes para criadores favoritos
- ✅ Visualizar ranking de criadores
- ✅ Pagamentos seguros via PIX

### Sistema de Pagamentos

- ✅ **Mercado Pago integrado** com PIX automático
- ✅ **Webhooks em tempo real** para processamento
- ✅ **Sistema de repasses** para parceiros
- ✅ **Processamento automático** de transações

### Taxas e Saques

- ✅ **Taxa de saque para criadores**: 10% do valor solicitado
- ✅ **Valor mínimo para saque**: R$ 50,00
- ✅ **Processamento**: Até 24 horas após aprovação
- ✅ **Forma de pagamento**: PIX automático

### Para Criadores

- ✅ Receber doações dos usuários
- ✅ Sistema de níveis (Iniciante, Comum, Parceiro, Supremo)
- ✅ Benefícios baseados no ranking
- ✅ Estatísticas de engajamento
- ✅ **Sistema de saques** com taxa de 10% via PIX

### Para Parceiros (Donos de Cidades)

- ✅ Painel exclusivo de administração
- ✅ Efetuar repasses de cashback (10% da compra)
- ✅ Relatórios de vendas e repasses
- ✅ Dashboard de performance

## 🛠️ Tecnologias

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: API Routes, Prisma
- **Banco de Dados**: SQLite (dev) / PostgreSQL (prod)
- **Autenticação**: NextAuth.js
- **Validação**: Zod
- **Animações**: Framer Motion
- **Pagamentos**: Mercado Pago (PIX, Webhooks)

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

1. **Instale as dependências**

```bash
npm install
```

1. **Configure as variáveis de ambiente**

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

1. **Configure o banco de dados**

```bash
npx prisma generate
npx prisma db push
```

1. **Execute o projeto**

```bash
npm run dev
```

site estará disponível em: <http://localhost:3000>

## 📁 Estrutura do Projeto

```text
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
- **codigos_cashback**: Códigos de compra dos usuários
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
- **Criador Supremo**: Roxo (#a855f7)
- **Criador Parceiro**: Azul (#3b82f6)
- **Criador Comum**: Verde (#22c55e)
- **Criador Iniciante**: Cinza (#6b7280)

### Componentes

- Botões primários e secundários
- Cards informativos
- Badges de status
- Formulários padronizados
- Tabelas responsivas

## 📊 Sistema de Ranking

### Cálculo de Pontuação

```text
Pontuação = Sementes Recebidas + Pontos do Usuário + (Visualizações × 0.1) + (Enquetes × 5) + (Recados Públicos × 2)
```

### Níveis

- **Criador Supremo**: Top 1-50 criadores
- **Criador Parceiro**: Top 51-100 criadores  
- **Criador Comum**: Top 101-150 criadores
- **Criador Iniciante**: Top 151+ criadores

### Filtro de Conteúdo

- ✅ **Criadores só aparecem no ranking se tiverem pelo menos 1 conteúdo postado**
- ✅ **Parceiros só aparecem no ranking se fizeram pelo menos 1 repasse**
- ✅ **Sistema mais justo e relevante** após resets de ciclo
- ✅ **Incentiva produção de conteúdo ativa**
- ✅ **Incentiva parceiros a serem ativos**
- ✅ **Ranking dinâmico** que se constrói organicamente

## 💰 Sistema de Cashback

### Fluxo

1. Usuário compra em cidade FiveM parceira
1. Usuário envia comprovante da compra
1. Parceiro efetua repasse de 10% do valor
1. Usuário recebe 10% em Sementes
1. Usuário pode doar para criadores

### Resgate (Apenas Criadores)

- Comprovante de compra obrigatório
- Validação manual pelo parceiro
- Processamento em 24h após repasse
- Taxa de 10% para manutenção
- **Exclusivo para criadores de conteúdo**

## 🔄 Ciclos e Temporadas

- **Duração**: 15 dias por ciclo
- **Reset Parcial**: Pontuações e doações zeram, sementes são mantidas
- **Níveis**: Resetados para "criador-iniciante" a cada ciclo
- **Rankings**: Só aparecem quem participa ativamente (faz doações)
- **Igualdade**: Sistema justo para novos usuários
- **Recompensas**: Distribuídas no final do ciclo

## ⚖️ Sistema Justo para Novos Usuários

### 🎯 Igualdade de Oportunidades
- ✅ **Todos começam do zero** a cada ciclo de 15 dias
- ✅ **Pontuações zeradas** para todos os usuários
- ✅ **Sementes mantidas** para todos os usuários
- ✅ **Doações deletadas** para ranking limpo
- ✅ **Rankings filtrados** por participação ativa

### 🔄 Benefícios do Sistema Cíclico
- 🎯 **Novos usuários** não ficam em desvantagem
- 🏆 **Competição justa** baseada em atividade atual
- 📊 **Rankings relevantes** mostram apenas participantes reais
- ⚖️ **Igualdade garantida** a cada reset de ciclo

## 🚀 Deploy

### Vercel (Atual)

- ✅ **Deploy automático** a cada 5 minutos via CRON
- ✅ **Integração contínua** com GitHub
- ✅ **Cache otimizado** para performance
- ✅ **Variáveis de ambiente** configuradas

### Configuração

1. **Conecte o repositório** ao Vercel
2. **Configure as variáveis de ambiente**:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `RESEND_API_KEY`
3. **Deploy automático** ativado

### Status Atual

- **Domínio**: [sementesplay.vercel.app](https://sementesplay.vercel.app)
- **Status**: ✅ Funcionando perfeitamente
- **Cache**: ✅ Resolvido e otimizado

## 📈 Monitoramento

- Logs de erro automáticos
- Métricas de performance
- Alertas de sistema
- Relatórios de uso

## 🤝 Contribuição

1. Fork o projeto
1. Crie uma branch para sua feature
1. Commit suas mudanças
1. Push para a branch
1. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: [docs.sementesplay.com](https://docs.sementesplay.com)
- **Email**: [suporte@sementesplay.com](mailto:suporte@sementesplay.com)
- **Discord**: [SementesPLAY Community](https://discord.gg/sementesplay)

## 🗺️ Roadmap

### Versão 1.0 ✅ (Concluída)

- ✅ Sistema básico de autenticação
- ✅ Dashboard de usuários
- ✅ Sistema de doações
- ✅ Ranking de criadores
- ✅ Sistema de níveis dinâmicos
- ✅ Painel de parceiros
- ✅ Sistema de saques para criadores
- ✅ Integração MercadoPago (PIX)
- ✅ Webhooks em tempo real
- ✅ Sistema de notificações

### Versão 1.1 🔄 (Em Desenvolvimento)

- 🔄 Painel administrativo avançado
- 🔄 Sistema de logs e auditoria
- 🔄 Relatórios detalhados de performance
- 🔄 Otimizações de performance
- 🔄 Sistema de cache inteligente

### Versão 1.2 📋 (Próxima)

- 📋 Sistema de missões para usuários
- 📋 Conquistas e badges
- 📋 Gamificação avançada
- 📋 Integração com APIs FiveM
- 📋 Sistema de eventos sazonais

### Versão 2.0 🚀 (Futuro)

- 🚀 Marketplace de criadores
- 🚀 App mobile nativo
- 🚀 Sistema de streaming integrado
- 🚀 IA para recomendações
- 🚀 Integração com outras plataformas

---

## 🎯 Desenvolvido com ❤️ para a comunidade FiveM

## Sistema de Níveis Atualizado
Sistema agora exibe níveis baseados na posição do ranking em tempo real.

**Última alteração**: Implementação de níveis dinâmicos baseados no ranking de criadores.

## 🔧 Correções Recentes
- ✅ Resolvido problema de bordas pretas em imagens
- ✅ Otimização de thumbnails do YouTube
- ✅ Melhorias na responsividade dos componentes
- ✅ Volta para commit estável: f295da64
- ✅ Sistema de níveis automáticos funcionando perfeitamente
- ✅ Taxa de saque atualizada para 10%
- ✅ Reset para commit: 0469058814acddec2dca4eeac5a0cda284cf1b72
- ✅ Sistema estável e funcionando perfeitamente
- ✅ Reset para commit: 008400f93757c3e003c326a05b97b9a6f377304e
- ✅ Retorno ao estado anterior conforme solicitado
- ✅ Sistema restaurado com sucesso - $(date)