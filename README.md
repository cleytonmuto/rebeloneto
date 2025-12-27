# Sistema de Controle de Embarcações Hidroviárias

Sistema desenvolvido em React com TypeScript para controle de registro de embarcações hidroviárias, incluindo nome da embarcação, tipo de operação (embarque ou desembarque), data, horários e quantidade de passageiros.

## Funcionalidades

- 🔐 Autenticação OAuth2 com Google via Firebase
- 📊 Dashboard para registro e visualização de embarcações
- 👥 Sistema de perfis (admin/guest) armazenado no Firebase
- 💾 Persistência de dados no Google Firebase Firestore
- 📱 Interface responsiva e moderna

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Google Firebase

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative a autenticação com Google:
   - Vá em **Authentication** > **Sign-in method**
   - Habilite o provedor **Google**
4. Crie o Firestore Database:
   - Vá em **Firestore Database**
   - Crie o banco de dados em modo de produção ou teste
   - Configure as regras de segurança (veja abaixo)

### 3. Configurar variáveis de ambiente

1. Copie o arquivo `env.example` para `.env`:

```bash
cp env.example .env
```

2. Abra o arquivo `.env` e preencha com suas credenciais do Firebase:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

Para obter essas credenciais:
- No Firebase Console, vá em **Project Settings** (ícone de engrenagem)
- Role até **Your apps** e clique em **Web** (ícone `</>`)
- Copie os valores do objeto `firebaseConfig`

### 4. Configurar regras de segurança do Firestore

No Firebase Console, vá em **Firestore Database** > **Rules** e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção de usuários
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para a coleção de registros de embarcações
    match /vesselRecords/{recordId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.profile == 'admin');
    }
  }
}
```

### 5. Configurar perfis de usuário

Após o primeiro login de um usuário, você precisará configurar manualmente o perfil no Firestore:

1. No Firebase Console, vá em **Firestore Database**
2. Encontre a coleção `users`
3. Localize o documento do usuário (o ID é o UID do usuário autenticado)
4. Edite o campo `profile` e defina como `'admin'` ou `'guest'`
   - Por padrão, novos usuários são criados com perfil `'guest'`

## Executando o projeto

### Modo de desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

### Build para produção

```bash
npm run build
```

### Preview da build

```bash
npm run preview
```

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ProtectedRoute.tsx
│   ├── VesselForm.tsx
│   └── VesselList.tsx
├── config/             # Configurações
│   └── firebase.ts
├── contexts/           # Contextos React
│   └── AuthContext.tsx
├── pages/              # Páginas da aplicação
│   ├── Login.tsx
│   └── Dashboard.tsx
└── types/              # Definições de tipos TypeScript
    └── index.ts
```

## Uso

1. Acesse a aplicação
2. Faça login com sua conta Google
3. No dashboard, você pode:
   - Registrar novas embarcações com os dados solicitados
   - Visualizar todos os registros realizados
   - Ver informações do usuário logado e seu perfil

## Tecnologias Utilizadas

- React 19
- TypeScript
- Vite
- Firebase (Authentication e Firestore)
- React Router DOM

## Licença

Este projeto é de uso livre.
