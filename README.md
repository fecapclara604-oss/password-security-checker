# 🛡️ Verificador de Segurança de Senhas & Lab de Conscientização

Um projeto web interativo desenvolvido em **Node.js, Express e SQLite**, projetado para avaliar a robustez de senhas, gerar versões blindadas baseadas na senha do usuário, persistir os dados no banco de dados e aplicar uma **lição prática de cibersegurança e prevenção contra Phishing**.

---

## 🚨 O Objetivo Educativo (Conscientização)

Muitos usuários caem em golpes de engenharia social ao digitar suas senhas reais em sites de testes ou formulários suspeitos na internet. 

Este projeto demonstra na prática o perigo:
1. O usuário digita sua senha para testar.
2. O sistema avalia a senha e gera uma versão ultra-segura baseada nela.
3. O sistema **salva a senha digitada no banco de dados SQLite local (`passwords.db`)**.
4. Imediatamente, um alerta enfático é disparado:
   > 🚨 **"NUNCA PASSE SUA SENHA PARA SITE ALGUM!"**
5. O usuário pode conferir na tabela abaixo exatamente como a senha foi interceptada e gravada no servidor, conscientizando sobre os riscos do Phishing.

---

## 🚀 Funcionalidades

- **⚡ Análise em Tempo Real:** Medidor dinâmico com pontuação, cores e verificação dos requisitos de segurança (comprimento, maiúsculas, minúsculas, números e caracteres especiais).
- **🧠 Gerador de Senha Blindada:** Cria uma senha com mais de 16 caracteres, alta entropia e padrão leetspeak inteligente mantendo a raiz mnemônica da senha do usuário.
- **💾 Persistência em SQLite:** Armazenamento automático das tentativas no banco de dados `passwords.db`.
- **🗄️ Painel de Registros:** Visualização em tempo real das credenciais interceptadas no SQLite e opção de limpar o histórico.
- **🎨 Interface Cyber Security:** Design moderno com Dark Mode, Glassmorphism, efeitos neon e responsividade para celular e computador.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- **Node.js** instalado (versão 18+ ou 24+)

### 1. Instalar as dependências:
```bash
npm install
```

### 2. Iniciar o servidor:
```bash
npm start
```

### 3. Acessar no navegador:
Abra seu navegador e acesse:
```
http://localhost:3000
```

---

## 🐙 Como Carregar no GitHub Desktop (Passo a Passo)

O repositório Git local já foi inicializado e preparado para você abrir diretamente no **GitHub Desktop**:

1. Abra o aplicativo **GitHub Desktop** no seu computador.
2. No menu superior, clique em **File** e selecione **Add Local Repository...** (ou pressione o atalho `Ctrl + O`).
3. No campo **Local Path**, cole o caminho da pasta do projeto:
   ```
   C:\Users\26012456\.gemini\antigravity\scratch\password-security-checker
   ```
4. Clique no botão azul **Add Repository**.
5. O projeto será carregado instantaneamente com todo o histórico de commits.
6. Para enviar para a sua conta do GitHub na nuvem, basta clicar no botão **Publish repository** no topo da janela do GitHub Desktop!

---

## 📂 Estrutura de Arquivos

```
password-security-checker/
├── server.js              # Servidor Express com rotas de API
├── database.js            # Conexão e queries SQLite
├── passwords.db           # Banco de dados SQLite local
├── package.json           # Dependências do Node.js
├── .gitignore             # Arquivos ignorados pelo Git
├── README.md              # Documentação completa
└── public/
    ├── index.html         # Estrutura HTML semântica
    ├── style.css          # Estilos Cyber / Glassmorphism
    └── app.js             # Lógica do frontend e integração com a API
```
