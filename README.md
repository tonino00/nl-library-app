# nl-library-app
Sistema de gestão para biblioteca

# Sistema de Gerenciamento de Biblioteca - NL Library

## Descrição

O NL Library é um sistema completo de gerenciamento de biblioteca desenvolvido em React que automatiza a gestão de recursos e processos de uma biblioteca, como catalogação, empréstimos, devoluções e gerenciamento de usuários.

## Funcionalidades

- **Gerenciamento de Livros**: cadastro, edição, exclusão e busca de livros no acervo.
- **Gerenciamento de Categorias**: organização dos livros em categorias temáticas.
- **Gerenciamento de Usuários**: cadastro e controle de leitores, bibliotecários e administradores.
- **Gerenciamento de Empréstimos**: controle de empréstimos, renovações e devoluções.
- **Dashboard**: visualização de estatísticas e status da biblioteca.
- **Controle de Acesso**: diferentes níveis de permissão para usuários.

## Tecnologias Utilizadas

- React 19
- TypeScript
- Redux (com Redux Toolkit) para gerenciamento de estado
- React Router DOM para navegação
- Styled Components para estilização
- Axios para comunicação com o backend
- React Hook Form para gerenciamento de formulários
- React Icons para ícones
- React Toastify para notificações

## Pré-requisitos

- Node.js (versão 16 ou superior)
- NPM ou Yarn

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/nl-library-app.git
   ```

2. Acesse o diretório do projeto:
   ```bash
   cd nl-library-app
   ```

3. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

4. Crie um arquivo `.env` na raiz do projeto e adicione a URL da API do backend:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## Executando o Projeto

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   # ou
   yarn start
   ```

2. Acesse a aplicação no navegador:
   ```
   http://localhost:3000
   ```

## Estrutura do Projeto

```
/src
  /assets        # Recursos estáticos (imagens, ícones)
  /components    # Componentes reutilizáveis
    /ui          # Componentes de UI básicos (Button, Input, etc)
    /layout      # Componentes de layout (Header, Sidebar, etc)
    /auth        # Componentes relacionados à autenticação
  /features      # Módulos principais organizados por funcionalidade
    /auth        # Autenticação
    /livros      # Gerenciamento de livros
    /categorias  # Gerenciamento de categorias
    /usuarios    # Gerenciamento de usuários
    /emprestimos # Gerenciamento de empréstimos
  /hooks         # Hooks personalizados
  /pages         # Páginas da aplicação
  /routes        # Configuração de rotas
  /services      # Serviços para comunicação com a API
  /store         # Configuração do Redux
  /styles        # Estilos globais
  /types         # Definições de tipos
  /utils         # Funções utilitárias
```

## Backend API

A aplicação frontend se comunica com uma API RESTful implementando os seguintes endpoints:

- `/api/auth` - Autenticação de usuários
- `/api/livros` - CRUD de livros
- `/api/categorias` - CRUD de categorias
- `/api/usuarios` - CRUD de usuários
- `/api/emprestimos` - CRUD de empréstimos

## Níveis de Acesso

- **Leitor**: Pode visualizar livros e suas próprias informações de empréstimo.
- **Bibliotecário**: Pode gerenciar livros, categorias, usuários e empréstimos.
- **Administrador**: Acesso completo a todas as funcionalidades, incluindo configurações do sistema.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
