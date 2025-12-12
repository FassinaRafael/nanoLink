# NanoLink

> O seu encurtador de URLs inteligente, rápido e seguro.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

---

<div align="center">

  [![Live Demo](https://img.shields.io/badge/Demo-Live%20Preview-blue?style=for-the-badge&logo=vercel)](https://nano-link-iota.vercel.app/)
  [![Repository](https://img.shields.io/badge/Github-Source%20Code-black?style=for-the-badge&logo=github)](https://github.com/FassinaRafael/nanoLink)

</div>

---

## 📸 Screenshots

![Dashboard](<img width="1598" height="771" alt="image" src="https://github.com/user-attachments/assets/ef3b431c-6ab0-48d5-a4b1-61bf1bc02657" />
)

---

## 🚀 Sobre o Projeto

**NanoLink** é um SaaS Full-Stack para encurtamento de URLs projetado para oferecer uma experiência simples e poderosa. Com ele, usuários podem criar contas, gerenciar seus links, acompanhar métricas de acesso em tempo real e gerar QR Codes instantaneamente.

O diferencial do NanoLink é a sua inteligência: ao encurtar um link, o sistema realiza um **Web Scraping** automático para capturar o título e o ícone do site de destino, tornando o dashboard muito mais visual e organizado.

### ✨ Funcionalidades Principais

- 🔐 **Autenticação Segura**: Login e Cadastro via E-mail/Senha gerenciados pelo Supabase Auth.
- 🔗 **Encurtamento Inteligente**: Escolha entre um código aleatório curto ou um slug personalizado (ex: `nanolink.com/promocao-verao`).
- 📊 **Analytics Detalhado**: Contador de cliques reais (redirecionamento server-side) para você saber exatamente a performance dos seus links.
- 🤖 **Web Scraping Automático**: Busca automática do `<title>` e Favicon da URL original para melhor identificação no dashboard.
- 📱 **Gerador de QR Code**: Download imediato de QR Codes para cada link encurtado.
- 🌑 **UI/UX Moderna**: Interface responsiva construída com Tailwind CSS, incluindo Dark Mode persistente e notificações visuais (Toasts).
- 🛡️ **Segurança de Dados**: Implementação de Row Level Security (RLS) no banco de dados, garantindo que cada usuário só acesse seus próprios links.

---

## 🛠️ Tecnologias Utilizadas

### Frontend (`/client`)
- **Framework:** React (Vite)
- **Estilização:** Tailwind CSS (Dark Mode manual)
- **Ícones:** Lucide React
- **Componentes:** Sonner (Toasts), QRCode.react
- **Deploy:** Vercel

### Backend (`/server`)
- **Runtime:** Node.js
- **Framework:** Express
- **Web Scraping:** Cheerio
- **Requisições:** Axios
- **Deploy:** Render

### Dados & Infraestrutura
- **Banco de Dados:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Segurança:** RLS (Row Level Security)

---

## 📦 Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente.

### Pré-requisitos
- Node.js instalado (v16 ou superior)
- Conta no [Supabase](https://supabase.com/) (Projeto criado com tabela `links` e Auth habilitado)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/nanolink.git
cd nanolink
```

### 2. Configurando o Backend (`/server`)

Navegue até a pasta do servidor, instale as dependências e configure as variáveis de ambiente.

```bash
cd server
npm install
```

Crie um arquivo `.env` na pasta `server/` e adicione:

```env
PORT=3000
SUPABASE_URL=Sua_URL_do_Supabase
SUPABASE_SERVICE_KEY=Sua_Chave_Service_Role_Supabase
```
> **Nota:** A `SUPABASE_SERVICE_KEY` é necessária para que o backend possa ler/escrever dados sem restrições de usuário logado (bypass RLS) durante o redirecionamento e atualização de contadores.

Inicie o servidor:

```bash
node index.js
```
*O servidor rodará em `http://localhost:3000`*

### 3. Configurando o Frontend (`/client`)

Abra um novo terminal, navegue até a pasta do cliente, instale as dependências e configure as variáveis.

```bash
cd client
npm install
```

Crie um arquivo `.env` na pasta `client/` e adicione:

```env
VITE_SUPABASE_URL=Sua_URL_do_Supabase
VITE_SUPABASE_ANON_KEY=Sua_Chave_Anon_Publica_Supabase
VITE_API_URL=http://localhost:3000
```

Inicie o frontend:

```bash
npm run dev
```
*O projeto estará acessível em `http://localhost:5173` (ou porta indicada pelo Vite)*

---

## 🔑 Variáveis de Ambiente

Para referência rápida, aqui estão todas as variáveis necessárias.

| Arquivo | Variável | Descrição |
|---------|----------|-----------|
| **Server** (`.env`) | `PORT` | Porta do servidor (padrão: 3000) |
| **Server** (`.env`) | `SUPABASE_URL` | URL do Projeto Supabase |
| **Server** (`.env`) | `SUPABASE_SERVICE_KEY` | Chave secreta `service_role` (Backend) |
| **Client** (`.env`) | `VITE_SUPABASE_URL` | URL do Projeto Supabase |
| **Client** (`.env`) | `VITE_SUPABASE_ANON_KEY` | Chave pública `anon` |
| **Client** (`.env`) | `VITE_API_URL` | URL da API do Backend (ex: `http://localhost:3000`) |

---

## 👨‍💻 Autor

Feito com 💜 por **[Rafael Fassina](https://www.linkedin.com/in/rafael-fassina-285316302)**

Se você gostou deste projeto, não esqueça de dar uma ⭐ no repositório!
