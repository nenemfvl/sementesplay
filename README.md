# SementesPLAY 🎮

Plataforma completa para streamers e influenciadores com estatísticas reais, rankings dinâmicos, conquistas, favoritos e muito mais!

## 🚀 Funcionalidades Implementadas

### ✅ Backend (NestJS + SQLite)
- **Autenticação JWT** - Cadastro, login, proteção de rotas
- **Estatísticas Reais** - Visualizações, seguidores, curtidas, engajamento
- **Rankings Dinâmicos** - Múltiplas categorias com posições e mudanças
- **Conquistas** - Sistema de gamificação com pontos
- **Favoritos** - Gerenciamento de itens favoritos
- **Upload de Avatar** - Sistema de imagens de perfil
- **Banco de Dados SQLite** - Persistência completa

### ✅ Frontend (Next.js + React)
- **Interface Moderna** - Design responsivo com gradientes e glassmorphism
- **Feedback Visual** - Toasts, loaders, animações
- **Navegação Global** - Menu com autenticação
- **Dashboard Interativo** - Estatísticas em tempo real
- **Rankings Visuais** - Medalhas, posições, mudanças
- **Conquistas Gamificadas** - Progresso visual e animações
- **Favoritos Interativos** - Adicionar/remover com feedback

## 🛠️ Como Executar

### 1. Backend
```bash
cd backend
npm install
npm run start:dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Inicializar Banco de Dados
```bash
cd backend
npx ts-node src/init-db.ts
```

## 🧪 Como Testar

### 1. Acesse o Frontend
- URL: `http://localhost:3000`
- Navegue para `/cadastro` ou `/login`

### 2. Use as Contas de Teste
```
Email: user1@example.com até user5@example.com
Senha: senha123
```

### 3. Teste as Funcionalidades

#### 📊 Dashboard
- Visualize estatísticas reais
- Veja seus rankings em diferentes categorias
- Acompanhe progresso de conquistas

#### 📈 Estatísticas
- Filtre por categoria (visualizações, seguidores, etc.)
- Compare com outros usuários
- Veja rankings detalhados

#### 🏆 Rankings
- Explore diferentes categorias
- Veja posições e mudanças
- Compare com outros streamers

#### 🎯 Conquistas
- Desbloqueie conquistas
- Veja progresso visual
- Ganhe pontos

#### ❤️ Favoritos
- Adicione/remova favoritos
- Veja feedback visual
- Gerencie sua lista

## 🔧 Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para banco de dados
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **multer** - Upload de arquivos

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Hooks** - Gerenciamento de estado
- **Context API** - Estado global

## 📁 Estrutura do Projeto

```
SementesPLAY/
├── backend/
│   ├── src/
│   │   ├── entities/          # Entidades do banco
│   │   ├── controllers/       # Endpoints da API
│   │   ├── services/          # Lógica de negócio
│   │   └── utils/             # Utilitários
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/              # Páginas Next.js
│   │   ├── components/       # Componentes React
│   │   ├── contexts/         # Contextos globais
│   │   └── utils/            # Utilitários
│   └── package.json
└── README.md
```

## 🎨 Design System

- **Cores**: Gradientes roxo/azul/índigo
- **Efeitos**: Glassmorphism, backdrop-blur
- **Animações**: Hover, scale, transitions
- **Feedback**: Toasts coloridos, loaders animados
- **Responsivo**: Mobile-first design

## 🔒 Segurança

- **JWT Tokens** - Autenticação segura
- **Hash de Senhas** - bcrypt com salt
- **Validação** - Dados sanitizados
- **CORS** - Configurado adequadamente
- **Proteção de Rotas** - Middleware de autenticação

## 📱 Responsividade

- **Desktop** - Layout completo com grids
- **Tablet** - Adaptação de colunas
- **Mobile** - Stack vertical otimizado

## 🚀 Próximos Passos

1. **Notificações em Tempo Real** - WebSockets
2. **Painel do Apoiador** - Gestão de patrocínios
3. **FAQ Dinâmico** - Sistema de perguntas
4. **Refinamentos Visuais** - Mais animações
5. **Testes Automatizados** - Jest + Testing Library

## 🐛 Problemas Conhecidos

- Nenhum problema crítico identificado
- Sistema estável e funcional

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Se o backend está rodando na porta 3001
2. Se o frontend está rodando na porta 3000
3. Se o banco de dados foi inicializado
4. Se as dependências foram instaladas

---

**SementesPLAY** - Transformando streamers em estrelas! ⭐ 